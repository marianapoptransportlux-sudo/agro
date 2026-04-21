const { Markup, Telegraf } = require("telegraf");
const {
  appendAuditLog,
  createReceipt,
  findUserByUsername,
  getDailyReport,
  listAuditLogs,
  listComplaints,
  listDeliveries,
  listOpeningDebtItems,
  listReceipts
} = require("./storage");
const {
  getCloseOfDayReportActionState,
  getCriticalAlertState,
  getTelegramLinkByChatId,
  getTelegramLinksForUsernames,
  linkTelegramUser,
  recordCloseOfDayReportAction,
  recordCriticalAlertAction
} = require("./automation-state");
const {
  buildManagementDetailMessages,
  buildManagementTelegramReportMessages,
  getManagementSnapshot
} = require("./management-report");

const sessions = new Map();
let activeBot = null;

const steps = [
  { key: "supplier", question: "Furnizor:" },
  { key: "product", question: "Produs:" },
  { key: "quantity", question: "Cantitate:" },
  { key: "unit", question: "Unitate (kg, tone, litri, saci):" },
  { key: "price", question: "Pret per unitate:" },
  { key: "vehicle", question: "Numar masina / tractor:" },
  { key: "note", question: "Observatii (sau - pentru gol):" }
];

const closedReceiptStatuses = new Set(["Inchis", "Anulat", "Finalizata"]);
const closedDeliveryStatuses = new Set(["Inchisa", "Anulata", "Finalizata"]);

const numberFormatter = new Intl.NumberFormat("ro-RO", {
  maximumFractionDigits: 2
});

const currencyFormatter = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "MDL",
  maximumFractionDigits: 2
});

function formatNumber(value) {
  return numberFormatter.format(Number(value || 0));
}

function formatCurrency(value) {
  return currencyFormatter.format(Number(value || 0));
}

function parseDateArgument(text) {
  const raw = String(text || "")
    .trim()
    .split(/\s+/)
    .slice(1)
    .join(" ")
    .trim();

  if (!raw) {
    return new Date().toISOString().slice(0, 10);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    return null;
  }

  return raw;
}

function getOutstandingReceiptStatus(receipt) {
  if (receipt.paymentStatus) {
    return receipt.paymentStatus;
  }

  const paidAmount = Number(receipt.paidAmount || 0);
  const targetAmount = Number(receipt.preliminaryPayableAmount || 0);

  if (paidAmount <= 0) {
    return "Neachitat";
  }

  if (paidAmount < targetAmount) {
    return "Partial";
  }

  return "Achitat";
}

function createReceiptMessage(receipt) {
  return [
    `Receptia #${receipt.id} a fost salvata.`,
    `${receipt.product} - ${formatNumber(receipt.quantity)} ${receipt.unit}`,
    `Furnizor: ${receipt.supplier}`,
    `Valoare estimata: ${formatCurrency(receipt.quantity * receipt.price)}`
  ].join("\n");
}

async function replyWithMessages(ctx, messages) {
  for (const message of messages.filter(Boolean)) {
    const payload = typeof message === "string" ? { text: message } : message;
    if (!payload?.text) {
      continue;
    }

    await ctx.reply(payload.text, payload.extra || undefined);
  }
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

function createReportActionKeyboard(dateValue) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("Confirma", `cdr:confirm:${dateValue}`),
      Markup.button.callback("Cere detalii", `cdr:details:${dateValue}`)
    ],
    [
      Markup.button.callback("Marcheaza rezolvat", `cdr:resolve:${dateValue}`),
      Markup.button.callback("Ruleaza raport acum", `cdr:run:${dateValue}`)
    ]
  ]);
}

function createReportActionMessage(dateValue, username = "") {
  const actionState = getCloseOfDayReportActionState(dateValue);
  const normalizedUsername = String(username || "").trim().toLowerCase();
  const confirmed = Boolean(actionState.confirmations[normalizedUsername]);
  const resolved = Boolean(actionState.resolutions[normalizedUsername]);
  const confirmationCount = Object.keys(actionState.confirmations).length;
  const resolutionCount = Object.keys(actionState.resolutions).length;
  const detailCount = actionState.detailRequests.length;
  const rerunCount = actionState.reruns.length;
  const lastAction = actionState.lastAction
    ? `${actionState.lastAction.type} de ${actionState.lastAction.username} la ${String(actionState.lastAction.at)
        .replace("T", " ")
        .slice(0, 16)}`
    : "nicio actiune inregistrata";

  return {
    text: [
      `Actiuni rapide pentru raportul ${dateValue}:`,
      `Confirmari: ${confirmationCount} | Cereri detalii: ${detailCount} | Marcari rezolvat: ${resolutionCount} | Rulari manuale: ${rerunCount}`,
      `Tu: confirmat ${confirmed ? "da" : "nu"} | rezolvat ${resolved ? "da" : "nu"}`,
      `Ultima actiune: ${lastAction}`
    ].join("\n"),
    extra: createReportActionKeyboard(dateValue)
  };
}

function createCriticalAlertActionKeyboard(dateValue) {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback("Vazuta", `cal:view:${dateValue}`),
      Markup.button.callback("In lucru", `cal:work:${dateValue}`),
      Markup.button.callback("Rezolvata", `cal:resolve:${dateValue}`)
    ]
  ]);
}

function formatActionActors(actionMap) {
  const entries = Object.entries(actionMap || {})
    .filter(([, timestamp]) => Boolean(timestamp))
    .sort((left, right) => String(left[1]).localeCompare(String(right[1])))
    .slice(0, 4);

  if (!entries.length) {
    return "nimeni";
  }

  return entries
    .map(([username, timestamp]) => `${username} ${String(timestamp).replace("T", " ").slice(0, 16)}`)
    .join(" | ");
}

function getCriticalAlertWorkflowStatus(alertState) {
  if (Object.keys(alertState.actions?.resolvedBy || {}).length) {
    return "rezolvata";
  }

  if (Object.keys(alertState.actions?.inProgressBy || {}).length) {
    return "in lucru";
  }

  if (Object.keys(alertState.actions?.viewedBy || {}).length) {
    return "vazuta";
  }

  if (alertState.escalation?.escalatedAt) {
    return "escaladata fara raspuns";
  }

  return "noua";
}

function createCriticalAlertActionMessage(dateValue, username = "") {
  const alertState = getCriticalAlertState(dateValue);
  const normalizedUsername = String(username || "").trim().toLowerCase();
  const workflowStatus = getCriticalAlertWorkflowStatus(alertState);
  const escalationInfo = alertState.escalation?.escalatedAt
    ? `da, la ${String(alertState.escalation.escalatedAt).replace("T", " ").slice(0, 16)}`
    : "nu";

  return {
    text: [
      `Confirmare alerta critica ${dateValue}:`,
      `Status workflow: ${workflowStatus}`,
      `Escalata: ${escalationInfo}`,
      `Vazuta: ${formatActionActors(alertState.actions.viewedBy)}`,
      `In lucru: ${formatActionActors(alertState.actions.inProgressBy)}`,
      `Rezolvata: ${formatActionActors(alertState.actions.resolvedBy)}`,
      `Tu: vazuta ${alertState.actions.viewedBy[normalizedUsername] ? "da" : "nu"} | in lucru ${alertState.actions.inProgressBy[normalizedUsername] ? "da" : "nu"} | rezolvata ${alertState.actions.resolvedBy[normalizedUsername] ? "da" : "nu"}`,
      `Ultima confirmare: ${alertState.actions.lastAction ? `${alertState.actions.lastAction.type} de ${alertState.actions.lastAction.username} la ${String(alertState.actions.lastAction.at).replace("T", " ").slice(0, 16)}` : "nicio confirmare"}`
    ].join("\n"),
    extra: createCriticalAlertActionKeyboard(dateValue)
  };
}

async function appendTelegramActionAudit(username, action, dateValue, details = {}) {
  await appendAuditLog({
    entityType: "automation",
    entityId: 1,
    action: `telegram-${action}`,
    reason: `Actiune Telegram close-of-day: ${action}`,
    user: username || "telegram",
    newValue: {
      date: dateValue,
      ...details
    }
  });
}

function resolveLinkedUsername(ctx) {
  const linkedUser = getTelegramLinkByChatId(ctx.chat?.id);
  return String(linkedUser?.username || "").trim().toLowerCase();
}

async function refreshReportActionMessage(ctx, dateValue, username) {
  const payload = createReportActionMessage(dateValue, username);

  try {
    await ctx.editMessageText(payload.text, payload.extra);
  } catch (error) {
    if (!String(error.message || "").toLowerCase().includes("message is not modified")) {
      console.error("Failed to refresh report action panel:", error.message);
    }
  }
}

async function refreshCriticalAlertActionMessage(ctx, dateValue, username) {
  const payload = createCriticalAlertActionMessage(dateValue, username);

  try {
    await ctx.editMessageText(payload.text, payload.extra);
  } catch (error) {
    if (!String(error.message || "").toLowerCase().includes("message is not modified")) {
      console.error("Failed to refresh critical alert panel:", error.message);
    }
  }
}

function createOpenDocumentsMessage(receipts, deliveries) {
  const openReceipts = receipts
    .filter((item) => !closedReceiptStatuses.has(String(item.status || "")))
    .slice(0, 8);
  const openDeliveries = deliveries
    .filter((item) => !closedDeliveryStatuses.has(String(item.status || "")))
    .slice(0, 8);

  if (!openReceipts.length && !openDeliveries.length) {
    return "Nu exista documente deschise.";
  }

  const lines = ["Documente neinchise:"];

  if (openReceipts.length) {
    lines.push("Receptii:");
    for (const item of openReceipts) {
      lines.push(
        `#${item.id} ${item.product} | ${item.supplier} | ${item.status} | ${formatNumber(item.provisionalNetQuantity || item.quantity)} ${item.unit}`
      );
    }
  }

  if (openDeliveries.length) {
    lines.push("Livrari:");
    for (const item of openDeliveries) {
      lines.push(
        `#${item.id} ${item.product} | ${item.customer || "-"} | ${item.status} | ${formatNumber(item.deliveredQuantity)} t`
      );
    }
  }

  return lines.join("\n");
}

function createOutstandingPaymentsMessage(receipts) {
  const items = receipts
    .map((receipt) => ({
      ...receipt,
      paymentStatus: getOutstandingReceiptStatus(receipt)
    }))
    .filter((item) => item.paymentStatus === "Neachitat" || item.paymentStatus === "Partial")
    .slice(0, 10);

  if (!items.length) {
    return "Nu exista loturi neachitate sau partial achitate.";
  }

  return [
    "Loturi neachitate / partial achitate:",
    ...items.map(
      (item) =>
        `#${item.id} ${item.product} | ${item.supplier} | ${item.paymentStatus} | ${formatCurrency(item.preliminaryPayableAmount)}`
    )
  ].join("\n");
}

function createOpenComplaintsMessage(complaints) {
  const openComplaints = complaints
    .filter((item) => String(item.status || "").toLowerCase() === "deschisa")
    .slice(0, 10);

  if (!openComplaints.length) {
    return "Nu exista reclamatii deschise.";
  }

  return [
    "Reclamatii deschise:",
    ...openComplaints.map(
      (item) =>
        `#${item.id} ${item.product} | ${item.customer || "-"} | ${formatNumber(item.contestedQuantity)} t | ${item.complaintType}`
    )
  ].join("\n");
}

function createRecentChangesMessage(auditLogs) {
  const importantChanges = auditLogs
    .filter((item) => item.action !== "create")
    .slice(0, 10);

  if (!importantChanges.length) {
    return "Nu exista modificari importante recente.";
  }

  return [
    "Modificari recente:",
    ...importantChanges.map((item) => {
      const stamp = String(item.createdAt || "").replace("T", " ").slice(0, 16);
      return `${stamp} | ${item.entityType} #${item.entityId || "-"} | ${item.action} | ${item.reason}`;
    })
  ].join("\n");
}

function createHelpMessage() {
  return [
    "Bot operational Agro Receptie.",
    "Comenzi:",
    "/receptie - inregistreaza marfa noua",
    "/raport [YYYY-MM-DD] - raport zilnic scurt",
    "/deschise - documente neinchise",
    "/plati - loturi neachitate sau partial achitate",
    "/reclamatii - reclamatii deschise",
    "/modificari - modificari si redeschideri recente",
    "/anuleaza - opreste fluxul curent"
  ].join("\n");
}

async function tryLinkTelegramAccount(ctx) {
  const telegramUserId = ctx.from?.id ? String(ctx.from.id) : "";
  const telegramUsername = String(ctx.from?.username || "").trim().toLowerCase();

  if (!telegramUserId) {
    return "Nu am putut identifica contul tau Telegram. Reincearca din clientul Telegram oficial.";
  }

  if (!telegramUsername) {
    return "Seteaza un username Telegram pentru a lega contul intern si a primi rapoarte automate.";
  }

  const user = await findUserByUsername(telegramUsername);
  if (!user) {
    return `Nu exista utilizator intern cu username-ul ${telegramUsername}. Contacteaza administratorul.`;
  }

  if (!String(user.channel || "").includes("telegram")) {
    return `Utilizatorul ${telegramUsername} nu are activ canalul Telegram in sistem.`;
  }

  try {
    linkTelegramUser(user.username, {
      telegramUserId,
      chatId: ctx.chat?.id,
      telegramUsername,
      firstName: ctx.from?.first_name || ""
    });
  } catch (error) {
    if (error.code === "TELEGRAM_LINK_MISMATCH") {
      return "Contul tau Telegram difera de cel legat initial. Pentru securitate, contacteaza administratorul pentru relegare.";
    }
    throw error;
  }

  return `Canal Telegram activat pentru ${user.username} (id ${telegramUserId}). Vei primi rapoarte automate daca esti inclus in audienta.`;
}

function isBotReady() {
  return Boolean(activeBot);
}

async function sendTelegramMessagesToAudience(usernames = [], messages = []) {
  if (!activeBot || !usernames.length || !messages.length) {
    return 0;
  }

  const links = getTelegramLinksForUsernames(usernames);
  const chatTargets = Array.from(
    new Map(
      links
        .map((item) => [String(item.chatId || "").trim(), item])
        .filter(([chatId]) => Boolean(chatId))
    ).values()
  );
  let sentCount = 0;

  for (const target of chatTargets) {
    const payloads = messages
      .filter(Boolean)
      .map((message) => {
        if (typeof message === "string") {
          return { text: message };
        }

        if (message?.reportActionDate) {
          return createReportActionMessage(message.reportActionDate, target.username);
        }

        if (message?.criticalAlertDate) {
          return createCriticalAlertActionMessage(message.criticalAlertDate, target.username);
        }

        return message;
      });

    for (const payload of payloads) {
      if (!payload?.text) {
        continue;
      }

      await activeBot.telegram.sendMessage(target.chatId, payload.text, payload.extra || undefined);
    }

    sentCount += 1;
  }

  return sentCount;
}

function startBot(token) {
  if (!token || token === "replace_me") {
    console.log("Telegram bot disabled: TELEGRAM_BOT_TOKEN is missing.");
    activeBot = null;
    return null;
  }

  const bot = new Telegraf(token);
  activeBot = bot;

  bot.start(async (ctx) => {
    const linkMessage = await tryLinkTelegramAccount(ctx);
    return ctx.reply([linkMessage, "", createHelpMessage()].join("\n"));
  });
  bot.command("ajutor", (ctx) => ctx.reply(createHelpMessage()));

  bot.command("anuleaza", (ctx) => {
    sessions.delete(ctx.chat.id);
    return ctx.reply("Fluxul a fost anulat.");
  });

  bot.command("receptie", (ctx) => {
    sessions.set(ctx.chat.id, {
      stepIndex: 0,
      payload: {},
      receivedBy: ctx.from?.username || ctx.from?.first_name || "telegram-user"
    });
    return ctx.reply(["Pornim receptia de marfa.", steps[0].question].join("\n"));
  });

  bot.command("raport", async (ctx) => {
    try {
      const dateValue = parseDateArgument(ctx.message?.text);
      if (!dateValue) {
        return ctx.reply("Data trebuie sa fie in formatul YYYY-MM-DD.");
      }

      const snapshot = await loadManagementSnapshot(dateValue);
      await replyWithMessages(ctx, buildManagementTelegramReportMessages(snapshot));
      const actionPayload = createReportActionMessage(dateValue, resolveLinkedUsername(ctx));
      return ctx.reply(actionPayload.text, actionPayload.extra);
    } catch (error) {
      console.error("Failed to build Telegram daily report:", error.message);
      return ctx.reply("Nu am putut genera raportul zilnic.");
    }
  });

  bot.action(/^cdr:(confirm|details|resolve|run):(\d{4}-\d{2}-\d{2})$/, async (ctx) => {
    const [, action, dateValue] = ctx.match || [];
    const username = resolveLinkedUsername(ctx);

    if (!username) {
      await ctx.answerCbQuery("Leaga mai intai contul intern cu /start.", { show_alert: true });
      return;
    }

    try {
      recordCloseOfDayReportAction(dateValue, username, action);
      await appendTelegramActionAudit(username, action, dateValue, {
        chatId: String(ctx.chat?.id || "").trim()
      });

      if (action === "confirm") {
        await refreshReportActionMessage(ctx, dateValue, username);
        await ctx.answerCbQuery("Raport confirmat.");
        return;
      }

      if (action === "resolve") {
        await refreshReportActionMessage(ctx, dateValue, username);
        await ctx.answerCbQuery("Raport marcat rezolvat.");
        return;
      }

      if (action === "details") {
        const snapshot = await loadManagementSnapshot(dateValue);
        await refreshReportActionMessage(ctx, dateValue, username);
        await ctx.answerCbQuery("Trimit detaliile.");
        await replyWithMessages(ctx, buildManagementDetailMessages(snapshot));
        return;
      }

      if (action === "run") {
        const snapshot = await loadManagementSnapshot(dateValue);
        await refreshReportActionMessage(ctx, dateValue, username);
        await ctx.answerCbQuery("Rulez raportul.");
        await replyWithMessages(ctx, buildManagementTelegramReportMessages(snapshot));
        const actionPayload = createReportActionMessage(dateValue, username);
        await ctx.reply(actionPayload.text, actionPayload.extra);
      }
    } catch (error) {
      console.error("Telegram quick action failed:", error.message);
      await ctx.answerCbQuery("Actiunea nu a reusit.", { show_alert: true });
    }
  });

  bot.action(/^cal:(view|work|resolve):(\d{4}-\d{2}-\d{2})$/, async (ctx) => {
    const [, action, dateValue] = ctx.match || [];
    const username = resolveLinkedUsername(ctx);

    if (!username) {
      await ctx.answerCbQuery("Leaga mai intai contul intern cu /start.", { show_alert: true });
      return;
    }

    try {
      recordCriticalAlertAction(dateValue, username, action);
      await appendAuditLog({
        entityType: "automation",
        entityId: 1,
        action: `telegram-critical-${action}`,
        reason: `Confirmare alerta critica: ${action}`,
        user: username,
        newValue: {
          date: dateValue,
          chatId: String(ctx.chat?.id || "").trim()
        }
      });
      await refreshCriticalAlertActionMessage(ctx, dateValue, username);

      if (action === "view") {
        await ctx.answerCbQuery("Alerta marcata ca vazuta.");
        return;
      }

      if (action === "work") {
        await ctx.answerCbQuery("Alerta marcata in lucru.");
        return;
      }

      await ctx.answerCbQuery("Alerta marcata rezolvata.");
    } catch (error) {
      console.error("Critical alert confirmation failed:", error.message);
      await ctx.answerCbQuery("Confirmarea nu a reusit.", { show_alert: true });
    }
  });

  bot.command("deschise", async (ctx) => {
    try {
      const [receipts, deliveries] = await Promise.all([listReceipts(), listDeliveries()]);
      return ctx.reply(createOpenDocumentsMessage(receipts, deliveries));
    } catch (error) {
      console.error("Failed to load open documents:", error.message);
      return ctx.reply("Nu am putut incarca documentele neinchise.");
    }
  });

  bot.command("plati", async (ctx) => {
    try {
      const receipts = await listReceipts();
      return ctx.reply(createOutstandingPaymentsMessage(receipts));
    } catch (error) {
      console.error("Failed to load outstanding payments:", error.message);
      return ctx.reply("Nu am putut incarca loturile neachitate.");
    }
  });

  bot.command("reclamatii", async (ctx) => {
    try {
      const complaints = await listComplaints();
      return ctx.reply(createOpenComplaintsMessage(complaints));
    } catch (error) {
      console.error("Failed to load open complaints:", error.message);
      return ctx.reply("Nu am putut incarca reclamatiile deschise.");
    }
  });

  bot.command("modificari", async (ctx) => {
    try {
      const auditLogs = await listAuditLogs();
      return ctx.reply(createRecentChangesMessage(auditLogs));
    } catch (error) {
      console.error("Failed to load recent changes:", error.message);
      return ctx.reply("Nu am putut incarca modificarile recente.");
    }
  });

  bot.on("text", async (ctx) => {
    if (!ctx.message?.text || ctx.message.text.startsWith("/")) {
      return;
    }

    const session = sessions.get(ctx.chat.id);
    if (!session) {
      return;
    }

    const currentStep = steps[session.stepIndex];
    session.payload[currentStep.key] = ctx.message.text === "-" ? "" : ctx.message.text;
    session.stepIndex += 1;

    if (session.stepIndex >= steps.length) {
      try {
        const receipt = await createReceipt({
          ...session.payload,
          source: "telegram",
          receivedBy: session.receivedBy,
          status: "Noua"
        });

        sessions.delete(ctx.chat.id);
        return ctx.reply(createReceiptMessage(receipt));
      } catch (error) {
        console.error("Failed to save Telegram receipt:", error.message);
        return ctx.reply("A aparut o eroare la salvarea receptiei. Incearca din nou.");
      }
    }

    return ctx.reply(steps[session.stepIndex].question);
  });

  bot.catch((error) => {
    console.error("Telegram bot error:", error.message);
  });

  bot
    .launch()
    .then(() => {
      console.log("Telegram bot polling started.");
    })
    .catch((error) => {
      activeBot = null;
      console.error("Telegram launch failed:", error.message);
    });

  return bot;
}

module.exports = {
  isBotReady,
  sendTelegramMessagesToAudience,
  startBot
};
