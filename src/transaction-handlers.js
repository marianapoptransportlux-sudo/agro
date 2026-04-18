const {
  createTransaction,
  getConfig,
  listDeliveries,
  listOpeningDebtItems,
  listReceipts,
  listTransactions,
  updateTransaction
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

async function listTransactionsHandler(_req, res) {
  try {
    const transactions = await listTransactions();
    return sendJson(res, 200, { transactions });
  } catch (error) {
    console.error("Failed to load transactions:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca tranzactiile." });
  }
}

async function createTransactionHandler(req, res) {
  const body = getBody(req);
  const actor = getActorLabel(req);
  const referenceType =
    body.referenceType === "delivery"
      ? "delivery"
      : body.referenceType === "opening-debt"
        ? "opening-debt"
        : "receipt";

  if (
    (!body.receiptId && referenceType === "receipt") ||
    (!body.deliveryId && referenceType === "delivery") ||
    (!body.openingDebtId && referenceType === "opening-debt") ||
    !body.amount
  ) {
    return sendJson(res, 400, {
      error: "Campurile de referinta si amount sunt obligatorii."
    });
  }

  try {
    const [receipts, deliveries, openingDebtItems, config] = await Promise.all([
      listReceipts(),
      listDeliveries(),
      listOpeningDebtItems(),
      getConfig()
    ]);

    const paymentType = config.paymentTypes.find((item) => item.name === body.paymentType && item.active);

    if (body.paymentType && !paymentType) {
      return sendJson(res, 400, { error: "Tipul de plata selectat nu este valid." });
    }

    const normalizedAmount = Number(body.amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return sendJson(res, 400, { error: "Suma trebuie sa fie mai mare ca zero." });
    }

    let direction =
      body.direction === "collection"
        ? "collection"
        : body.direction === "payment"
          ? "payment"
          : referenceType === "delivery"
            ? "collection"
            : "payment";
    let referencePayload = null;

    if (referenceType === "receipt") {
      const receipt = receipts.find((item) => item.id === Number(body.receiptId));

      if (!receipt) {
        return sendJson(res, 404, { error: "Receptia nu a fost gasita." });
      }

      referencePayload = {
        referenceType,
        receiptId: body.receiptId,
        partnerId: receipt.supplierId,
        partner: receipt.supplier
      };
    } else if (referenceType === "delivery") {
      const delivery = deliveries.find((item) => item.id === Number(body.deliveryId));

      if (!delivery) {
        return sendJson(res, 404, { error: "Livrarea nu a fost gasita." });
      }

      referencePayload = {
        referenceType,
        deliveryId: body.deliveryId,
        partnerId: delivery.customerId,
        partner: delivery.customer
      };
    } else {
      const openingDebt = openingDebtItems.find((item) => item.openingDebtId === body.openingDebtId);

      if (!openingDebt) {
        return sendJson(res, 404, { error: "Datoria initiala nu a fost gasita." });
      }

      referencePayload = {
        referenceType,
        openingDebtId: body.openingDebtId,
        partnerId: openingDebt.partnerId,
        partner: openingDebt.partner
      };
      direction = openingDebt.direction === "collection" ? "collection" : "payment";
    }

    const transaction = await createTransaction({
      ...referencePayload,
      direction,
      amount: normalizedAmount,
      paymentType: body.paymentType || "",
      note: body.note || "",
      createdBy: actor
    });

    const response = sendJson(res, 201, transaction);
    triggerCriticalManagementAlert({
      trigger: "transaction-created",
      actor
    });
    return response;
  } catch (error) {
    console.error("Failed to create transaction:", error.message);
    return sendJson(res, 500, { error: "Nu am putut salva tranzactia." });
  }
}

async function updateTransactionHandler(req, res, id) {
  try {
    const config = await getConfig();
    if (req.body?.paymentType) {
      const paymentType = config.paymentTypes.find(
        (item) => item.name === req.body.paymentType && item.active
      );

      if (!paymentType) {
        return sendJson(res, 400, { error: "Tipul de plata selectat nu este valid." });
      }
    }

    const transaction = await updateTransaction(id, {
      ...getBody(req),
      changedBy: getActorLabel(req)
    });

    if (!transaction) {
      return sendJson(res, 404, { error: "Tranzactia nu a fost gasita." });
    }

    const response = sendJson(res, 200, transaction);
    triggerCriticalManagementAlert({
      trigger: "transaction-updated",
      actor: getActorLabel(req)
    });
    return response;
  } catch (error) {
    console.error("Failed to update transaction:", error.message);
    return sendJson(res, 400, { error: error.message || "Nu am putut actualiza tranzactia." });
  }
}

module.exports = {
  createTransactionHandler,
  listTransactionsHandler,
  updateTransactionHandler
};
