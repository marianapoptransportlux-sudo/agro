const {
  createProcessing,
  getConfig,
  listProcessings,
  listReceipts,
  updateProcessing
} = require("./storage");
const { getActorLabel } = require("./auth");

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

async function listProcessingsHandler(_req, res) {
  try {
    const processings = await listProcessings();
    return sendJson(res, 200, { processings });
  } catch (error) {
    console.error("Failed to load processings:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca procesarile." });
  }
}

async function createProcessingHandler(req, res) {
  const body = getBody(req);
  const actor = getActorLabel(req);

  if (!body.receiptId || !body.processingType || !body.processedQuantity) {
    return sendJson(res, 400, {
      error: "Campurile receiptId, processingType si processedQuantity sunt obligatorii."
    });
  }

  try {
    const [receipts, config] = await Promise.all([listReceipts(), getConfig()]);
    const receipt = receipts.find((item) => item.id === Number(body.receiptId));

    if (!receipt) {
      return sendJson(res, 404, { error: "Receptia nu a fost gasita." });
    }

    const processingType = config.processingTypes.find(
      (item) => item.name === body.processingType && item.active
    );

    if (!processingType) {
      return sendJson(res, 400, { error: "Tipul de procesare nu este valid." });
    }

    const processedQuantity = Number(body.processedQuantity || 0);
    const confirmedWaste = Number(body.confirmedWaste || 0);
    const finalNetQuantity = Math.max(processedQuantity - confirmedWaste, 0);

    const processing = await createProcessing({
      ...body,
      product: receipt.product,
      sourceLocation: receipt.location,
      createdBy: actor,
      finalNetQuantity
    });

    return sendJson(res, 201, processing);
  } catch (error) {
    console.error("Failed to create processing:", error.message);
    return sendJson(res, 500, { error: "Nu am putut salva procesarea." });
  }
}

async function updateProcessingHandler(req, res, id) {
  try {
    const processing = await updateProcessing(id, {
      ...getBody(req),
      changedBy: getActorLabel(req)
    });

    if (!processing) {
      return sendJson(res, 404, { error: "Procesarea nu a fost gasita." });
    }

    return sendJson(res, 200, processing);
  } catch (error) {
    console.error("Failed to update processing:", error.message);
    return sendJson(res, 400, { error: error.message || "Nu am putut actualiza procesarea." });
  }
}

module.exports = {
  createProcessingHandler,
  listProcessingsHandler,
  updateProcessingHandler
};
