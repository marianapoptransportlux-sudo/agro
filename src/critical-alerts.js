const {
  appendAuditLog,
  getConfig,
  getDailyReport,
  listAuditLogs,
  listComplaints,
  listDeliveries,
  listOpeningDebtItems,
  listReceipts
} = require("./storage");
const { sendTelegramMessagesToAudience, isBotReady } = require("./bot");
const {
  buildCriticalAlertMessages,
  getManagementSnapshot,
  getManagementStatus
} = require("./management-report");
const { getCriticalAlertState, updateCriticalAlertState } = require("./automation-state");

const CRITICAL_ALERT_COOLDOWN_MS = 30 * 60 * 1000;

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function parseAudience(reportAudience) {
  return String(reportAudience || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function buildCriticalFingerprint(snapshot) {
  return JSON.stringify({
    date: snapshot.report.date,
    status: getManagementStatus(snapshot).label,
    receiptsWithoutPrice: snapshot.problems.receiptsWithoutPrice.length,
    deliveriesWithoutInvoice: snapshot.problems.deliveriesWithoutInvoice.length,
    openComplaints: snapshot.problems.openComplaints.length,
    totalOpenDocuments: snapshot.problems.totalOpenDocuments,
    totalPayables: Math.round(Number(snapshot.financials.totalPayables || 0)),
    totalReceivables: Math.round(Number(snapshot.financials.totalReceivables || 0)),
    topReceiptWithoutPriceId: snapshot.problems.receiptsWithoutPrice[0]?.id || 0,
    topDeliveryWithoutInvoiceId: snapshot.problems.deliveriesWithoutInvoice[0]?.id || 0,
    topComplaintId: snapshot.problems.openComplaints[0]?.id || 0
  });
}

function shouldSendCriticalAlert(previousState, nextStatus, fingerprint) {
  if (nextStatus.label !== "CRITIC") {
    return false;
  }

  if (previousState.lastStatus !== "CRITIC") {
    return true;
  }

  if (previousState.lastFingerprint === fingerprint) {
    return false;
  }

  const lastAlertAtMs = Date.parse(previousState.lastAlertAt || "");
  if (!Number.isFinite(lastAlertAtMs)) {
    return true;
  }

  return Date.now() - lastAlertAtMs >= CRITICAL_ALERT_COOLDOWN_MS;
}

async function loadManagementSnapshot(dateValue) {
  const [report, receipts, deliveries, complaints, auditLogs, openingDebtItems] = await Promise.all([
    getDailyReport(dateValue),
    listReceipts(),
    listDeliveries(),
    listComplaints(),
    listAuditLogs(),
    listOpeningDebtItems()
  ]);

  return getManagementSnapshot({
    report,
    receipts,
    deliveries,
    complaints,
    auditLogs,
    openingDebtItems,
    dateValue
  });
}

async function maybeSendCriticalManagementAlert(options = {}) {
  const dateValue = String(options.dateValue || todayDateValue()).trim();
  const trigger = String(options.trigger || "system").trim() || "system";
  const actor = String(options.actor || "sistem").trim() || "sistem";
  const config = await getConfig();
  const settings = config.systemSettings || {};
  const reportChannel = String(settings.reportChannel || "").trim().toLowerCase();
  const audience = parseAudience(settings.reportAudience);

  if (reportChannel !== "telegram" || !audience.length || !isBotReady()) {
    return {
      checked: false,
      sent: false,
      reason: !isBotReady() ? "bot-not-ready" : !audience.length ? "empty-audience" : "channel-not-telegram"
    };
  }

  const snapshot = await loadManagementSnapshot(dateValue);
  const status = getManagementStatus(snapshot);
  const fingerprint = buildCriticalFingerprint(snapshot);
  const previousState = getCriticalAlertState(dateValue);
  const nextStatePayload = {
    lastStatus: status.label,
    lastFingerprint: fingerprint,
    lastEvaluatedAt: new Date().toISOString(),
    lastTrigger: trigger,
    lastReason: status.reason
  };

  if (!shouldSendCriticalAlert(previousState, status, fingerprint)) {
    updateCriticalAlertState(dateValue, nextStatePayload);
    return {
      checked: true,
      sent: false,
      reason: status.label === "CRITIC" ? "already-alerted" : "status-not-critical",
      status: status.label
    };
  }

  const messages = buildCriticalAlertMessages(snapshot, { trigger, actor });
  const sentCount = await sendTelegramMessagesToAudience(audience, messages);

  if (sentCount > 0) {
    updateCriticalAlertState(dateValue, {
      ...nextStatePayload,
      lastAlertAt: new Date().toISOString(),
      recipients: sentCount
    });

    await appendAuditLog({
      entityType: "automation",
      entityId: 1,
      action: "critical-alert-sent",
      reason: `Alerta critica Telegram: ${trigger}`,
      user: actor,
      newValue: {
        date: dateValue,
        trigger,
        status: status.label,
        recipients: sentCount
      }
    });

    return {
      checked: true,
      sent: true,
      reason: "sent",
      status: status.label,
      recipients: sentCount
    };
  }

  updateCriticalAlertState(dateValue, nextStatePayload);
  return {
    checked: true,
    sent: false,
    reason: "no-linked-recipients",
    status: status.label,
    recipients: 0
  };
}

function triggerCriticalManagementAlert(options = {}) {
  void maybeSendCriticalManagementAlert(options).catch((error) => {
    console.error("Critical management alert failed:", error.message);
  });
}

module.exports = {
  maybeSendCriticalManagementAlert,
  triggerCriticalManagementAlert
};
