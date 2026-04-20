const {
  createDelivery,
  getConfig,
  listDeliveries,
  listReceipts,
  transitionDelivery,
  updateDelivery
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

async function listDeliveriesHandler(_req, res) {
  try {
    const deliveries = await listDeliveries();
    return sendJson(res, 200, { deliveries });
  } catch (error) {
    console.error("Failed to load deliveries:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca livrarile." });
  }
}

async function createDeliveryHandler(req, res) {
  const body = getBody(req);
  const actor = getActorLabel(req);

  const plannedQuantity = body.plannedQuantity ?? body.deliveredQuantity;
  if (!body.receiptId || !body.customerId || !plannedQuantity) {
    return sendJson(res, 400, {
      error: "Campurile receiptId, customerId si plannedQuantity sunt obligatorii."
    });
  }

  try {
    const [receipts, config] = await Promise.all([listReceipts(), getConfig()]);
    const receipt = receipts.find((item) => item.id === Number(body.receiptId));
    const customer = config.partners.find((item) => item.id === Number(body.customerId));

    if (!receipt) {
      return sendJson(res, 404, { error: "Receptia nu a fost gasita." });
    }

    if (!customer) {
      return sendJson(res, 400, { error: "Cumparatorul selectat nu exista." });
    }

    const delivery = await createDelivery({
      ...body,
      plannedQuantity,
      createdBy: actor,
      customer: customer.name
    });

    const response = sendJson(res, 201, delivery);
    triggerCriticalManagementAlert({
      trigger: "delivery-created",
      actor
    });
    return response;
  } catch (error) {
    console.error("Failed to create delivery:", error.message);
    return sendJson(res, 400, { error: error.message || "Nu am putut salva livrarea." });
  }
}

async function updateDeliveryHandler(req, res, id) {
  try {
    const delivery = await updateDelivery(id, {
      ...getBody(req),
      changedBy: getActorLabel(req)
    });

    if (!delivery) {
      return sendJson(res, 404, { error: "Livrarea nu a fost gasita." });
    }

    const response = sendJson(res, 200, delivery);
    triggerCriticalManagementAlert({
      trigger: "delivery-updated",
      actor: getActorLabel(req)
    });
    return response;
  } catch (error) {
    console.error("Failed to update delivery:", error.message);
    return sendJson(res, 400, { error: error.message || "Nu am putut actualiza livrarea." });
  }
}

async function transitionDeliveryHandler(req, res, id, newStatus) {
  const body = getBody(req);
  const actor = getActorLabel(req);

  try {
    const delivery = await transitionDelivery(id, newStatus, {
      ...body,
      changedBy: actor,
      currentUser: req.currentUser || {}
    });

    if (!delivery) {
      return sendJson(res, 404, { error: "Livrarea nu a fost gasita." });
    }

    const response = sendJson(res, 200, delivery);
    triggerCriticalManagementAlert({
      trigger: `delivery-${newStatus.toLowerCase()}`,
      actor
    });
    return response;
  } catch (error) {
    console.error(`Failed to transition delivery to ${newStatus}:`, error.message);
    const status = error.statusCode || 400;
    return sendJson(res, status, { error: error.message || "Nu am putut actualiza livrarea." });
  }
}

module.exports = {
  createDeliveryHandler,
  listDeliveriesHandler,
  transitionDeliveryHandler,
  updateDeliveryHandler
};
