const {
  getConfig,
  getDailyReport,
  listAuditLogs,
  listComplaints,
  listDeliveries,
  listOpeningDebtItems,
  listReceipts
} = require("./storage");
const {
  getLastCloseOfDaySentDate,
  getTelegramLinksForUsernames,
  markCloseOfDaySent
} = require("./automation-state");
const { sendTelegramMessagesToAudience, isBotReady } = require("./bot");
const {
  buildManagementTelegramReportMessages,
  getManagementSnapshot
} = require("./management-report");

let schedulerInterval = null;
let schedulerRunning = false;

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

    const [report, receipts, deliveries, complaints, auditLogs, openingDebtItems] = await Promise.all([
      getDailyReport(dateValue),
      listReceipts(),
      listDeliveries(),
      listComplaints(),
      listAuditLogs(),
      listOpeningDebtItems()
    ]);

    const snapshot = getManagementSnapshot({
      report,
      receipts,
      deliveries,
      complaints,
      auditLogs,
      openingDebtItems,
      dateValue
    });
    const messages = [
      ...buildManagementTelegramReportMessages(snapshot),
      { reportActionDate: dateValue }
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
