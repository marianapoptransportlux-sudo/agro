#!/usr/bin/env node

require("dotenv").config();

const args = process.argv.slice(2);
const command = args[0] || "set";
const baseUrl = args[1] || process.env.BASE_URL || "";
const token = process.env.TELEGRAM_BOT_TOKEN || "";
const secret = process.env.TELEGRAM_WEBHOOK_SECRET || "";

function printUsage() {
  console.log(
    [
      "Usage:",
      "  node scripts/register-telegram-webhook.js set <public-base-url>",
      "  node scripts/register-telegram-webhook.js info",
      "  node scripts/register-telegram-webhook.js delete",
      "",
      "Required env:",
      "  TELEGRAM_BOT_TOKEN",
      "  TELEGRAM_WEBHOOK_SECRET  (recommended, sent as X-Telegram-Bot-Api-Secret-Token)",
      "",
      "Example:",
      "  node scripts/register-telegram-webhook.js set https://agro.vercel.app"
    ].join("\n")
  );
}

function assertToken() {
  if (!token || token === "replace_me") {
    throw new Error("TELEGRAM_BOT_TOKEN lipseste din .env.");
  }
}

function buildWebhookUrl(base) {
  const normalized = String(base || "").replace(/\/+$/, "");
  if (!normalized || !/^https:\/\//i.test(normalized)) {
    throw new Error("Base URL trebuie sa inceapa cu https:// (ex: https://agro.vercel.app).");
  }
  return `${normalized}/api/telegram/webhook`;
}

async function callTelegram(method, body) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json();
  if (!data.ok) {
    throw new Error(`${method} esuat: ${data.description || JSON.stringify(data)}`);
  }
  return data.result;
}

async function setWebhook() {
  assertToken();
  const webhookUrl = buildWebhookUrl(baseUrl);
  const body = {
    url: webhookUrl,
    drop_pending_updates: true,
    allowed_updates: ["message", "callback_query"]
  };
  if (secret) {
    body.secret_token = secret;
  } else {
    console.warn(
      "Atentie: TELEGRAM_WEBHOOK_SECRET nu e setat. Recomand sa-l setezi pentru protectie impotriva request-urilor false."
    );
  }
  await callTelegram("setWebhook", body);
  console.log(`Webhook setat pe ${webhookUrl}`);
}

async function getWebhookInfo() {
  assertToken();
  const info = await callTelegram("getWebhookInfo");
  console.log(JSON.stringify(info, null, 2));
}

async function deleteWebhook() {
  assertToken();
  await callTelegram("deleteWebhook", { drop_pending_updates: true });
  console.log("Webhook sters. Botul revine la mode polling daca e pornit local.");
}

async function main() {
  if (command === "help" || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  try {
    if (command === "set") {
      await setWebhook();
    } else if (command === "info") {
      await getWebhookInfo();
    } else if (command === "delete") {
      await deleteWebhook();
    } else {
      printUsage();
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

main();
