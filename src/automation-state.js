const fs = require("fs");
const path = require("path");

const runtimeDir = path.join(process.cwd(), ".runtime-data");
const automationStateFile = path.join(runtimeDir, "automation-state.json");

const defaultAutomationState = {
  telegramLinks: {},
  reports: {
    closeOfDay: {
      lastSentDate: "",
      actions: {}
    }
  }
};

function ensureRuntimeDir() {
  if (!fs.existsSync(runtimeDir)) {
    fs.mkdirSync(runtimeDir, { recursive: true });
  }
}

function readAutomationState() {
  ensureRuntimeDir();

  if (!fs.existsSync(automationStateFile)) {
    fs.writeFileSync(automationStateFile, JSON.stringify(defaultAutomationState, null, 2), "utf8");
    return JSON.parse(JSON.stringify(defaultAutomationState));
  }

  const raw = fs.readFileSync(automationStateFile, "utf8");
  const parsed = JSON.parse(raw);

  return {
    ...defaultAutomationState,
    ...parsed,
    telegramLinks: { ...defaultAutomationState.telegramLinks, ...(parsed.telegramLinks || {}) },
    reports: {
      ...defaultAutomationState.reports,
      ...(parsed.reports || {}),
      closeOfDay: {
        ...defaultAutomationState.reports.closeOfDay,
        ...(parsed.reports?.closeOfDay || {}),
        actions: {
          ...defaultAutomationState.reports.closeOfDay.actions,
          ...(parsed.reports?.closeOfDay?.actions || {})
        }
      }
    }
  };
}

function writeAutomationState(state) {
  ensureRuntimeDir();
  fs.writeFileSync(automationStateFile, JSON.stringify(state, null, 2), "utf8");
}

function linkTelegramUser(username, chatInfo = {}) {
  const normalizedUsername = String(username || "").trim().toLowerCase();
  if (!normalizedUsername) {
    return null;
  }

  const state = readAutomationState();
  state.telegramLinks[normalizedUsername] = {
    username: normalizedUsername,
    chatId: String(chatInfo.chatId || "").trim(),
    telegramUsername: String(chatInfo.telegramUsername || "").trim(),
    firstName: String(chatInfo.firstName || "").trim(),
    linkedAt: state.telegramLinks[normalizedUsername]?.linkedAt || new Date().toISOString(),
    lastSeenAt: new Date().toISOString()
  };
  writeAutomationState(state);
  return state.telegramLinks[normalizedUsername];
}

function getTelegramLink(username) {
  const normalizedUsername = String(username || "").trim().toLowerCase();
  if (!normalizedUsername) {
    return null;
  }

  const state = readAutomationState();
  return state.telegramLinks[normalizedUsername] || null;
}

function getTelegramLinksForUsernames(usernames = []) {
  const state = readAutomationState();

  return usernames
    .map((username) => String(username || "").trim().toLowerCase())
    .filter(Boolean)
    .map((username) => state.telegramLinks[username] || null)
    .filter(Boolean);
}

function getTelegramLinkByChatId(chatId) {
  const normalizedChatId = String(chatId || "").trim();
  if (!normalizedChatId) {
    return null;
  }

  const state = readAutomationState();
  return (
    Object.values(state.telegramLinks).find(
      (item) => String(item?.chatId || "").trim() === normalizedChatId
    ) || null
  );
}

function getCloseOfDayReportActionState(dateValue) {
  const normalizedDate = String(dateValue || "").trim();
  if (!normalizedDate) {
    return {
      date: "",
      confirmations: {},
      resolutions: {},
      detailRequests: [],
      reruns: [],
      lastAction: null
    };
  }

  const state = readAutomationState();
  const actionState = state.reports.closeOfDay.actions?.[normalizedDate] || {};
  return {
    date: normalizedDate,
    confirmations: { ...(actionState.confirmations || {}) },
    resolutions: { ...(actionState.resolutions || {}) },
    detailRequests: Array.isArray(actionState.detailRequests) ? [...actionState.detailRequests] : [],
    reruns: Array.isArray(actionState.reruns) ? [...actionState.reruns] : [],
    lastAction: actionState.lastAction || null
  };
}

function recordCloseOfDayReportAction(dateValue, username, actionType, extra = {}) {
  const normalizedDate = String(dateValue || "").trim();
  const normalizedUsername = String(username || "").trim().toLowerCase();
  const normalizedActionType = String(actionType || "").trim().toLowerCase();

  if (!normalizedDate || !normalizedUsername || !normalizedActionType) {
    return getCloseOfDayReportActionState(normalizedDate);
  }

  const state = readAutomationState();
  const existing = state.reports.closeOfDay.actions?.[normalizedDate] || {
    confirmations: {},
    resolutions: {},
    detailRequests: [],
    reruns: [],
    lastAction: null
  };
  const timestamp = new Date().toISOString();

  const next = {
    confirmations: { ...(existing.confirmations || {}) },
    resolutions: { ...(existing.resolutions || {}) },
    detailRequests: Array.isArray(existing.detailRequests) ? [...existing.detailRequests] : [],
    reruns: Array.isArray(existing.reruns) ? [...existing.reruns] : [],
    lastAction: {
      type: normalizedActionType,
      username: normalizedUsername,
      at: timestamp
    }
  };

  if (normalizedActionType === "confirm") {
    next.confirmations[normalizedUsername] = timestamp;
  }

  if (normalizedActionType === "resolve") {
    next.resolutions[normalizedUsername] = timestamp;
  }

  if (normalizedActionType === "details") {
    next.detailRequests.unshift({
      username: normalizedUsername,
      at: timestamp,
      note: String(extra.note || "").trim()
    });
    next.detailRequests = next.detailRequests.slice(0, 25);
  }

  if (normalizedActionType === "run") {
    next.reruns.unshift({
      username: normalizedUsername,
      at: timestamp
    });
    next.reruns = next.reruns.slice(0, 25);
  }

  state.reports.closeOfDay.actions[normalizedDate] = next;
  writeAutomationState(state);
  return getCloseOfDayReportActionState(normalizedDate);
}

function getLastCloseOfDaySentDate() {
  return readAutomationState().reports.closeOfDay.lastSentDate || "";
}

function markCloseOfDaySent(dateValue) {
  const normalizedDate = String(dateValue || "").trim();
  if (!normalizedDate) {
    return "";
  }

  const state = readAutomationState();
  state.reports.closeOfDay.lastSentDate = normalizedDate;
  writeAutomationState(state);
  return normalizedDate;
}

module.exports = {
  getCloseOfDayReportActionState,
  getLastCloseOfDaySentDate,
  getTelegramLinkByChatId,
  getTelegramLink,
  getTelegramLinksForUsernames,
  linkTelegramUser,
  markCloseOfDaySent,
  recordCloseOfDayReportAction,
  readAutomationState
};
