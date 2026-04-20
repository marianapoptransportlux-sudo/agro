const {
  getDailyReport,
  getStats,
  getStockSummary,
  listAuditLogs,
  listComplaints,
  listDeliveries,
  listPartnerAdvances,
  listReceipts,
  listTransactions
} = require("./storage");

function sendJson(res, statusCode, payload) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function getDailyReportHandler(req, res) {
  try {
    const dateValue =
      String(req.query?.date || "").trim() || new Date().toISOString().slice(0, 10);
    const report = await getDailyReport(dateValue);
    return sendJson(res, 200, report);
  } catch (error) {
    console.error("Failed to load daily report:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca raportul zilnic." });
  }
}

function sumOutstandingPayments(receipts) {
  return receipts.reduce((sum, item) => {
    const target = Number(item.preliminaryPayableAmount || 0);
    const paid = Number(item.paidAmount || 0);
    return sum + Math.max(target - paid, 0);
  }, 0);
}

function sumOutstandingCollections(deliveries) {
  return deliveries.reduce((sum, item) => {
    const target = Number(item.contractPrice || 0) * Number(item.deliveredQuantity || 0);
    const collected = Number(item.collectedAmount || 0);
    return sum + Math.max(target - collected, 0);
  }, 0);
}

async function getDashboardHandler(req, res) {
  try {
    const today = String(req.query?.date || "").trim() || new Date().toISOString().slice(0, 10);
    const [receipts, deliveries, complaints, advances, stockSummary, stats, dailyReport] =
      await Promise.all([
        listReceipts(),
        listDeliveries(),
        listComplaints(),
        listPartnerAdvances(),
        getStockSummary(),
        getStats(),
        getDailyReport(today)
      ]);

    const openComplaints = complaints.filter((item) => item.status === "Deschisa").length;
    const outstandingPayments = sumOutstandingPayments(receipts);
    const outstandingCollections = sumOutstandingCollections(deliveries);
    const totalAdvances = (advances || []).reduce(
      (sum, item) => sum + Number(item.remainingAmount || 0),
      0
    );

    return sendJson(res, 200, {
      date: today,
      stock: {
        totalQuantity: stockSummary.totals.totalQuantity,
        locations: stockSummary.totals.totalLocations,
        products: stockSummary.totals.totalProducts,
        byLocation: stockSummary.byLocation
      },
      financial: {
        outstandingPayments,
        outstandingCollections,
        totalAdvances,
        paymentsTotalToday: dailyReport.summary.paymentsTotal,
        collectionsTotalToday: dailyReport.summary.collectionsTotal
      },
      activity: {
        receiptsToday: dailyReport.summary.receiptsCount,
        grossQuantityToday: dailyReport.summary.grossQuantity,
        processedQuantityToday: dailyReport.summary.processedQuantity,
        deliveredQuantityToday: dailyReport.summary.deliveredQuantity || 0
      },
      alerts: {
        openComplaints,
        auditEntriesLast24h: stats.audit?.recentAuditLogs || 0
      }
    });
  } catch (error) {
    console.error("Failed to load dashboard:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca dashboard-ul." });
  }
}

function escapeCsv(value) {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(rows, columns) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return columns.join(",") + "\n";
  }
  const header = columns.join(",");
  const body = rows
    .map((row) => columns.map((col) => escapeCsv(row[col])).join(","))
    .join("\n");
  return `${header}\n${body}\n`;
}

const EXPORT_RESOURCES = {
  receipts: {
    load: listReceipts,
    columns: [
      "id", "createdAt", "supplier", "product", "quantity",
      "grossWeight", "tareWeight", "netWeight",
      "humidity", "impurity",
      "preliminaryPayableAmount", "paidAmount", "paymentStatus",
      "reservedQuantity", "deliveredQuantity", "availableQuantity",
      "status", "deliveryStatus", "hasOpenComplaint", "location"
    ]
  },
  deliveries: {
    load: listDeliveries,
    columns: [
      "id", "createdAt", "receiptId", "customer", "product",
      "plannedQuantity", "deliveredQuantity",
      "grossWeight", "tareWeight", "netWeight",
      "contractNumber", "contractPrice", "status", "invoiceNumber",
      "collectedAmount", "collectionStatus", "complaintStatus"
    ]
  },
  transactions: {
    load: listTransactions,
    columns: [
      "id", "createdAt", "referenceType", "receiptId", "deliveryId",
      "partner", "direction", "amount", "appliedAmount", "advanceAmount",
      "source", "paymentType", "status", "note"
    ]
  },
  complaints: {
    load: listComplaints,
    columns: [
      "id", "createdAt", "deliveryId", "customer", "product",
      "contestedQuantity", "complaintType", "status",
      "resolutionType", "acceptedAt", "closedAt", "note"
    ]
  },
  "audit-logs": {
    load: listAuditLogs,
    columns: ["id", "createdAt", "entityType", "entityId", "action", "user", "reason"]
  },
  "partner-advances": {
    load: listPartnerAdvances,
    columns: ["id", "createdAt", "partner", "partnerId", "transactionId", "amount", "remainingAmount", "source"]
  }
};

async function exportResourceHandler(req, res, resource) {
  const config = EXPORT_RESOURCES[resource];
  if (!config) {
    return sendJson(res, 404, { error: "Resursa necunoscuta." });
  }
  try {
    const rows = await config.load();
    const csv = toCsv(rows, config.columns);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${resource}-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    res.end(csv);
    return;
  } catch (error) {
    console.error(`Failed to export ${resource}:`, error.message);
    return sendJson(res, 500, { error: "Nu am putut genera export-ul." });
  }
}

async function getReceiptDefaultsHandler(req, res) {
  const supplierId = Number(req.query?.supplierId);
  const productId = req.query?.productId ? Number(req.query.productId) : null;
  if (!Number.isFinite(supplierId) || supplierId <= 0) {
    return sendJson(res, 400, { error: "supplierId este obligatoriu." });
  }
  try {
    const receipts = await listReceipts();
    const match = receipts.find(
      (item) =>
        item.supplierId === supplierId &&
        (productId === null || item.productId === productId)
    );
    if (!match) {
      return sendJson(res, 200, { defaults: null });
    }
    return sendJson(res, 200, {
      defaults: {
        supplierId: match.supplierId,
        productId: match.productId,
        price: match.price,
        humidity: match.humidity,
        impurity: match.impurity,
        locationId: match.locationId,
        unit: match.unit,
        vehicle: match.vehicle
      },
      sourceReceiptId: match.id,
      sourceCreatedAt: match.createdAt
    });
  } catch (error) {
    console.error("Failed to load receipt defaults:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca valorile implicite." });
  }
}

async function getDeliveryDefaultsHandler(req, res) {
  const customerId = Number(req.query?.customerId);
  if (!Number.isFinite(customerId) || customerId <= 0) {
    return sendJson(res, 400, { error: "customerId este obligatoriu." });
  }
  try {
    const deliveries = await listDeliveries();
    const match = deliveries.find((item) => item.customerId === customerId);
    if (!match) {
      return sendJson(res, 200, { defaults: null });
    }
    return sendJson(res, 200, {
      defaults: {
        customerId: match.customerId,
        receiptId: match.receiptId,
        vehicle: match.vehicle,
        contractNumber: match.contractNumber,
        contractPrice: match.contractPrice,
        product: match.product
      },
      sourceDeliveryId: match.id,
      sourceCreatedAt: match.createdAt
    });
  } catch (error) {
    console.error("Failed to load delivery defaults:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca valorile implicite." });
  }
}

module.exports = {
  exportResourceHandler,
  getDailyReportHandler,
  getDashboardHandler,
  getDeliveryDefaultsHandler,
  getReceiptDefaultsHandler
};
