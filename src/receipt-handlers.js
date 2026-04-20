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

function findTariffValue({ tariffs, service, productName, partnerName, fiscalProfileName, referenceDate }) {
  const normalizedService = String(service || "").trim().toLowerCase();
  const normalizedProduct = String(productName || "").trim().toLowerCase();
  const normalizedPartner = String(partnerName || "").trim().toLowerCase();
  const normalizedFiscal = String(fiscalProfileName || "").trim().toLowerCase();
  const referenceDay = String(referenceDate || new Date().toISOString().slice(0, 10));

  const eligible = (tariffs || []).filter((item) => {
    if (!item || item.active === false) {
      return false;
    }

    if (String(item.service || "").trim().toLowerCase() !== normalizedService) {
      return false;
    }

    if (item.validFrom && String(item.validFrom) > referenceDay) {
      return false;
    }

    return true;
  });

  const matches = (tariffField, normalizedValue) => {
    const normalized = String(tariffField || "").trim().toLowerCase();
    return normalized === normalizedValue || normalized === "general" || normalized === "";
  };

  const scoreOf = (item) => {
    let score = 0;
    const product = String(item.product || "").trim().toLowerCase();
    const partner = String(item.partner || "").trim().toLowerCase();
    const fiscal = String(item.fiscalProfile || "").trim().toLowerCase();

    if (product && product !== "general" && product === normalizedProduct) score += 4;
    if (partner && partner !== "general" && partner === normalizedPartner) score += 2;
    if (fiscal && fiscal !== "general" && fiscal === normalizedFiscal) score += 1;
    return score;
  };

  const filtered = eligible.filter(
    (item) =>
      matches(item.product, normalizedProduct) &&
      matches(item.partner, normalizedPartner) &&
      matches(item.fiscalProfile, normalizedFiscal)
  );

  if (!filtered.length) {
    return 0;
  }

  filtered.sort((left, right) => {
    const scoreDiff = scoreOf(right) - scoreOf(left);
    if (scoreDiff !== 0) {
      return scoreDiff;
    }
    return String(right.validFrom || "").localeCompare(String(left.validFrom || ""));
  });

  return Number(filtered[0].value || 0);
}

function computeReceiptEstimate({ quantity, price, humidity, impurity, product, tariffs, fiscalProfile, partner, referenceDate }) {
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

  const tariffLookup = {
    tariffs,
    productName: product?.name,
    partnerName: partner?.name,
    fiscalProfileName: fiscalProfile?.name,
    referenceDate
  };
  const cleaningTariff = findTariffValue({ ...tariffLookup, service: "curatire" });
  const dryingTariff = findTariffValue({ ...tariffLookup, service: "uscare" });

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
      partner,
      tariffs: config.tariffs,
      fiscalProfile,
      referenceDate: new Date().toISOString().slice(0, 10)
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
