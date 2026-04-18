const {
  getConfig,
  getDailyReport,
  listAuditLogs,
  listComplaints,
  listDeliveries,
  listReceipts
} = require("./storage");
const {
  getLastCloseOfDaySentDate,
  getTelegramLinksForUsernames,
  markCloseOfDaySent
} = require("./automation-state");
const { sendTelegramMessagesToAudience, isBotReady } = require("./bot");

const numberFormatter = new Intl.NumberFormat("ro-RO", {
  maximumFractionDigits: 2
});

const currencyFormatter = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "MDL",
  maximumFractionDigits: 2
});

let schedulerInterval = null;
let schedulerRunning = false;

function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function todayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function hourNow() {
  return new Date().getHours();
}

function parseAudience(reportAudience) {
  return String(reportAudience || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

async function getCloseOfDayStatus() {
  const config = await getConfig();
  const settings = config.systemSettings || {};
  const closeOfDayHour = Number(settings.closeOfDayHour);
  const audience = parseAudience(settings.reportAudience);
  const usersByUsername = new Map(
    (config.users || []).map((user) => [String(user.username || "").trim().toLowerCase(), user])
  );
  const telegramLinks = getTelegramLinksForUsernames(audience);
  const linkedByUsername = new Map(
    telegramLinks.map((link) => [String(link.username || "").trim().toLowerCase(), link])
  );

  const resolvedAudience = audience.map((username) => {
    const user = usersByUsername.get(username) || null;
    const link = linkedByUsername.get(username) || null;

    return {
      username,
      name: user?.name || username,
      roleCode: user?.roleCode || "",
      channel: user?.channel || "",
      linked: Boolean(link?.chatId),
      chatId: link?.chatId || "",
      linkedAt: link?.linkedAt || "",
      lastSeenAt: link?.lastSeenAt || "",
      canReceiveTelegram: Boolean(user && String(user.channel || "").includes("telegram") && link?.chatId)
    };
  });

  return {
    botReady: isBotReady(),
    reportChannel: String(settings.reportChannel || "").trim().toLowerCase(),
    closeOfDayHour,
    reportAudience: String(settings.reportAudience || "").trim(),
    todayDate: todayDateValue(),
    currentHour: hourNow(),
    dueNow: Number.isFinite(closeOfDayHour) && hourNow() >= closeOfDayHour,
    lastSentDate: getLastCloseOfDaySentDate(),
    resolvedAudience,
    linkedRecipients: resolvedAudience.filter((item) => item.canReceiveTelegram),
    missingRecipients: resolvedAudience.filter((item) => !item.canReceiveTelegram)
  };
}

function buildSummaryMessage(report) {
  return [
    `Inchidere zi ${report.date}`,
    `Receptii: ${report.summary.receiptsCount} | Brut: ${formatNumber(report.summary.grossQuantity)} t`,
    `Net provizoriu: ${formatNumber(report.summary.provisionalNetQuantity)} t`,
    `Procesat: ${formatNumber(report.summary.processedQuantity)} t | Deseu: ${formatNumber(report.summary.confirmedWaste)} t`,
    `Livrat: ${formatNumber(report.summary.deliveredQuantity || 0)} t`,
    `Plati: ${formatCurrency(report.summary.paymentsTotal || 0)} | Incasari: ${formatCurrency(report.summary.collectionsTotal || 0)}`,
    `Stoc total: ${formatNumber(report.summary.stockTotal)} t`
  ].join("\n");
}

function buildOpenDocumentsMessage(receipts, deliveries) {
  const openReceipts = receipts
    .filter((item) => !["Inchis", "Anulat", "Finalizata"].includes(String(item.status || "")))
    .slice(0, 6);
  const openDeliveries = deliveries
    .filter((item) => !["Inchisa", "Anulata", "Finalizata"].includes(String(item.status || "")))
    .slice(0, 6);

  if (!openReceipts.length && !openDeliveries.length) {
    return "Documente neinchise: niciun document deschis.";
  }

  return [
    "Documente neinchise:",
    ...openReceipts.map(
      (item) =>
        `R#${item.id} ${item.product} | ${item.supplier} | ${item.status} | ${formatNumber(item.provisionalNetQuantity || item.quantity)} ${item.unit}`
    ),
    ...openDeliveries.map(
      (item) =>
        `L#${item.id} ${item.product} | ${item.customer || "-"} | ${item.status} | ${formatNumber(item.deliveredQuantity)} t`
    )
  ].join("\n");
}

function buildOutstandingPaymentsMessage(receipts) {
  const items = receipts
    .map((receipt) => {
      const paidAmount = Number(receipt.paidAmount || 0);
      const targetAmount = Number(receipt.preliminaryPayableAmount || 0);
      return {
        ...receipt,
        paymentStatus:
          paidAmount <= 0 ? "Neachitat" : paidAmount < targetAmount ? "Partial" : "Achitat"
      };
    })
    .filter((item) => item.paymentStatus === "Neachitat" || item.paymentStatus === "Partial")
    .slice(0, 8);

  if (!items.length) {
    return "Loturi neachitate / partial achitate: nimic restant.";
  }

  return [
    "Loturi neachitate / partial achitate:",
    ...items.map(
      (item) =>
        `#${item.id} ${item.product} | ${item.supplier} | ${item.paymentStatus} | ${formatCurrency(item.preliminaryPayableAmount)}`
    )
  ].join("\n");
}

function buildComplaintsMessage(complaints) {
  const openComplaints = complaints
    .filter((item) => String(item.status || "").toLowerCase() === "deschisa")
    .slice(0, 8);

  if (!openComplaints.length) {
    return "Reclamatii deschise: niciuna.";
  }

  return [
    "Reclamatii deschise:",
    ...openComplaints.map(
      (item) =>
        `#${item.id} ${item.product} | ${item.customer || "-"} | ${formatNumber(item.contestedQuantity)} t | ${item.complaintType}`
    )
  ].join("\n");
}

function buildRecentChangesMessage(auditLogs) {
  const importantChanges = auditLogs
    .filter((item) => item.action !== "create")
    .slice(0, 8);

  if (!importantChanges.length) {
    return "Modificari importante recente: niciuna.";
  }

  return [
    "Modificari importante recente:",
    ...importantChanges.map((item) => {
      const stamp = String(item.createdAt || "").replace("T", " ").slice(0, 16);
      return `${stamp} | ${item.entityType} #${item.entityId || "-"} | ${item.action} | ${item.reason}`;
    })
  ].join("\n");
}

async function runCloseOfDayAutomation(options = {}) {
  if (schedulerRunning) {
    return { sent: false, reason: "already-running" };
  }

  schedulerRunning = true;

  try {
    const config = await getConfig();
    const settings = config.systemSettings || {};
    const closeOfDayHour = Number(settings.closeOfDayHour);
    const reportChannel = String(settings.reportChannel || "").trim().toLowerCase();
    const audience = parseAudience(settings.reportAudience);
    const dateValue = todayDateValue();
    const force = options.force === true;

    if (!Number.isFinite(closeOfDayHour) || closeOfDayHour < 0 || closeOfDayHour > 23) {
      return { sent: false, reason: "invalid-close-hour" };
    }

    if (!force && hourNow() < closeOfDayHour) {
      return { sent: false, reason: "before-close-hour" };
    }

    if (!force && getLastCloseOfDaySentDate() === dateValue) {
      return { sent: false, reason: "already-sent-today" };
    }

    if (reportChannel !== "telegram") {
      return { sent: false, reason: "channel-not-telegram" };
    }

    if (!audience.length) {
      return { sent: false, reason: "empty-audience" };
    }

    if (!isBotReady()) {
      return { sent: false, reason: "bot-not-ready" };
    }

    const [report, receipts, deliveries, complaints, auditLogs] = await Promise.all([
      getDailyReport(dateValue),
      listReceipts(),
      listDeliveries(),
      listComplaints(),
      listAuditLogs()
    ]);

    const messages = [
      buildSummaryMessage(report),
      buildOpenDocumentsMessage(receipts, deliveries),
      buildOutstandingPaymentsMessage(receipts),
      buildComplaintsMessage(complaints),
      buildRecentChangesMessage(auditLogs)
    ];

    const sentCount = await sendTelegramMessagesToAudience(audience, messages);
    if (sentCount > 0) {
      markCloseOfDaySent(dateValue);
      console.log(`Close-of-day report sent for ${dateValue} to ${sentCount} Telegram recipient(s).`);
      return {
        sent: true,
        reason: "sent",
        date: dateValue,
        recipients: sentCount
      };
    }

    console.log(`Close-of-day report skipped for ${dateValue}: no linked Telegram recipients.`);
    return { sent: false, reason: "no-linked-recipients", date: dateValue, recipients: 0 };
  } catch (error) {
    console.error("Close-of-day automation failed:", error.message);
    return { sent: false, reason: "failed", error: error.message };
  } finally {
    schedulerRunning = false;
  }
}

function startCloseOfDayScheduler() {
  if (schedulerInterval) {
    return schedulerInterval;
  }

  void runCloseOfDayAutomation();
  schedulerInterval = setInterval(() => {
    void runCloseOfDayAutomation();
  }, 60 * 1000);

  return schedulerInterval;
}

module.exports = {
  getCloseOfDayStatus,
  runCloseOfDayAutomation,
  startCloseOfDayScheduler
};
