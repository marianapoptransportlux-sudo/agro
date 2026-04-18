const { createOpeningDocument, getConfig, listOpeningDocuments } = require("./storage");
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

async function listOpeningDocumentsHandler(_req, res) {
  try {
    const openingDocuments = await listOpeningDocuments();
    return sendJson(res, 200, { openingDocuments });
  } catch (error) {
    console.error("Failed to load opening documents:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca soldurile initiale." });
  }
}

async function createOpeningDocumentHandler(req, res) {
  const body = getBody(req);
  const actor = getActorLabel(req);

  try {
    const config = await getConfig();
    const validProducts = new Set(config.products.map((item) => item.name));
    const validLocations = new Set(config.storageLocations.map((item) => item.name));
    const validPartners = new Set(config.partners.map((item) => item.name));

    for (const item of body.stockItems || []) {
      if (!validProducts.has(item.product)) {
        return sendJson(res, 400, { error: `Produs invalid in sold initial: ${item.product}` });
      }

      if (!validLocations.has(item.location)) {
        return sendJson(res, 400, { error: `Locatie invalida in sold initial: ${item.location}` });
      }
    }

    for (const item of body.debtItems || []) {
      if (!validPartners.has(item.partner)) {
        return sendJson(res, 400, { error: `Partener invalid in datorii initiale: ${item.partner}` });
      }
    }

    const openingDocument = await createOpeningDocument({
      ...body,
      createdBy: actor
    });
    return sendJson(res, 201, openingDocument);
  } catch (error) {
    console.error("Failed to create opening document:", error.message);
    return sendJson(res, 400, { error: error.message || "Nu am putut salva soldul initial." });
  }
}

module.exports = {
  createOpeningDocumentHandler,
  listOpeningDocumentsHandler
};
