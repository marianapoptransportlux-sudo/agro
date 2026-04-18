const { Telegraf } = require("telegraf");
const {
  createReceipt,
  findUserByUsername,
  getDailyReport,
  listAuditLogs,
  listComplaints,
  listDeliveries,
  listOpeningDebtItems,
  listReceipts
} = require("./storage");
const { getTelegramLinksForUsernames, linkTelegramUser } = require("./automation-state");
const {
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
    await ctx.reply(message);
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
  const telegramUsername = String(ctx.from?.username || "").trim().toLowerCase();
  if (!telegramUsername) {
    return "Seteaza un username Telegram pentru a lega contul intern si a primi rapoarte automate.";
  }

  const user = await findUserByUsername(telegramUsername);
  if (!user) {
    return `Nu exista utilizator intern cu username-ul ${telegramUsername}.`;
  }

  if (!String(user.channel || "").includes("telegram")) {
    return `Utilizatorul ${telegramUsername} nu are activ canalul Telegram in sistem.`;
  }

  linkTelegramUser(user.username, {
    chatId: ctx.chat?.id,
    telegramUsername,
    firstName: ctx.from?.first_name || ""
  });

  return `Canal Telegram activat pentru ${user.username}. Vei primi rapoarte automate daca esti inclus in audienta.`;
}

function isBotReady() {
  return Boolean(activeBot);
}

async function sendTelegramMessagesToAudience(usernames = [], messages = []) {
  if (!activeBot || !usernames.length || !messages.length) {
    return 0;
  }

  const links = getTelegramLinksForUsernames(usernames);
  const chatIds = Array.from(new Set(links.map((item) => String(item.chatId || "").trim()).filter(Boolean)));
  let sentCount = 0;

  for (const chatId of chatIds) {
    for (const message of messages) {
      await activeBot.telegram.sendMessage(chatId, message);
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
      return replyWithMessages(ctx, buildManagementTelegramReportMessages(snapshot));
    } catch (error) {
      console.error("Failed to build Telegram daily report:", error.message);
      return ctx.reply("Nu am putut genera raportul zilnic.");
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
