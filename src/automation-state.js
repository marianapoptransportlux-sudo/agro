const fs = require("fs");
const path = require("path");

const runtimeDir = path.join(process.cwd(), ".runtime-data");
const automationStateFile = path.join(runtimeDir, "automation-state.json");

const defaultAutomationState = {
  telegramLinks: {},
  reports: {
    closeOfDay: {
      lastSentDate: ""
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
        ...(parsed.reports?.closeOfDay || {})
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
  getLastCloseOfDaySentDate,
  getTelegramLink,
  getTelegramLinksForUsernames,
  linkTelegramUser,
  markCloseOfDaySent,
  readAutomationState
};
