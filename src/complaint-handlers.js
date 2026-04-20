const {
  createComplaint,
  listComplaints,
  listDeliveries,
  updateComplaint
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

async function listComplaintsHandler(_req, res) {
  try {
    const complaints = await listComplaints();
    return sendJson(res, 200, { complaints });
  } catch (error) {
    console.error("Failed to load complaints:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca reclamatiile." });
  }
}

async function createComplaintHandler(req, res) {
  const body = getBody(req);
  const actor = getActorLabel(req);

  if (!body.deliveryId || !body.complaintType || !body.contestedQuantity) {
    return sendJson(res, 400, {
      error: "Campurile deliveryId, complaintType si contestedQuantity sunt obligatorii."
    });
  }

  try {
    const deliveries = await listDeliveries();
    const delivery = deliveries.find((item) => item.id === Number(body.deliveryId));

    if (!delivery) {
      return sendJson(res, 404, { error: "Livrarea nu a fost gasita." });
    }

    const complaint = await createComplaint({
      ...body,
      createdBy: actor
    });
    const response = sendJson(res, 201, complaint);
    triggerCriticalManagementAlert({
      trigger: "complaint-created",
      actor
    });
    return response;
  } catch (error) {
    console.error("Failed to create complaint:", error.message);
    return sendJson(res, 500, { error: error.message || "Nu am putut salva reclamatia." });
  }
}

async function updateComplaintHandler(req, res, id) {
  try {
    const complaint = await updateComplaint(id, {
      ...getBody(req),
      changedBy: getActorLabel(req),
      currentUser: req.currentUser || {},
      roleCode: req.currentUser?.roleCode || ""
    });

    if (!complaint) {
      return sendJson(res, 404, { error: "Reclamatia nu a fost gasita." });
    }

    const response = sendJson(res, 200, complaint);
    triggerCriticalManagementAlert({
      trigger: "complaint-updated",
      actor: getActorLabel(req)
    });
    return response;
  } catch (error) {
    console.error("Failed to update complaint:", error.message);
    const status = error.statusCode || 400;
    return sendJson(res, status, { error: error.message || "Nu am putut actualiza reclamatia." });
  }
}

module.exports = {
  createComplaintHandler,
  listComplaintsHandler,
  updateComplaintHandler
};
