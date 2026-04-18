const {
  createReceipt,
  getConfig,
  getStats,
  listReceipts,
  storageDriver,
  updateReceiptStatusWithAudit
} = require("./storage");
const { getActorLabel } = require("./auth");
const { triggerCriticalManagementAlert } = require("./critical-alerts");

function sendJson(res, statusCode, payload) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function getBody(req) {
  return req.body || {};
}

function computeReceiptEstimate({ quantity, price, humidity, impurity, product, tariffs, fiscalProfile }) {
  const grossQuantity = Number(quantity);
  const unitPrice = Number(price);
  const humidityNorm = Number(product.humidityNorm || 0);
  const impurityNorm = Number(product.impurityNorm || 0);
  const actualHumidity = Number(humidity || 0);
  const actualImpurity = Number(impurity || 0);
  const excessHumidity = Math.max(actualHumidity - humidityNorm, 0);
  const excessImpurity = Math.max(actualImpurity - impurityNorm, 0);
  const estimatedWaterLoss = grossQuantity * (excessHumidity / 100);
  const estimatedImpurityLoss = grossQuantity * (excessImpurity / 100);
  const provisionalNetQuantity = Math.max(
    grossQuantity - estimatedWaterLoss - estimatedImpurityLoss,
    0
  );

  const cleaningTariff =
    tariffs.find((item) => item.service.toLowerCase() === "curatire" && item.active)?.value || 0;
  const dryingTariff =
    tariffs.find((item) => item.service.toLowerCase() === "uscare" && item.active)?.value || 0;

  const cleaningServiceTotal = grossQuantity * Number(cleaningTariff || 0);
  const dryingServiceTotal = grossQuantity * excessHumidity * Number(dryingTariff || 0);
  const preliminaryServicesTotal = cleaningServiceTotal + dryingServiceTotal;
  const preliminaryMerchandiseValue = provisionalNetQuantity * unitPrice;
  const preliminaryBeforeWithholding = Math.max(
    preliminaryMerchandiseValue - preliminaryServicesTotal,
    0
  );
  const withholdingPercent = Number(fiscalProfile?.withholdingPercent || 0);
  const withholdingAmount = preliminaryBeforeWithholding * (withholdingPercent / 100);
  const preliminaryPayableAmount = Math.max(
    preliminaryBeforeWithholding - withholdingAmount,
    0
  );

  return {
    grossQuantity,
    humidity: actualHumidity,
    impurity: actualImpurity,
    humidityNorm,
    impurityNorm,
    excessHumidity,
    excessImpurity,
    estimatedWaterLoss,
    estimatedImpurityLoss,
    provisionalNetQuantity,
    cleaningServiceTotal,
    dryingServiceTotal,
    preliminaryServicesTotal,
    preliminaryMerchandiseValue,
    withholdingPercent,
    withholdingAmount,
    preliminaryPayableAmount
  };
}

async function healthHandler(_req, res) {
  return sendJson(res, 200, { ok: true, storage: storageDriver });
}

async function listReceiptsHandler(_req, res) {
  try {
    const [receipts, stats] = await Promise.all([listReceipts(), getStats()]);

    return sendJson(res, 200, {
      receipts,
      stats
    });
  } catch (error) {
    console.error("Failed to load receipts:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca receptiile." });
  }
}

async function createReceiptHandler(req, res) {
  const body = getBody(req);
  const actor = getActorLabel(req);
  const { quantity, price, humidity, impurity } = body;

  if (!body.supplierId || !body.productId || quantity === undefined || quantity === "") {
    return sendJson(res, 400, {
      error: "Campurile supplierId, productId si quantity sunt obligatorii."
    });
  }

  try {
    const config = await getConfig();
    const partner = config.partners.find((item) => item.id === Number(body.supplierId));
    const product = config.products.find((item) => item.id === Number(body.productId));
    const location = body.locationId
      ? config.storageLocations.find((item) => item.id === Number(body.locationId))
      : null;
    const fiscalProfile = config.fiscalProfiles.find(
      (item) => item.name === partner?.fiscalProfile
    );

    if (!partner) {
      return sendJson(res, 400, { error: "Furnizorul selectat nu exista." });
    }

    if (!product) {
      return sendJson(res, 400, { error: "Produsul selectat nu exista." });
    }

    if (location === null && body.locationId) {
      return sendJson(res, 400, { error: "Locatia selectata nu exista." });
    }

    const normalizedQuantity = Number(quantity);
    const normalizedPrice =
      price === undefined || price === null || price === "" ? 0 : Number(price);
    const normalizedHumidity =
      humidity === undefined || humidity === null || humidity === ""
        ? Number(product.humidityNorm || 0)
        : Number(humidity);
    const normalizedImpurity =
      impurity === undefined || impurity === null || impurity === ""
        ? Number(product.impurityNorm || 0)
        : Number(impurity);

    if (!Number.isFinite(normalizedQuantity) || normalizedQuantity <= 0) {
      return sendJson(res, 400, { error: "Cantitatea trebuie sa fie mai mare ca zero." });
    }

    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      return sendJson(res, 400, { error: "Pretul nu poate fi negativ." });
    }

    if (!Number.isFinite(normalizedHumidity) || normalizedHumidity < 0) {
      return sendJson(res, 400, { error: "Umiditatea trebuie sa fie o valoare valida." });
    }

    if (!Number.isFinite(normalizedImpurity) || normalizedImpurity < 0) {
      return sendJson(res, 400, { error: "Impuritatile trebuie sa fie o valoare valida." });
    }

    const estimate = computeReceiptEstimate({
      quantity: normalizedQuantity,
      price: normalizedPrice,
      humidity: normalizedHumidity,
      impurity: normalizedImpurity,
      product,
      tariffs: config.tariffs,
      fiscalProfile
    });

    const receipt = await createReceipt({
      ...body,
      quantity: normalizedQuantity,
      price: normalizedPrice,
      supplier: partner.name,
      product: product.name,
      unit: product.unit,
      location: location?.name || "",
      ...estimate,
      createdBy: actor,
      source: body.source || "dashboard",
      status: body.status || "Draft"
    });

    const response = sendJson(res, 201, receipt);
    triggerCriticalManagementAlert({
      trigger: "receipt-created",
      actor
    });
    return response;
  } catch (error) {
    console.error("Failed to create receipt:", error.message);
    return sendJson(res, 500, { error: "Nu am putut salva receptia." });
  }
}

async function updateReceiptStatusHandler(req, res, id) {
  const body = getBody(req);

  try {
    const receipt = await updateReceiptStatusWithAudit(id, body.status, {
      ...body,
      changedBy: getActorLabel(req)
    });

    if (!receipt) {
      return sendJson(res, 404, { error: "Receptia nu a fost gasita." });
    }

    const response = sendJson(res, 200, receipt);
    triggerCriticalManagementAlert({
      trigger: "receipt-status-updated",
      actor: getActorLabel(req)
    });
    return response;
  } catch (error) {
    console.error("Failed to update receipt status:", error.message);
    return sendJson(res, 500, { error: "Nu am putut actualiza statusul." });
  }
}

module.exports = {
  createReceiptHandler,
  healthHandler,
  listReceiptsHandler,
  updateReceiptStatusHandler
};
