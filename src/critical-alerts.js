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
const {
  createDefaultCriticalAlertEscalation,
  getCriticalAlertState,
  getTelegramLinksForUsernames,
  listCriticalAlertStates,
  resetCriticalAlertActions,
  updateCriticalAlertState
} = require("./automation-state");

const CRITICAL_ALERT_COOLDOWN_MS = 30 * 60 * 1000;
const CRITICAL_ALERT_ESCALATION_MS = 15 * 60 * 1000;

let escalationMonitorInterval = null;

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function parseAudience(reportAudience) {
  return String(reportAudience || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function getCriticalAlertWorkflowStatus(alertState) {
  if (Object.keys(alertState.actions?.resolvedBy || {}).length) {
    return "Rezolvata";
  }

  if (Object.keys(alertState.actions?.inProgressBy || {}).length) {
    return "In lucru";
  }

  if (Object.keys(alertState.actions?.viewedBy || {}).length) {
    return "Vazuta";
  }

  if (alertState.escalation?.escalatedAt) {
    return "Escalata";
  }

  if (alertState.lastStatus === "CRITIC") {
    return "Fara raspuns";
  }

  return "Monitorizare";
}

function formatActors(actionMap = {}) {
  const entries = Object.entries(actionMap)
    .filter(([, timestamp]) => Boolean(timestamp))
    .sort((left, right) => String(left[1]).localeCompare(String(right[1])))
    .slice(0, 6);

  if (!entries.length) {
    return "";
  }

  return entries
    .map(([username, timestamp]) => `${username} ${String(timestamp).replace("T", " ").slice(0, 16)}`)
    .join(" | ");
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

function hasCriticalAlertResponse(alertState) {
  return Boolean(
    Object.keys(alertState.actions?.viewedBy || {}).length ||
      Object.keys(alertState.actions?.inProgressBy || {}).length ||
      Object.keys(alertState.actions?.resolvedBy || {}).length
  );
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
      recipients: sentCount,
      actions:
        previousState.lastFingerprint !== fingerprint || previousState.lastStatus !== "CRITIC"
          ? resetCriticalAlertActions()
          : previousState.actions,
      escalation:
        previousState.lastFingerprint !== fingerprint || previousState.lastStatus !== "CRITIC"
          ? createDefaultCriticalAlertEscalation()
          : previousState.escalation
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

function buildEscalationMessages(alertState) {
  return [
    `ESCALADARE alerta critica ${alertState.date}`,
    `Nimeni nu a marcat alerta ca vazuta, in lucru sau rezolvata in ${Math.round(CRITICAL_ALERT_ESCALATION_MS / 60000)} minute.`,
    `Ultima alerta: ${String(alertState.lastAlertAt || "").replace("T", " ").slice(0, 16)} | motiv: ${alertState.lastReason || "-"}`,
    { criticalAlertDate: alertState.date }
  ];
}

async function maybeEscalateCriticalAlerts() {
  const config = await getConfig();
  const settings = config.systemSettings || {};
  const reportChannel = String(settings.reportChannel || "").trim().toLowerCase();
  const audience = parseAudience(settings.reportAudience);

  if (reportChannel !== "telegram" || !audience.length || !isBotReady()) {
    return { checked: false, escalated: 0, reason: "not-ready" };
  }

  let escalated = 0;
  for (const alertState of listCriticalAlertStates()) {
    if (alertState.lastStatus !== "CRITIC" || !alertState.lastAlertAt || hasCriticalAlertResponse(alertState)) {
      continue;
    }

    const lastAlertAtMs = Date.parse(alertState.lastAlertAt);
    if (!Number.isFinite(lastAlertAtMs) || Date.now() - lastAlertAtMs < CRITICAL_ALERT_ESCALATION_MS) {
      continue;
    }

    if (alertState.escalation?.escalatedAt) {
      continue;
    }

    const sentCount = await sendTelegramMessagesToAudience(audience, buildEscalationMessages(alertState));
    if (sentCount <= 0) {
      continue;
    }

    updateCriticalAlertState(alertState.date, {
      escalation: {
        escalatedAt: new Date().toISOString(),
        escalationCount: Number(alertState.escalation?.escalationCount || 0) + 1,
        lastEscalationReason: "Fara raspuns la alerta critica",
        lastEscalationTrigger: "no-response"
      }
    });

    await appendAuditLog({
      entityType: "automation",
      entityId: 1,
      action: "critical-alert-escalated",
      reason: "Escaladare alerta critica fara raspuns",
      user: "sistem",
      newValue: {
        date: alertState.date,
        recipients: sentCount
      }
    });

    escalated += 1;
  }

  return { checked: true, escalated, reason: escalated ? "escalated" : "no-pending-alerts" };
}

async function getCriticalAlertsStatus() {
  const config = await getConfig();
  const settings = config.systemSettings || {};
  const audience = parseAudience(settings.reportAudience);
  const linkedRecipients = getTelegramLinksForUsernames(audience);
  const criticalAlerts = listCriticalAlertStates()
    .sort((left, right) => String(right.date || "").localeCompare(String(left.date || "")))
    .slice(0, 12)
    .map((item) => ({
      date: item.date,
      status: item.lastStatus || "-",
      workflowStatus: getCriticalAlertWorkflowStatus(item),
      lastReason: item.lastReason || "-",
      lastTrigger: item.lastTrigger || "-",
      lastAlertAt: item.lastAlertAt || "",
      lastEvaluatedAt: item.lastEvaluatedAt || "",
      viewedCount: Object.keys(item.actions?.viewedBy || {}).length,
      viewedActors: formatActors(item.actions?.viewedBy || {}),
      inProgressCount: Object.keys(item.actions?.inProgressBy || {}).length,
      inProgressActors: formatActors(item.actions?.inProgressBy || {}),
      resolvedCount: Object.keys(item.actions?.resolvedBy || {}).length,
      resolvedActors: formatActors(item.actions?.resolvedBy || {}),
      lastAction: item.actions?.lastAction || null,
      escalatedAt: item.escalation?.escalatedAt || "",
      escalationCount: Number(item.escalation?.escalationCount || 0),
      escalationReason: item.escalation?.lastEscalationReason || "",
      escalationTrigger: item.escalation?.lastEscalationTrigger || ""
    }));

  return {
    botReady: isBotReady(),
    reportChannel: String(settings.reportChannel || "").trim().toLowerCase(),
    reportAudience: String(settings.reportAudience || "").trim(),
    totalTrackedAlerts: criticalAlerts.length,
    criticalOpenAlerts: criticalAlerts.filter((item) => item.status === "CRITIC" && item.workflowStatus !== "Rezolvata").length,
    escalatedAlerts: criticalAlerts.filter((item) => item.escalatedAt).length,
    linkedRecipients: linkedRecipients.length,
    criticalAlerts
  };
}

function startCriticalAlertMonitor() {
  if (escalationMonitorInterval) {
    return escalationMonitorInterval;
  }

  void maybeEscalateCriticalAlerts();
  escalationMonitorInterval = setInterval(() => {
    void maybeEscalateCriticalAlerts().catch((error) => {
      console.error("Critical alert escalation monitor failed:", error.message);
    });
  }, 60 * 1000);

  return escalationMonitorInterval;
}

function triggerCriticalManagementAlert(options = {}) {
  void maybeSendCriticalManagementAlert(options).catch((error) => {
    console.error("Critical management alert failed:", error.message);
  });
}

module.exports = {
  getCriticalAlertsStatus,
  maybeSendCriticalManagementAlert,
  maybeEscalateCriticalAlerts,
  startCriticalAlertMonitor,
  triggerCriticalManagementAlert
};
