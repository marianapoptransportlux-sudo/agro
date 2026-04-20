const fs = require("fs");
const path = require("path");
const { createPasswordRecord } = require("./auth");
const { backupRuntimeData } = require("./runtime-backup");

const dataDir = path.join(process.cwd(), ".runtime-data");
const legacyDataDir = path.join(process.cwd(), "data");
const receiptsFile = path.join(dataDir, "receipts.json");
const configFile = path.join(dataDir, "config.json");

const defaultReceiptsState = {
  openingDocuments: [],
  receipts: [],
  processings: [],
  transactions: [],
  deliveries: [],
  complaints: [],
  partnerAdvances: [],
  auditLogs: [],
  lastId: 0,
  migrations: {}
};

const defaultConfigState = {
  nextIds: {
    roles: 6,
    users: 5,
    partners: 2,
    products: 2,
    storageLocations: 6,
    tariffs: 2,
    paymentTypes: 2,
    fiscalProfiles: 3,
    processingTypes: 3
  },
  roles: [
    { id: 1, name: "Operator receptie", code: "operator", permissions: "receptie, procesare" },
    { id: 2, name: "Manager", code: "manager", permissions: "control, incasari primare" },
    { id: 3, name: "Contabil", code: "accountant", permissions: "plati, incasari, documente" },
    { id: 4, name: "Administrator sistem", code: "admin", permissions: "setup, utilizatori" },
    { id: 5, name: "Control / conducere", code: "control", permissions: "rapoarte, audit" },
    { id: 6, name: "Contabil sef", code: "accountant-sef", permissions: "reclamatii, ajustari stoc, ajustari factura, audit" }
  ],
  users: [
    { id: 1, name: "Operator demo", username: "operator", roleCode: "operator", channel: "web", active: true },
    { id: 2, name: "Manager demo", username: "manager", roleCode: "manager", channel: "web+telegram", active: true },
    { id: 3, name: "Contabil demo", username: "contabil", roleCode: "accountant", channel: "web", active: true },
    { id: 4, name: "Admin demo", username: "admin", roleCode: "admin", channel: "web", active: true },
    { id: 5, name: "Control demo", username: "control", roleCode: "control", channel: "telegram", active: true }
  ],
  partners: [
    {
      id: 1,
      name: "Agro Nord",
      idno: "100260000001",
      address: "Balti",
      phone: "+37360000001",
      role: "furnizor",
      fiscalProfile: "Persoana fizica"
    },
    {
      id: 2,
      name: "Export Grain",
      idno: "100260000002",
      address: "Chisinau",
      phone: "+37360000002",
      role: "cumparator",
      fiscalProfile: "Persoana juridica platitor TVA"
    }
  ],
  products: [
    { id: 1, name: "Grau", code: "GRAU", unit: "tone", humidityNorm: 14, impurityNorm: 2, active: true },
    { id: 2, name: "Porumb", code: "PORUMB", unit: "tone", humidityNorm: 14, impurityNorm: 2, active: true }
  ],
  storageLocations: [
    { id: 1, name: "Groapa primire", type: "groapa", capacity: 120, costCategory: "neprocesat", active: true },
    { id: 2, name: "Tampon 1", type: "tampon", capacity: 100, costCategory: "neprocesat", active: true },
    { id: 3, name: "Tampon 2", type: "tampon", capacity: 100, costCategory: "neprocesat", active: true },
    { id: 4, name: "Cilindru 1", type: "cilindru", capacity: 2000, costCategory: "procesat", active: true },
    { id: 5, name: "Cilindru 2", type: "cilindru", capacity: 2000, costCategory: "procesat", active: true },
    { id: 6, name: "Depozit separat", type: "depozit", capacity: 500, costCategory: "neprocesat", active: true }
  ],
  tariffs: [
    {
      id: 1,
      service: "Curatire",
      product: "General",
      partner: "General",
      fiscalProfile: "General",
      calculation: "pe tona",
      value: 120,
      validFrom: "2026-01-01",
      active: true
    },
    {
      id: 2,
      service: "Uscare",
      product: "General",
      partner: "General",
      fiscalProfile: "General",
      calculation: "pe tona si procent",
      value: 250,
      validFrom: "2026-01-01",
      active: true
    }
  ],
  paymentTypes: [
    { id: 1, name: "Numerar", active: true },
    { id: 2, name: "Transfer", active: true }
  ],
  fiscalProfiles: [
    { id: 1, name: "Persoana fizica", withholdingPercent: 7, vat: false, active: true },
    { id: 2, name: "Persoana juridica platitor TVA", withholdingPercent: 0, vat: true, active: true },
    { id: 3, name: "Persoana juridica neplatitor TVA", withholdingPercent: 0, vat: false, active: true }
  ],
  processingTypes: [
    { id: 1, name: "Curatire", consumptionNorm: 0.5, resource: "energie", active: true },
    { id: 2, name: "Uscare", consumptionNorm: 1.2, resource: "gaz", active: true },
    { id: 3, name: "Pastrare", consumptionNorm: 0, resource: "spatiu", active: true }
  ],
  systemSettings: {
    closeOfDayHour: 17,
    reportChannel: "telegram",
    reportAudience: "manager,control",
    defaultCurrency: "MDL"
  }
};

const configEntities = [
  "roles",
  "users",
  "partners",
  "products",
  "storageLocations",
  "tariffs",
  "paymentTypes",
  "fiscalProfiles",
  "processingTypes"
];

const defaultUserPassword = process.env.DEFAULT_USER_PASSWORD || "Agro2026!";

function slugifyUsername(value) {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/(^\.+|\.+$)/g, "");

  return normalized || "utilizator";
}

function buildUniqueUsername(users, preferredUsername, excludeId = null) {
  const base = slugifyUsername(preferredUsername);
  let candidate = base;
  let counter = 2;

  while (
    users.some(
      (item) =>
        item.id !== excludeId &&
        String(item.username || "").trim().toLowerCase() === candidate.toLowerCase()
    )
  ) {
    candidate = `${base}.${counter}`;
    counter += 1;
  }

  return candidate;
}

function sanitizeUserForClient(user) {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    roleCode: user.roleCode,
    channel: user.channel,
    active: user.active !== false,
    requirePasswordChange: user.requirePasswordChange === true,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

function ensureUserSecurityState(users = []) {
  let changed = false;
  const normalizedUsers = [];
  const demoUsernamesByRole = {
    operator: "operator",
    manager: "manager",
    accountant: "contabil",
    admin: "admin",
    control: "control"
  };

  for (const user of users) {
    const nextUser = { ...user };

    const demoUsername = demoUsernamesByRole[nextUser.roleCode];
    if (
      demoUsername &&
      String(nextUser.name || "").toLowerCase().endsWith("demo") &&
      (!nextUser.username || nextUser.username === `${slugifyUsername(nextUser.name)}`
        || nextUser.username === `${slugifyUsername(nextUser.name)}.2`)
    ) {
      nextUser.username = buildUniqueUsername(
        [...users, ...normalizedUsers],
        demoUsername,
        nextUser.id
      );
      changed = true;
    } else if (!nextUser.username) {
      nextUser.username = buildUniqueUsername(
        [...users, ...normalizedUsers],
        nextUser.name || "utilizator",
        nextUser.id
      );
      changed = true;
    }

    if (nextUser.active === undefined) {
      nextUser.active = true;
      changed = true;
    }

    if (!nextUser.passwordSalt || !nextUser.passwordHash) {
      const passwordRecord = createPasswordRecord(defaultUserPassword, { lenient: true });
      nextUser.passwordSalt = passwordRecord.salt;
      nextUser.passwordHash = passwordRecord.hash;
      nextUser.requirePasswordChange = true;
      changed = true;
    }

    normalizedUsers.push(nextUser);
  }

  return { users: normalizedUsers, changed };
}

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

function ensureStorage() {
  ensureDir();

  if (!fs.existsSync(receiptsFile)) {
    const legacyReceiptsFile = path.join(legacyDataDir, "receipts.json");
    const initialReceiptsState = fs.existsSync(legacyReceiptsFile)
      ? JSON.parse(fs.readFileSync(legacyReceiptsFile, "utf8"))
      : defaultReceiptsState;

    fs.writeFileSync(receiptsFile, JSON.stringify(initialReceiptsState, null, 2), "utf8");
  }

  if (!fs.existsSync(configFile)) {
    fs.writeFileSync(configFile, JSON.stringify(defaultConfigState, null, 2), "utf8");
  }
}

function readJson(file, fallback) {
  ensureStorage();
  const raw = fs.readFileSync(file, "utf8");
  const parsed = JSON.parse(raw);
  return { ...fallback, ...parsed };
}

function writeJson(file, state) {
  ensureStorage();
  backupRuntimeData();
  fs.writeFileSync(file, JSON.stringify(state, null, 2), "utf8");
}

function readReceiptsState() {
  return readJson(receiptsFile, defaultReceiptsState);
}

function writeReceiptsState(state) {
  writeJson(receiptsFile, state);
}

function readConfigState() {
  const state = readJson(configFile, defaultConfigState);

  for (const entity of configEntities) {
    if (!Array.isArray(state[entity])) {
      state[entity] = [...defaultConfigState[entity]];
    } else if (state[entity].length === 0 && defaultConfigState[entity].length > 0) {
      state[entity] = [...defaultConfigState[entity]];
    }
  }

  state.nextIds = { ...defaultConfigState.nextIds, ...(state.nextIds || {}) };
  state.systemSettings = { ...defaultConfigState.systemSettings, ...(state.systemSettings || {}) };

  for (const entity of configEntities) {
    const maxId = state[entity].reduce((max, item) => Math.max(max, Number(item.id || 0)), 0);
    state.nextIds[entity] = Math.max(Number(state.nextIds[entity] || 0), maxId);
  }

  const userSecurityState = ensureUserSecurityState(state.users);
  if (userSecurityState.changed) {
    state.users = userSecurityState.users;
    writeJson(configFile, state);
  } else {
    state.users = userSecurityState.users;
  }

  return state;
}

function writeConfigState(state) {
  writeJson(configFile, state);
}

function sanitizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  return value === "true" || value === "1" || value === 1;
}

function sanitizeNumber(value) {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function requiredText(value, label) {
  const normalized = String(value || "").trim();

  if (!normalized) {
    throw new Error(`${label} este obligatoriu.`);
  }

  return normalized;
}

const DELIVERY_STATES = {
  PROIECT: "Proiect",
  CONFIRMAT: "Confirmat",
  LIVRAT: "Livrat",
  INCHIS: "Inchis",
  ANULAT: "Anulat",
  REDESCHIS: "Redeschis"
};

const DELIVERY_TRANSITIONS = {
  Proiect: ["Confirmat", "Anulat"],
  Confirmat: ["Livrat", "Anulat"],
  Livrat: ["Inchis", "Redeschis"],
  Inchis: ["Redeschis"],
  Redeschis: ["Confirmat", "Livrat", "Inchis", "Anulat"],
  Anulat: []
};

const RESERVED_DELIVERY_STATES = new Set(["Confirmat", "Livrat", "Inchis", "Redeschis"]);
const PHYSICAL_DELIVERY_STATES = new Set(["Livrat", "Inchis"]);

const LEGACY_DELIVERY_STATUS_MAP = {
  Livrata: "Livrat"
};

const COMPLAINT_STATES = {
  DESCHISA: "Deschisa",
  ACCEPTATA: "Acceptata",
  RESPINSA: "Respinsa",
  INCHISA: "Inchisa"
};

const COMPLAINT_TRANSITIONS = {
  Deschisa: ["Acceptata", "Respinsa"],
  Acceptata: ["Inchisa"],
  Respinsa: ["Inchisa"],
  Inchisa: []
};

const VALID_INVOICE_ADJUSTMENT_TYPES = new Set(["adjust", "deduct-last", "invoice-minus"]);
const STOCK_ADJUSTMENT_ROLES = new Set(["accountant-sef", "manager", "admin"]);
const INVOICE_ADJUSTMENT_ROLES = new Set(["accountant", "accountant-sef", "manager", "admin"]);

function assertDeliveryTransition(from, to) {
  const allowed = DELIVERY_TRANSITIONS[from];
  if (!allowed) {
    throw new Error(`Starea curenta a livrarii nu e recunoscuta: ${from}.`);
  }
  if (!allowed.includes(to)) {
    throw new Error(`Tranzitie nevalida a livrarii: ${from} -> ${to}.`);
  }
}

function assertComplaintTransition(from, to) {
  const allowed = COMPLAINT_TRANSITIONS[from];
  if (!allowed) {
    throw new Error(`Starea curenta a reclamatiei nu e recunoscuta: ${from}.`);
  }
  if (!allowed.includes(to)) {
    throw new Error(`Tranzitie nevalida a reclamatiei: ${from} -> ${to}.`);
  }
}

function sumReservedByReceipt(state, receiptId) {
  return (state.deliveries || [])
    .filter(
      (item) =>
        item.receiptId === Number(receiptId) && RESERVED_DELIVERY_STATES.has(item.status)
    )
    .reduce((sum, item) => sum + Number(item.plannedQuantity || item.deliveredQuantity || 0), 0);
}

function sumDeliveredByReceipt(state, receiptId) {
  return (state.deliveries || [])
    .filter(
      (item) =>
        item.receiptId === Number(receiptId) && PHYSICAL_DELIVERY_STATES.has(item.status)
    )
    .reduce((sum, item) => sum + Number(item.deliveredQuantity || 0), 0);
}

function computeReceiptDeliveryStatus(baseQuantity, reservedQuantity, deliveredQuantity) {
  if (baseQuantity <= 0) {
    return "Nelivrat";
  }
  if (deliveredQuantity >= baseQuantity) {
    return "Livrat complet";
  }
  if (deliveredQuantity > 0) {
    return "Livrat partial";
  }
  if (reservedQuantity >= baseQuantity) {
    return "Rezervat complet";
  }
  if (reservedQuantity > 0) {
    return "Rezervat partial";
  }
  return "Nelivrat";
}

function recalcReceiptDeliveryState(state, receiptId) {
  const receipt = state.receipts.find((item) => item.id === Number(receiptId));
  if (!receipt) {
    return null;
  }
  const baseQuantity = Number(
    receipt.finalNetQuantity ?? receipt.provisionalNetQuantity ?? receipt.quantity ?? 0
  );
  const reservedQuantity = sumReservedByReceipt(state, receipt.id);
  const deliveredQuantity = sumDeliveredByReceipt(state, receipt.id);
  receipt.reservedQuantity = reservedQuantity;
  receipt.deliveredQuantity = deliveredQuantity;
  receipt.availableQuantity = Math.max(baseQuantity - reservedQuantity, 0);
  receipt.deliveryStatus = computeReceiptDeliveryStatus(
    baseQuantity,
    reservedQuantity,
    deliveredQuantity
  );
  receipt.updatedAt = new Date().toISOString();
  return receipt;
}

function recalcReceiptOpenComplaintsFlag(state, receiptId) {
  const receipt = state.receipts.find((item) => item.id === Number(receiptId));
  if (!receipt) {
    return null;
  }
  const deliveries = (state.deliveries || []).filter(
    (item) => item.receiptId === receipt.id
  );
  const deliveryIds = new Set(deliveries.map((item) => item.id));
  receipt.hasOpenComplaint = (state.complaints || []).some(
    (item) =>
      deliveryIds.has(item.deliveryId) && item.status === COMPLAINT_STATES.DESCHISA
  );
  receipt.updatedAt = new Date().toISOString();
  return receipt;
}

function createReceiptSummary(receipts) {
  const totalReceipts = receipts.length;
  const totalQuantity = receipts.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalValue = receipts.reduce(
    (sum, item) => {
      const fallbackValue = Number(item.quantity || 0) * Number(item.price || 0);
      return sum + Number(item.preliminaryPayableAmount ?? fallbackValue);
    },
    0
  );

  const byStatus = receipts.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  return {
    totalReceipts,
    totalQuantity,
    totalValue,
    byStatus
  };
}

function createProcessingSummary(processings) {
  return {
    totalProcessings: processings.length,
    totalProcessedQuantity: processings.reduce(
      (sum, item) => sum + Number(item.processedQuantity || 0),
      0
    ),
    totalConfirmedWaste: processings.reduce(
      (sum, item) => sum + Number(item.confirmedWaste || 0),
      0
    )
  };
}

function createTransactionSummary(transactions) {
  const supplierPayments = transactions.filter((item) => item.direction === "payment");
  const customerCollections = transactions.filter((item) => item.direction === "collection");

  return {
    totalPayments: supplierPayments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    totalCollections: customerCollections.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    totalTransactions: transactions.length
  };
}

function createDeliverySummary(deliveries) {
  return {
    totalDeliveries: deliveries.length,
    totalDeliveredQuantity: deliveries.reduce(
      (sum, item) => sum + Number(item.deliveredQuantity || 0),
      0
    )
  };
}

function createComplaintSummary(complaints) {
  return {
    totalComplaints: complaints.length,
    openComplaints: complaints.filter((item) => item.status === "Deschisa").length,
    acceptedQuantity: complaints
      .filter((item) => item.status === "Acceptata")
      .reduce((sum, item) => sum + Number(item.contestedQuantity || 0), 0)
  };
}

function createAuditSummary(auditLogs) {
  return {
    totalAuditLogs: auditLogs.length,
    recentAuditLogs: auditLogs.filter((item) => {
      const createdAt = new Date(item.createdAt).getTime();
      return Date.now() - createdAt <= 1000 * 60 * 60 * 24;
    }).length
  };
}

function createOpeningSummary(openingDocuments) {
  const stockItems = openingDocuments.flatMap((item) => item.stockItems || []);
  const debtItems = openingDocuments.flatMap((item) => item.debtItems || []);

  return {
    totalOpeningDocuments: openingDocuments.length,
    openingStockQuantity: stockItems.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    openingDebtPayments: debtItems
      .filter((item) => item.direction === "payment")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    openingDebtCollections: debtItems
      .filter((item) => item.direction === "collection")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  };
}

function normalizeOpeningDocuments(openingDocuments = []) {
  return openingDocuments.map((document) => ({
    ...document,
    stockItems: (document.stockItems || []).map((item, index) => ({
      ...item,
      openingStockId: item.openingStockId || `OS-${document.id}-${index + 1}`
    })),
    debtItems: (document.debtItems || []).map((item, index) => ({
      ...item,
      openingDebtId: item.openingDebtId || `OD-${document.id}-${index + 1}`,
      settledAmount: Number(item.settledAmount || 0),
      status:
        item.status ||
        (item.direction === "collection" ? "Neincasat" : "Neachitat")
    }))
  }));
}

function listOpeningDebtItemsFromDocuments(openingDocuments = []) {
  return normalizeOpeningDocuments(openingDocuments).flatMap((item) => item.debtItems || []);
}

function createStockSummary(receipts, deliveries = [], openingDocuments = []) {
  const stockByLocation = new Map();
  const deliveredByLocation = new Map();
  const openingStockItems = openingDocuments.flatMap((item) => item.stockItems || []);

  for (const item of deliveries) {
    const location = item.location || "Fara locatie";
    const key = `${location}::${item.product}`;
    deliveredByLocation.set(
      key,
      (deliveredByLocation.get(key) || 0) + Number(item.deliveredQuantity || 0)
    );
  }

  for (const item of openingStockItems) {
    const location = item.location || "Fara locatie";
    const key = `${location}::${item.product}`;
    const existing = stockByLocation.get(key) || {
      location,
      product: item.product,
      quantity: 0,
      unit: item.unit || "tone",
      costCategory: item.locationId || null
    };

    existing.quantity += Number(item.quantity || 0);
    stockByLocation.set(key, existing);
  }

  for (const item of receipts) {
    const location = item.location || "Fara locatie";
    const key = `${location}::${item.product}`;
    const fallbackQuantity = Number(item.quantity || 0);
    const quantity = Number(item.finalNetQuantity ?? item.provisionalNetQuantity ?? fallbackQuantity);
    const existing = stockByLocation.get(key) || {
      location,
      product: item.product,
      quantity: 0,
      unit: item.unit,
      costCategory: item.locationId || null
    };

    existing.quantity += quantity;
    stockByLocation.set(key, existing);
  }

  const byLocation = Array.from(stockByLocation.values())
    .map((item) => {
      const key = `${item.location}::${item.product}`;
      const deliveredQuantity = Number(deliveredByLocation.get(key) || 0);
      return {
        ...item,
        deliveredQuantity,
        quantity: Math.max(Number(item.quantity || 0) - deliveredQuantity, 0)
      };
    })
    .sort((a, b) => {
    if (a.location === b.location) {
      return a.product.localeCompare(b.product, "ro");
    }
    return a.location.localeCompare(b.location, "ro");
    });

  const totals = {
    totalQuantity: byLocation.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    totalLocations: new Set(byLocation.map((item) => item.location)).size,
    totalProducts: new Set(byLocation.map((item) => item.product)).size
  };

  return {
    byLocation,
    totals
  };
}

function createConfigSummary(config) {
  return {
    partners: config.partners.length,
    products: config.products.length,
    storageLocations: config.storageLocations.length,
    tariffs: config.tariffs.length,
    roles: config.roles.length,
    users: config.users.length
  };
}

function requiredChangeReason(value) {
  return requiredText(value, "Mentiunea modificarii");
}

const SENSITIVE_FIELD_NAMES = new Set([
  "password",
  "passwordSalt",
  "passwordHash",
  "token",
  "sessionToken",
  "apiKey",
  "apikey",
  "secret"
]);

function maskSensitiveFields(value) {
  if (value === null || value === undefined) return value;
  if (Array.isArray(value)) return value.map(maskSensitiveFields);
  if (typeof value !== "object") return value;
  const out = {};
  for (const key of Object.keys(value)) {
    if (SENSITIVE_FIELD_NAMES.has(key)) {
      out[key] = "***";
    } else {
      out[key] = maskSensitiveFields(value[key]);
    }
  }
  return out;
}

function createAuditEntry(state, payload) {
  if (!Array.isArray(state.auditLogs)) {
    state.auditLogs = [];
  }

  const entry = {
    id: state.auditLogs.length + 1,
    entityType: payload.entityType,
    entityId: payload.entityId ? Number(payload.entityId) : null,
    action: payload.action,
    reason: payload.reason,
    user: payload.user || "dashboard",
    oldValue: maskSensitiveFields(payload.oldValue) || null,
    newValue: maskSensitiveFields(payload.newValue) || null,
    createdAt: new Date().toISOString()
  };

  state.auditLogs.push(entry);
  return entry;
}

async function appendAuditLog(payload) {
  const state = readReceiptsState();
  const entry = createAuditEntry(state, payload);
  writeReceiptsState(state);
  return entry;
}

function getReceiptAvailableQuantity(state, receiptId) {
  const receipt = state.receipts.find((item) => item.id === Number(receiptId));
  if (!receipt) {
    return null;
  }

  const baseQuantity = Number(
    receipt.finalNetQuantity ?? receipt.provisionalNetQuantity ?? receipt.quantity ?? 0
  );
  const reservedQuantity = sumReservedByReceipt(state, receipt.id);
  return Math.max(baseQuantity - reservedQuantity, 0);
}

function filterByDate(items, dateValue) {
  if (!dateValue) {
    return items;
  }

  return items.filter((item) => String(item.createdAt || "").slice(0, 10) === dateValue);
}

function createDailyReport(dateValue, receipts, processings, transactions, stockSummary) {
  const dailyReceipts = filterByDate(receipts, dateValue);
  const dailyProcessings = filterByDate(processings, dateValue);
  const dailyTransactions = filterByDate(transactions, dateValue);

  return {
    date: dateValue,
    summary: {
      receiptsCount: dailyReceipts.length,
      grossQuantity: dailyReceipts.reduce((sum, item) => sum + Number(item.grossQuantity || item.quantity || 0), 0),
      provisionalNetQuantity: dailyReceipts.reduce(
        (sum, item) => sum + Number(item.provisionalNetQuantity || item.quantity || 0),
        0
      ),
      processedQuantity: dailyProcessings.reduce(
        (sum, item) => sum + Number(item.processedQuantity || 0),
        0
      ),
      confirmedWaste: dailyProcessings.reduce(
        (sum, item) => sum + Number(item.confirmedWaste || 0),
        0
      ),
      paymentsTotal: dailyTransactions
        .filter((item) => item.direction === "payment")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
      collectionsTotal: dailyTransactions
        .filter((item) => item.direction === "collection")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
      stockTotal: stockSummary.totals.totalQuantity
    },
    receipts: dailyReceipts,
    processings: dailyProcessings,
    transactions: dailyTransactions
  };
}

function normalizeEntityPayload(entity, payload) {
  switch (entity) {
    case "partners":
      return {
        name: requiredText(payload.name, "Denumirea partenerului"),
        idno: String(payload.idno || "").trim(),
        address: String(payload.address || "").trim(),
        phone: String(payload.phone || "").trim(),
        role: requiredText(payload.role || "furnizor", "Rolul partenerului"),
        fiscalProfile: requiredText(
          payload.fiscalProfile || "Persoana fizica",
          "Statutul fiscal"
        )
      };
    case "products":
      return {
        name: requiredText(payload.name, "Denumirea produsului"),
        code: requiredText(payload.code, "Codul produsului"),
        unit: requiredText(payload.unit || "tone", "Unitatea de masura"),
        humidityNorm: sanitizeNumber(payload.humidityNorm),
        impurityNorm: sanitizeNumber(payload.impurityNorm),
        active: sanitizeBoolean(payload.active ?? true)
      };
    case "storageLocations":
      return {
        name: requiredText(payload.name, "Denumirea locatiei"),
        type: requiredText(payload.type || "cilindru", "Tipul locatiei"),
        capacity: sanitizeNumber(payload.capacity),
        costCategory: requiredText(
          payload.costCategory || "neprocesat",
          "Categoria de cost"
        ),
        active: sanitizeBoolean(payload.active ?? true)
      };
    case "roles":
      return {
        name: requiredText(payload.name, "Numele rolului"),
        code: requiredText(payload.code, "Codul rolului"),
        permissions: String(payload.permissions || "").trim()
      };
    case "users":
      return {
        name: requiredText(payload.name, "Numele utilizatorului"),
        username: requiredText(
          payload.username || slugifyUsername(payload.name),
          "Utilizatorul"
        ),
        roleCode: requiredText(payload.roleCode, "Rolul utilizatorului"),
        channel: requiredText(payload.channel || "web", "Canalul utilizatorului"),
        active: sanitizeBoolean(payload.active ?? true),
        password: String(payload.password || "").trim()
      };
    case "tariffs":
      return {
        service: requiredText(payload.service, "Serviciul"),
        product: requiredText(payload.product || "General", "Produsul"),
        partner: requiredText(payload.partner || "General", "Partenerul"),
        fiscalProfile: requiredText(
          payload.fiscalProfile || "General",
          "Statutul fiscal"
        ),
        calculation: requiredText(payload.calculation, "Modul de calcul"),
        value: sanitizeNumber(payload.value),
        validFrom: requiredText(
          payload.validFrom || new Date().toISOString().slice(0, 10),
          "Data de inceput"
        ),
        active: sanitizeBoolean(payload.active ?? true)
      };
    case "paymentTypes":
      return {
        name: requiredText(payload.name, "Tipul de plata"),
        active: sanitizeBoolean(payload.active ?? true)
      };
    case "fiscalProfiles":
      return {
        name: requiredText(payload.name, "Statutul fiscal"),
        withholdingPercent: sanitizeNumber(payload.withholdingPercent),
        vat: sanitizeBoolean(payload.vat),
        active: sanitizeBoolean(payload.active ?? true)
      };
    case "processingTypes":
      return {
        name: requiredText(payload.name, "Tipul de procesare"),
        consumptionNorm: sanitizeNumber(payload.consumptionNorm),
        resource: requiredText(payload.resource, "Resursa"),
        active: sanitizeBoolean(payload.active ?? true)
      };
    default:
      throw new Error("Unknown config entity.");
  }
}

function assertEntity(entity) {
  if (!configEntities.includes(entity)) {
    throw new Error("Config entity is not supported.");
  }
}

async function listReceipts() {
  const state = readReceiptsState();
  return state.receipts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function listOpeningDocuments() {
  const state = readReceiptsState();
  return normalizeOpeningDocuments(state.openingDocuments || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

async function listOpeningDebtItems() {
  const openingDocuments = await listOpeningDocuments();
  return listOpeningDebtItemsFromDocuments(openingDocuments);
}

async function createOpeningDocument(payload) {
  const state = readReceiptsState();
  const documentId = (state.openingDocuments?.length || 0) + 1;
  const openingDocument = {
    id: documentId,
    documentDate: requiredText(payload.documentDate, "Data documentului"),
    note: String(payload.note || "").trim(),
    stockItems: (payload.stockItems || []).map((item, index) => ({
      id: index + 1,
      openingStockId: `OS-${documentId}-${index + 1}`,
      product: requiredText(item.product, "Produs sold initial"),
      productId: item.productId ? Number(item.productId) : null,
      location: requiredText(item.location, "Locatie sold initial"),
      locationId: item.locationId ? Number(item.locationId) : null,
      quantity: sanitizeNumber(item.quantity),
      unit: requiredText(item.unit || "tone", "Unitate sold initial")
    })),
    debtItems: (payload.debtItems || []).map((item, index) => ({
      id: index + 1,
      openingDebtId: `OD-${documentId}-${index + 1}`,
      partner: requiredText(item.partner, "Partener datorie"),
      partnerId: item.partnerId ? Number(item.partnerId) : null,
      direction: item.direction === "collection" ? "collection" : "payment",
      amount: sanitizeNumber(item.amount),
      settledAmount: 0,
      note: String(item.note || "").trim(),
      status:
        item.direction === "collection"
          ? item.status || "Neincasat"
          : item.status || "Neachitat"
    })),
    createdAt: new Date().toISOString()
  };

  if (!openingDocument.stockItems.length && !openingDocument.debtItems.length) {
    throw new Error("Documentul de sold initial trebuie sa contina stocuri sau datorii.");
  }

  if (!Array.isArray(state.openingDocuments)) {
    state.openingDocuments = [];
  }

  state.openingDocuments.push(openingDocument);
  createAuditEntry(state, {
    entityType: "opening-document",
    entityId: openingDocument.id,
    action: "create",
    reason: "Creare sold initial",
    user: payload.createdBy || "dashboard",
    newValue: { ...openingDocument }
  });
  writeReceiptsState(state);
  return openingDocument;
}

async function createReceipt(payload) {
  const state = readReceiptsState();
  const grossWeight = sanitizeNumber(payload.grossWeight);
  const tareWeight = sanitizeNumber(payload.tareWeight);
  const netWeightFromWeighing = grossWeight > 0 ? Math.max(grossWeight - tareWeight, 0) : 0;
  const netWeight = payload.netWeight !== undefined ? sanitizeNumber(payload.netWeight) : netWeightFromWeighing;
  if (grossWeight > 0 && grossWeight < tareWeight) {
    throw new Error("Masa bruta nu poate fi mai mica decat tara.");
  }
  const receipt = {
    id: state.lastId + 1,
    supplier: payload.supplier,
    supplierId: payload.supplierId ? Number(payload.supplierId) : null,
    product: payload.product,
    productId: payload.productId ? Number(payload.productId) : null,
    quantity: Number(payload.quantity),
    grossQuantity: Number(payload.grossQuantity ?? payload.quantity),
    grossWeight,
    tareWeight,
    netWeight,
    unit: payload.unit,
    price: Number(payload.price),
    humidity: sanitizeNumber(payload.humidity),
    impurity: sanitizeNumber(payload.impurity),
    humidityNorm: sanitizeNumber(payload.humidityNorm),
    impurityNorm: sanitizeNumber(payload.impurityNorm),
    excessHumidity: sanitizeNumber(payload.excessHumidity),
    excessImpurity: sanitizeNumber(payload.excessImpurity),
    estimatedWaterLoss: sanitizeNumber(payload.estimatedWaterLoss),
    estimatedImpurityLoss: sanitizeNumber(payload.estimatedImpurityLoss),
    provisionalNetQuantity: sanitizeNumber(payload.provisionalNetQuantity),
    cleaningServiceTotal: sanitizeNumber(payload.cleaningServiceTotal),
    dryingServiceTotal: sanitizeNumber(payload.dryingServiceTotal),
    preliminaryServicesTotal: sanitizeNumber(payload.preliminaryServicesTotal),
    preliminaryMerchandiseValue: sanitizeNumber(payload.preliminaryMerchandiseValue),
    withholdingPercent: sanitizeNumber(payload.withholdingPercent),
    withholdingAmount: sanitizeNumber(payload.withholdingAmount),
    preliminaryPayableAmount: sanitizeNumber(payload.preliminaryPayableAmount),
    vehicle: payload.vehicle || "",
    note: payload.note || "",
    source: payload.source || "dashboard",
    status: payload.status || "Draft",
    receivedBy: payload.receivedBy || "",
    location: payload.location || "",
    locationId: payload.locationId ? Number(payload.locationId) : null,
    reservedQuantity: 0,
    deliveredQuantity: 0,
    availableQuantity: sanitizeNumber(payload.provisionalNetQuantity ?? payload.quantity),
    deliveryStatus: "Nelivrat",
    hasOpenComplaint: false,
    createdAt: new Date().toISOString()
  };

  state.lastId = receipt.id;
  state.receipts.push(receipt);
  createAuditEntry(state, {
    entityType: "receipt",
    entityId: receipt.id,
    action: "create",
    reason: "Creare receptie",
    user: payload.createdBy || "dashboard",
    newValue: { ...receipt }
  });
  writeReceiptsState(state);
  return receipt;
}

async function listProcessings() {
  const state = readReceiptsState();
  return (state.processings || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function listTransactions() {
  const state = readReceiptsState();
  return (state.transactions || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function listDeliveries() {
  const state = readReceiptsState();
  return (state.deliveries || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function listComplaints() {
  const state = readReceiptsState();
  return (state.complaints || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function listAuditLogs() {
  const state = readReceiptsState();
  return (state.auditLogs || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function createProcessing(payload) {
  const state = readReceiptsState();
  const processing = {
    id: (state.processings?.length || 0) + 1,
    receiptId: Number(payload.receiptId),
    product: payload.product,
    sourceLocation: payload.sourceLocation || "",
    processingType: payload.processingType,
    processedQuantity: sanitizeNumber(payload.processedQuantity),
    confirmedWaste: sanitizeNumber(payload.confirmedWaste),
    finalHumidity: sanitizeNumber(payload.finalHumidity),
    finalNetQuantity: sanitizeNumber(payload.finalNetQuantity),
    operator: payload.operator || "",
    status: payload.status || "Confirmat",
    note: payload.note || "",
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(state.processings)) {
    state.processings = [];
  }

  state.processings.push(processing);

  const receipt = state.receipts.find((item) => item.id === processing.receiptId);
  if (receipt) {
    receipt.status = "Procesata";
    receipt.confirmedWaste = processing.confirmedWaste;
    receipt.finalHumidity = processing.finalHumidity;
    receipt.finalNetQuantity = processing.finalNetQuantity;
    receipt.updatedAt = new Date().toISOString();
  }

  createAuditEntry(state, {
    entityType: "processing",
    entityId: processing.id,
    action: "create",
    reason: "Creare procesare",
    user: payload.createdBy || "dashboard",
    newValue: { ...processing }
  });

  writeReceiptsState(state);
  return processing;
}

function computeTargetOutstanding(state, referenceType, refId) {
  if (referenceType === "receipt") {
    const receipt = state.receipts.find((item) => item.id === Number(refId));
    if (!receipt) return null;
    const target = Number(receipt.preliminaryPayableAmount || 0);
    const applied = (state.transactions || [])
      .filter((item) => item.referenceType === "receipt" && item.receiptId === receipt.id)
      .reduce((sum, item) => sum + Number(item.appliedAmount ?? item.amount ?? 0), 0);
    return Math.max(target - applied, 0);
  }
  if (referenceType === "delivery") {
    const delivery = (state.deliveries || []).find((item) => item.id === Number(refId));
    if (!delivery) return null;
    const target = Number(delivery.contractPrice || 0) * Number(delivery.deliveredQuantity || 0);
    const applied = (state.transactions || [])
      .filter((item) => item.referenceType === "delivery" && item.deliveryId === delivery.id)
      .reduce((sum, item) => sum + Number(item.appliedAmount ?? item.amount ?? 0), 0);
    return Math.max(target - applied, 0);
  }
  if (referenceType === "opening-debt") {
    const openingDocuments = state.openingDocuments || [];
    const debtItem = openingDocuments
      .flatMap((doc) => doc.debtItems || [])
      .find((item) => item.openingDebtId === refId);
    if (!debtItem) return null;
    const target = Number(debtItem.amount || 0);
    const settled = Number(debtItem.settledAmount || 0);
    return Math.max(target - settled, 0);
  }
  return null;
}

async function createTransaction(payload) {
  const state = readReceiptsState();
  const referenceType =
    payload.referenceType === "delivery"
      ? "delivery"
      : payload.referenceType === "opening-debt"
        ? "opening-debt"
        : "receipt";
  const refId =
    referenceType === "receipt"
      ? payload.receiptId
      : referenceType === "delivery"
        ? payload.deliveryId
        : payload.openingDebtId;
  const rawAmount = sanitizeNumber(payload.amount);
  const outstanding = computeTargetOutstanding(state, referenceType, refId);
  const appliedAmount = outstanding === null ? rawAmount : Math.min(rawAmount, outstanding);
  const advanceAmount = outstanding === null ? 0 : Math.max(rawAmount - outstanding, 0);

  const transaction = {
    id: (state.transactions?.length || 0) + 1,
    referenceType,
    receiptId: payload.receiptId ? Number(payload.receiptId) : null,
    deliveryId: payload.deliveryId ? Number(payload.deliveryId) : null,
    openingDebtId: payload.openingDebtId || "",
    partnerId: Number(payload.partnerId),
    partner: payload.partner,
    direction: payload.direction,
    status: payload.status || "Confirmat",
    amount: rawAmount,
    appliedAmount,
    advanceAmount,
    source: payload.source || (advanceAmount > 0 ? "overpayment" : "payment"),
    paymentType: payload.paymentType || "",
    note: payload.note || "",
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(state.transactions)) {
    state.transactions = [];
  }
  if (!Array.isArray(state.partnerAdvances)) {
    state.partnerAdvances = [];
  }

  state.transactions.push(transaction);

  if (advanceAmount > 0 && transaction.partnerId) {
    state.partnerAdvances.push({
      id: state.partnerAdvances.length + 1,
      partnerId: transaction.partnerId,
      partner: transaction.partner,
      transactionId: transaction.id,
      amount: advanceAmount,
      remainingAmount: advanceAmount,
      source: "overpayment",
      note: transaction.note,
      createdAt: transaction.createdAt
    });
  }

  if (referenceType === "receipt") {
    const receipt = state.receipts.find((item) => item.id === transaction.receiptId);
    if (receipt) {
      const relatedTransactions = state.transactions.filter(
        (item) => item.referenceType === "receipt" && item.receiptId === receipt.id
      );
      const totalPaid = relatedTransactions.reduce(
        (sum, item) => sum + Number(item.appliedAmount ?? item.amount ?? 0),
        0
      );
      const targetAmount = Number(receipt.preliminaryPayableAmount || 0);
      receipt.paidAmount = totalPaid;
      receipt.paymentStatus =
        totalPaid <= 0 ? "Neachitat" : totalPaid < targetAmount ? "Partial" : "Achitat";
      receipt.updatedAt = new Date().toISOString();
    }
  }

  if (referenceType === "delivery") {
    const delivery = (state.deliveries || []).find((item) => item.id === transaction.deliveryId);
    if (delivery) {
      const relatedTransactions = state.transactions.filter(
        (item) => item.referenceType === "delivery" && item.deliveryId === delivery.id
      );
      const totalCollected = relatedTransactions.reduce(
        (sum, item) => sum + Number(item.appliedAmount ?? item.amount ?? 0),
        0
      );
      const targetAmount = Number(delivery.contractPrice || 0) * Number(delivery.deliveredQuantity || 0);
      delivery.collectedAmount = totalCollected;
      delivery.collectionStatus =
        totalCollected <= 0 ? "Neincasat" : totalCollected < targetAmount ? "Partial incasat" : "Incasat";
      delivery.updatedAt = new Date().toISOString();
    }
  }

  if (referenceType === "opening-debt") {
    const openingDocuments = state.openingDocuments || [];
    const matchedDocument = openingDocuments.find((document) =>
      (document.debtItems || []).some((item) => item.openingDebtId === transaction.openingDebtId)
    );
    const debtItem = matchedDocument?.debtItems?.find(
      (item) => item.openingDebtId === transaction.openingDebtId
    );

    if (debtItem) {
      debtItem.settledAmount = Number(debtItem.settledAmount || 0) + Number(appliedAmount);
      const targetAmount = Number(debtItem.amount || 0);
      debtItem.status =
        debtItem.direction === "collection"
          ? debtItem.settledAmount <= 0
            ? "Neincasat"
            : debtItem.settledAmount < targetAmount
              ? "Partial incasat"
              : "Incasat"
          : debtItem.settledAmount <= 0
            ? "Neachitat"
            : debtItem.settledAmount < targetAmount
              ? "Partial"
              : "Achitat";
    }
  }

  createAuditEntry(state, {
    entityType: "transaction",
    entityId: transaction.id,
    action: "create",
    reason: advanceAmount > 0 ? "Creare tranzactie cu avans" : "Creare tranzactie",
    user: payload.createdBy || "dashboard",
    newValue: { ...transaction }
  });

  writeReceiptsState(state);
  return transaction;
}

async function listPartnerAdvances(partnerId) {
  const state = readReceiptsState();
  const advances = state.partnerAdvances || [];
  if (partnerId === undefined || partnerId === null) {
    return advances;
  }
  return advances.filter((item) => item.partnerId === Number(partnerId));
}

async function applyAdvanceCredit(payload = {}) {
  const state = readReceiptsState();
  const partnerId = Number(payload.partnerId);
  if (!Number.isFinite(partnerId) || partnerId <= 0) {
    throw new Error("Partenerul este obligatoriu pentru aplicarea avansului.");
  }
  const referenceType =
    payload.referenceType === "receipt" ? "receipt" : "delivery";
  const refId =
    referenceType === "receipt" ? payload.receiptId : payload.deliveryId;
  if (!refId) {
    throw new Error("Referinta (receiptId sau deliveryId) este obligatorie.");
  }
  const requestedAmount = sanitizeNumber(payload.amount);
  if (requestedAmount <= 0) {
    throw new Error("Suma de aplicat trebuie sa fie mai mare ca zero.");
  }
  const outstanding = computeTargetOutstanding(state, referenceType, refId);
  if (outstanding === null) {
    throw new Error("Documentul tinta pentru aplicarea avansului nu exista.");
  }
  const applyLimit = Math.min(requestedAmount, outstanding);
  if (applyLimit <= 0) {
    throw new Error("Documentul tinta nu mai are sold ramas de acoperit.");
  }

  const advances = (state.partnerAdvances || [])
    .filter((item) => item.partnerId === partnerId && Number(item.remainingAmount) > 0)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  let consumed = 0;
  const consumedFrom = [];
  for (const advance of advances) {
    if (consumed >= applyLimit) break;
    const take = Math.min(Number(advance.remainingAmount), applyLimit - consumed);
    advance.remainingAmount = Number(advance.remainingAmount) - take;
    consumed += take;
    consumedFrom.push({ advanceId: advance.id, amount: take });
  }

  if (consumed <= 0) {
    throw new Error("Partenerul nu are avans disponibil.");
  }

  const direction = referenceType === "delivery" ? "collection" : "payment";
  const transaction = {
    id: (state.transactions?.length || 0) + 1,
    referenceType,
    receiptId: referenceType === "receipt" ? Number(refId) : null,
    deliveryId: referenceType === "delivery" ? Number(refId) : null,
    openingDebtId: "",
    partnerId,
    partner: payload.partner || advances[0]?.partner || "",
    direction,
    status: "Confirmat",
    amount: consumed,
    appliedAmount: consumed,
    advanceAmount: 0,
    source: "advance-applied",
    consumedFrom,
    paymentType: "avans",
    note: String(payload.note || "Aplicare avans").trim(),
    createdAt: new Date().toISOString()
  };
  if (!Array.isArray(state.transactions)) state.transactions = [];
  state.transactions.push(transaction);

  if (referenceType === "receipt") {
    const receipt = state.receipts.find((item) => item.id === Number(refId));
    if (receipt) {
      const total = (state.transactions || [])
        .filter((item) => item.referenceType === "receipt" && item.receiptId === receipt.id)
        .reduce((sum, item) => sum + Number(item.appliedAmount ?? item.amount ?? 0), 0);
      const target = Number(receipt.preliminaryPayableAmount || 0);
      receipt.paidAmount = total;
      receipt.paymentStatus = total <= 0 ? "Neachitat" : total < target ? "Partial" : "Achitat";
      receipt.updatedAt = new Date().toISOString();
    }
  } else {
    const delivery = (state.deliveries || []).find((item) => item.id === Number(refId));
    if (delivery) {
      const total = (state.transactions || [])
        .filter((item) => item.referenceType === "delivery" && item.deliveryId === delivery.id)
        .reduce((sum, item) => sum + Number(item.appliedAmount ?? item.amount ?? 0), 0);
      const target = Number(delivery.contractPrice || 0) * Number(delivery.deliveredQuantity || 0);
      delivery.collectedAmount = total;
      delivery.collectionStatus =
        total <= 0 ? "Neincasat" : total < target ? "Partial incasat" : "Incasat";
      delivery.updatedAt = new Date().toISOString();
    }
  }

  createAuditEntry(state, {
    entityType: "transaction",
    entityId: transaction.id,
    action: "apply-advance",
    reason: requiredChangeReason(payload.changeReason || "Aplicare avans existent"),
    user: payload.changedBy || "dashboard",
    newValue: { ...transaction }
  });

  writeReceiptsState(state);
  return transaction;
}

async function updateProcessing(id, payload = {}) {
  const state = readReceiptsState();
  const processing = (state.processings || []).find((item) => item.id === Number(id));

  if (!processing) {
    return null;
  }

  const reason = requiredChangeReason(payload.changeReason);
  const oldValue = {
    status: processing.status,
    note: processing.note
  };

  if (payload.status !== undefined) {
    processing.status = requiredText(payload.status, "Status procesare");
  }

  if (payload.note !== undefined) {
    processing.note = String(payload.note || "").trim();
  }

  processing.updatedAt = new Date().toISOString();

  createAuditEntry(state, {
    entityType: "processing",
    entityId: processing.id,
    action: "update",
    reason,
    user: payload.changedBy || "dashboard",
    oldValue,
    newValue: {
      status: processing.status,
      note: processing.note
    }
  });

  writeReceiptsState(state);
  return processing;
}

async function updateTransaction(id, payload = {}) {
  const state = readReceiptsState();
  const transaction = (state.transactions || []).find((item) => item.id === Number(id));

  if (!transaction) {
    return null;
  }

  const reason = requiredChangeReason(payload.changeReason);
  const oldValue = {
    status: transaction.status,
    note: transaction.note,
    paymentType: transaction.paymentType
  };

  if (payload.status !== undefined) {
    transaction.status = requiredText(payload.status, "Status tranzactie");
  }

  if (payload.note !== undefined) {
    transaction.note = String(payload.note || "").trim();
  }

  if (payload.paymentType !== undefined) {
    transaction.paymentType = String(payload.paymentType || "").trim();
  }

  transaction.updatedAt = new Date().toISOString();

  createAuditEntry(state, {
    entityType: "transaction",
    entityId: transaction.id,
    action: "update",
    reason,
    user: payload.changedBy || "dashboard",
    oldValue,
    newValue: {
      status: transaction.status,
      note: transaction.note,
      paymentType: transaction.paymentType
    }
  });

  writeReceiptsState(state);
  return transaction;
}

async function createDelivery(payload) {
  const state = readReceiptsState();
  const receipt = state.receipts.find((item) => item.id === Number(payload.receiptId));

  if (!receipt) {
    throw new Error("Receptia selectata nu exista.");
  }

  if (receipt.status === "Inchis") {
    throw new Error("Nu se pot adauga livrari pe o receptie inchisa.");
  }

  const plannedQuantity = sanitizeNumber(payload.plannedQuantity ?? payload.deliveredQuantity);

  if (plannedQuantity <= 0) {
    throw new Error("Cantitatea planificata trebuie sa fie mai mare ca zero.");
  }

  const availableQuantity = getReceiptAvailableQuantity(state, payload.receiptId);
  if (plannedQuantity > availableQuantity) {
    throw new Error("Cantitatea planificata depaseste stocul disponibil pentru receptie.");
  }

  const delivery = {
    id: (state.deliveries?.length || 0) + 1,
    receiptId: Number(payload.receiptId),
    customerId: payload.customerId ? Number(payload.customerId) : null,
    customer: payload.customer || "",
    product: receipt.product,
    location: receipt.location || "",
    vehicle: payload.vehicle || "",
    contractNumber: payload.contractNumber || "",
    contractDate: payload.contractDate || "",
    contractPrice: sanitizeNumber(payload.contractPrice),
    plannedQuantity,
    deliveredQuantity: 0,
    grossWeight: 0,
    tareWeight: 0,
    netWeight: 0,
    invoiceNumber: payload.invoiceNumber || "",
    note: payload.note || "",
    status: DELIVERY_STATES.PROIECT,
    confirmedAt: null,
    deliveredAt: null,
    closedAt: null,
    canceledAt: null,
    reopenedAt: null,
    createdBy: payload.createdBy || "dashboard",
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(state.deliveries)) {
    state.deliveries = [];
  }

  state.deliveries.push(delivery);
  recalcReceiptDeliveryState(state, receipt.id);
  recalcReceiptOpenComplaintsFlag(state, receipt.id);

  createAuditEntry(state, {
    entityType: "delivery",
    entityId: delivery.id,
    action: "create",
    reason: "Creare livrare",
    user: payload.createdBy || "dashboard",
    newValue: { ...delivery }
  });

  writeReceiptsState(state);
  return delivery;
}

async function transitionDelivery(id, action, payload = {}) {
  const state = readReceiptsState();
  const delivery = (state.deliveries || []).find((item) => item.id === Number(id));

  if (!delivery) {
    return null;
  }

  const actionMap = {
    confirm: DELIVERY_STATES.CONFIRMAT,
    deliver: DELIVERY_STATES.LIVRAT,
    close: DELIVERY_STATES.INCHIS,
    cancel: DELIVERY_STATES.ANULAT,
    reopen: DELIVERY_STATES.REDESCHIS
  };

  const nextStatus = actionMap[action];
  if (!nextStatus) {
    throw new Error(`Actiune necunoscuta pentru livrare: ${action}.`);
  }

  const currentStatus = delivery.status || DELIVERY_STATES.PROIECT;
  assertDeliveryTransition(currentStatus, nextStatus);

  const receipt = state.receipts.find((item) => item.id === delivery.receiptId);
  if (receipt && receipt.status === "Inchis" && nextStatus !== DELIVERY_STATES.REDESCHIS) {
    throw new Error("Receptia asociata este inchisa. Redeschideti receptia pentru a modifica livrarea.");
  }

  const reason = action === "cancel" || action === "reopen" || action === "close"
    ? requiredChangeReason(payload.changeReason)
    : requiredText(payload.changeReason || "Tranzitie livrare", "Mentiunea modificarii");

  const oldValue = {
    status: currentStatus,
    deliveredQuantity: delivery.deliveredQuantity,
    grossWeight: delivery.grossWeight,
    tareWeight: delivery.tareWeight,
    netWeight: delivery.netWeight
  };

  const now = new Date().toISOString();

  if (nextStatus === DELIVERY_STATES.LIVRAT) {
    const grossWeight = sanitizeNumber(payload.grossWeight ?? delivery.grossWeight);
    const tareWeight = sanitizeNumber(payload.tareWeight ?? delivery.tareWeight);
    if (grossWeight <= 0) {
      throw new Error("Masa bruta reala este obligatorie la livrare.");
    }
    if (grossWeight < tareWeight) {
      throw new Error("Masa bruta nu poate fi mai mica decat tara.");
    }
    const netWeight = Math.max(grossWeight - tareWeight, 0);
    if (netWeight <= 0) {
      throw new Error("Masa neta rezultata la livrare trebuie sa fie mai mare ca zero.");
    }
    delivery.grossWeight = grossWeight;
    delivery.tareWeight = tareWeight;
    delivery.netWeight = netWeight;
    delivery.deliveredQuantity = netWeight;
    delivery.deliveredAt = now;
  }

  if (nextStatus === DELIVERY_STATES.CONFIRMAT) {
    delivery.confirmedAt = delivery.confirmedAt || now;
  }

  if (nextStatus === DELIVERY_STATES.INCHIS) {
    delivery.closedAt = now;
  }

  if (nextStatus === DELIVERY_STATES.ANULAT) {
    delivery.canceledAt = now;
  }

  if (nextStatus === DELIVERY_STATES.REDESCHIS) {
    delivery.reopenedAt = now;
  }

  delivery.status = nextStatus;
  delivery.updatedAt = now;
  delivery.changedBy = payload.changedBy || delivery.changedBy || "dashboard";

  if (receipt) {
    recalcReceiptDeliveryState(state, receipt.id);
    recalcReceiptOpenComplaintsFlag(state, receipt.id);
  }

  createAuditEntry(state, {
    entityType: "delivery",
    entityId: delivery.id,
    action: `transition:${action}`,
    reason,
    user: payload.changedBy || "dashboard",
    oldValue,
    newValue: {
      status: delivery.status,
      deliveredQuantity: delivery.deliveredQuantity,
      grossWeight: delivery.grossWeight,
      tareWeight: delivery.tareWeight,
      netWeight: delivery.netWeight
    }
  });

  writeReceiptsState(state);
  return delivery;
}

async function createComplaint(payload) {
  const state = readReceiptsState();
  const delivery = (state.deliveries || []).find((item) => item.id === Number(payload.deliveryId));

  if (!delivery) {
    throw new Error("Livrarea selectata nu exista.");
  }

  const complaint = {
    id: (state.complaints?.length || 0) + 1,
    deliveryId: Number(payload.deliveryId),
    customer: delivery.customer,
    product: delivery.product,
    contestedQuantity: sanitizeNumber(payload.contestedQuantity),
    complaintType: requiredText(payload.complaintType, "Tipul reclamatiei"),
    status: payload.status || "Deschisa",
    resolutionType: payload.resolutionType || "",
    note: payload.note || "",
    createdAt: new Date().toISOString()
  };

  if (!Array.isArray(state.complaints)) {
    state.complaints = [];
  }

  state.complaints.push(complaint);
  delivery.complaintStatus = complaint.status;
  delivery.updatedAt = new Date().toISOString();

  if (delivery.receiptId) {
    recalcReceiptOpenComplaintsFlag(state, delivery.receiptId);
  }

  createAuditEntry(state, {
    entityType: "complaint",
    entityId: complaint.id,
    action: "create",
    reason: "Creare reclamatie",
    user: payload.createdBy || "dashboard",
    newValue: { ...complaint }
  });

  writeReceiptsState(state);
  return complaint;
}

async function updateDelivery(id, payload = {}) {
  const state = readReceiptsState();
  const delivery = (state.deliveries || []).find((item) => item.id === Number(id));

  if (!delivery) {
    return null;
  }

  if (payload.status !== undefined) {
    throw new Error(
      "Statusul livrarii se schimba prin endpointul de tranzitie, nu prin PATCH generic."
    );
  }

  const reason = requiredChangeReason(payload.changeReason);
  const oldValue = { note: delivery.note, invoiceNumber: delivery.invoiceNumber };

  if (payload.note !== undefined) {
    delivery.note = String(payload.note || "").trim();
  }

  if (payload.invoiceNumber !== undefined) {
    delivery.invoiceNumber = String(payload.invoiceNumber || "").trim();
  }

  delivery.updatedAt = new Date().toISOString();

  createAuditEntry(state, {
    entityType: "delivery",
    entityId: delivery.id,
    action: "update",
    reason,
    user: payload.changedBy || "dashboard",
    oldValue,
    newValue: {
      note: delivery.note,
      invoiceNumber: delivery.invoiceNumber
    }
  });

  writeReceiptsState(state);
  return delivery;
}

async function updateComplaint(id, payload = {}) {
  const state = readReceiptsState();
  const complaint = (state.complaints || []).find((item) => item.id === Number(id));

  if (!complaint) {
    return null;
  }

  const currentUserRole = String(payload.currentUserRole || "").trim();
  const wantsStockCorrection = payload.stockCorrection !== undefined && payload.stockCorrection !== null;
  const wantsInvoiceAdjustment = payload.invoiceAdjustment !== undefined && payload.invoiceAdjustment !== null;

  if (wantsStockCorrection && currentUserRole && !STOCK_ADJUSTMENT_ROLES.has(currentUserRole)) {
    const error = new Error(
      "Doar contabilul-sef, managerul sau administratorul poate aplica o corectie de stoc."
    );
    error.statusCode = 403;
    throw error;
  }

  if (wantsInvoiceAdjustment && currentUserRole && !INVOICE_ADJUSTMENT_ROLES.has(currentUserRole)) {
    const error = new Error(
      "Rolul curent nu are dreptul de a aplica ajustari de factura."
    );
    error.statusCode = 403;
    throw error;
  }

  const reason = requiredChangeReason(payload.changeReason);
  const oldValue = {
    status: complaint.status,
    resolutionType: complaint.resolutionType,
    note: complaint.note
  };

  let transitionTo = null;
  if (payload.status !== undefined) {
    const requested = requiredText(payload.status, "Status reclamatie");
    if (requested !== complaint.status) {
      assertComplaintTransition(complaint.status || COMPLAINT_STATES.DESCHISA, requested);
    }
    transitionTo = requested;
  }

  let stockDelta = null;
  if (wantsStockCorrection) {
    const stock = payload.stockCorrection;
    const targetDeliveryId = Number(stock.deliveryId || complaint.deliveryId);
    const delta = sanitizeNumber(stock.deltaQuantity);
    if (delta === 0) {
      throw new Error("Delta cantitatii pentru corectia de stoc nu poate fi zero.");
    }
    const delivery = (state.deliveries || []).find((item) => item.id === targetDeliveryId);
    if (!delivery) {
      throw new Error("Livrarea tinta a corectiei de stoc nu exista.");
    }
    const projected = Number(delivery.deliveredQuantity || 0) + delta;
    if (projected < 0) {
      throw new Error("Corectia ar face cantitatea livrata negativa.");
    }
    delivery.deliveredQuantity = projected;
    if (delivery.netWeight !== undefined) {
      delivery.netWeight = projected;
    }
    delivery.updatedAt = new Date().toISOString();
    stockDelta = { deliveryId: delivery.id, delta, note: String(stock.note || "").trim() };
    complaint.stockCorrection = {
      deliveryId: delivery.id,
      deltaQuantity: delta,
      note: stockDelta.note,
      appliedAt: new Date().toISOString(),
      appliedBy: payload.changedBy || "dashboard"
    };
    if (delivery.receiptId) {
      recalcReceiptDeliveryState(state, delivery.receiptId);
    }
  }

  let invoiceAdjustment = null;
  if (wantsInvoiceAdjustment) {
    const adj = payload.invoiceAdjustment;
    if (!VALID_INVOICE_ADJUSTMENT_TYPES.has(String(adj.type || ""))) {
      throw new Error(
        "Tipul ajustarii de factura trebuie sa fie: adjust, deduct-last sau invoice-minus."
      );
    }
    const amount = sanitizeNumber(adj.amount);
    if (amount === 0) {
      throw new Error("Suma ajustarii de factura nu poate fi zero.");
    }
    invoiceAdjustment = {
      type: String(adj.type),
      amount,
      invoiceRef: String(adj.invoiceRef || "").trim(),
      note: String(adj.note || "").trim(),
      appliedAt: new Date().toISOString(),
      appliedBy: payload.changedBy || "dashboard"
    };
    complaint.invoiceAdjustment = invoiceAdjustment;
  }

  if (transitionTo) {
    complaint.status = transitionTo;
    if (transitionTo === COMPLAINT_STATES.ACCEPTATA) {
      complaint.acceptedAt = new Date().toISOString();
      complaint.acceptedBy = payload.changedBy || "dashboard";
    }
    if (transitionTo === COMPLAINT_STATES.INCHISA) {
      complaint.closedAt = new Date().toISOString();
      complaint.closedBy = payload.changedBy || "dashboard";
    }
  }

  if (payload.resolutionType !== undefined) {
    complaint.resolutionType = String(payload.resolutionType || "").trim();
  }

  if (payload.note !== undefined) {
    complaint.note = String(payload.note || "").trim();
  }

  complaint.updatedAt = new Date().toISOString();

  const delivery = (state.deliveries || []).find((item) => item.id === complaint.deliveryId);
  if (delivery) {
    delivery.complaintStatus = complaint.status;
    delivery.updatedAt = new Date().toISOString();
  }

  if (delivery && delivery.receiptId) {
    recalcReceiptOpenComplaintsFlag(state, delivery.receiptId);
  }

  createAuditEntry(state, {
    entityType: "complaint",
    entityId: complaint.id,
    action: "update",
    reason,
    user: payload.changedBy || "dashboard",
    oldValue,
    newValue: {
      status: complaint.status,
      resolutionType: complaint.resolutionType,
      note: complaint.note,
      stockDelta,
      invoiceAdjustment
    }
  });

  writeReceiptsState(state);
  return complaint;
}

async function updateReceiptStatus(id, status) {
  const state = readReceiptsState();
  const receipt = state.receipts.find((item) => item.id === Number(id));

  if (!receipt) {
    return null;
  }

  receipt.status = status;
  receipt.updatedAt = new Date().toISOString();
  writeReceiptsState(state);
  return receipt;
}

async function updateReceiptStatusWithAudit(id, status, payload = {}) {
  const state = readReceiptsState();
  const receipt = state.receipts.find((item) => item.id === Number(id));

  if (!receipt) {
    return null;
  }

  if (receipt.status === "Inchis" && status !== "Redeschis") {
    throw new Error(
      "Receptia este inchisa. Folositi reopenReceipt pentru a o redeschide."
    );
  }

  const reason = requiredChangeReason(payload.changeReason);
  const oldValue = { status: receipt.status };

  receipt.status = status;
  receipt.updatedAt = new Date().toISOString();

  createAuditEntry(state, {
    entityType: "receipt",
    entityId: receipt.id,
    action: "status-update",
    reason,
    user: payload.changedBy || "dashboard",
    oldValue,
    newValue: { status: receipt.status }
  });

  writeReceiptsState(state);
  return receipt;
}

async function closeReceipt(id, payload = {}) {
  const state = readReceiptsState();
  const receipt = state.receipts.find((item) => item.id === Number(id));

  if (!receipt) {
    return null;
  }

  if (receipt.status === "Inchis") {
    return receipt;
  }

  if (receipt.status !== "Procesata") {
    throw new Error(
      "Receptia se poate inchide doar dupa finalizarea procesarii (status Procesata)."
    );
  }

  recalcReceiptOpenComplaintsFlag(state, receipt.id);
  if (receipt.hasOpenComplaint) {
    throw new Error(
      "Receptia nu poate fi inchisa cat timp exista reclamatie deschisa."
    );
  }

  const reason = requiredChangeReason(payload.changeReason);
  const oldValue = { status: receipt.status };
  const now = new Date().toISOString();

  receipt.status = "Inchis";
  receipt.closedAt = now;
  receipt.closedBy = payload.changedBy || "dashboard";
  receipt.updatedAt = now;

  createAuditEntry(state, {
    entityType: "receipt",
    entityId: receipt.id,
    action: "close",
    reason,
    user: payload.changedBy || "dashboard",
    oldValue,
    newValue: { status: receipt.status, closedAt: receipt.closedAt }
  });

  writeReceiptsState(state);
  return receipt;
}

async function reopenReceipt(id, payload = {}) {
  const state = readReceiptsState();
  const receipt = state.receipts.find((item) => item.id === Number(id));

  if (!receipt) {
    return null;
  }

  if (receipt.status !== "Inchis") {
    throw new Error("Receptia nu este inchisa, deci nu poate fi redeschisa.");
  }

  const reason = requiredChangeReason(payload.changeReason);
  const oldValue = { status: receipt.status };
  const now = new Date().toISOString();

  receipt.status = "Redeschis";
  receipt.reopenedAt = now;
  receipt.reopenedBy = payload.changedBy || "dashboard";
  receipt.updatedAt = now;

  createAuditEntry(state, {
    entityType: "receipt",
    entityId: receipt.id,
    action: "reopen",
    reason,
    user: payload.changedBy || "dashboard",
    oldValue,
    newValue: { status: receipt.status, reopenedAt: receipt.reopenedAt }
  });

  writeReceiptsState(state);
  return receipt;
}

async function getStats() {
  const openingDocuments = await listOpeningDocuments();
  const receipts = await listReceipts();
  const processings = await listProcessings();
  const transactions = await listTransactions();
  const deliveries = await listDeliveries();
  const complaints = await listComplaints();
  const auditLogs = await listAuditLogs();
  return {
    ...createReceiptSummary(receipts),
    opening: createOpeningSummary(openingDocuments),
    processing: createProcessingSummary(processings),
    finance: createTransactionSummary(transactions),
    deliveries: createDeliverySummary(deliveries),
    complaints: createComplaintSummary(complaints),
    audit: createAuditSummary(auditLogs)
  };
}

async function getStockSummary() {
  const openingDocuments = await listOpeningDocuments();
  const receipts = await listReceipts();
  const deliveries = await listDeliveries();
  return createStockSummary(receipts, deliveries, openingDocuments);
}

async function getConfig() {
  const config = readConfigState();
  const clientConfig = {
    ...config,
    users: config.users.map(sanitizeUserForClient)
  };
  return {
    ...clientConfig,
    summary: createConfigSummary(clientConfig)
  };
}

async function findUserByUsername(username) {
  const config = readConfigState();
  const normalizedUsername = String(username || "").trim().toLowerCase();

  if (!normalizedUsername) {
    return null;
  }

  return (
    config.users.find(
      (item) => String(item.username || "").trim().toLowerCase() === normalizedUsername
    ) || null
  );
}

async function updateUserPasswordById(userId, password) {
  const state = readConfigState();
  const user = state.users.find((item) => item.id === Number(userId));

  if (!user) {
    return null;
  }

  const passwordRecord = createPasswordRecord(password);
  user.passwordSalt = passwordRecord.salt;
  user.passwordHash = passwordRecord.hash;
  user.requirePasswordChange = false;
  user.updatedAt = new Date().toISOString();
  writeConfigState(state);
  return sanitizeUserForClient(user);
}

async function getDailyReport(dateValue = new Date().toISOString().slice(0, 10)) {
  const [receipts, processings, transactions, deliveries, complaints, stockSummary] = await Promise.all([
    listReceipts(),
    listProcessings(),
    listTransactions(),
    listDeliveries(),
    listComplaints(),
    getStockSummary()
  ]);

  const report = createDailyReport(dateValue, receipts, processings, transactions, stockSummary);
  report.deliveries = filterByDate(deliveries, dateValue);
  report.complaints = filterByDate(complaints, dateValue);
  report.summary.deliveredQuantity = report.deliveries.reduce(
    (sum, item) => sum + Number(item.deliveredQuantity || 0),
    0
  );
  report.summary.openComplaints = report.complaints.filter((item) => item.status === "Deschisa").length;
  return report;
}

async function createConfigEntry(entity, payload) {
  assertEntity(entity);
  const state = readConfigState();
  const normalized = normalizeEntityPayload(entity, payload);

  if (entity === "products" && state.products.some((item) => item.code === normalized.code)) {
    throw new Error("Exista deja un produs cu acest cod.");
  }

  if (entity === "roles" && state.roles.some((item) => item.code === normalized.code)) {
    throw new Error("Exista deja un rol cu acest cod.");
  }

  if (
    entity === "users" &&
    state.users.some(
      (item) => String(item.username || "").trim().toLowerCase() === normalized.username.toLowerCase()
    )
  ) {
    throw new Error("Exista deja un utilizator cu acest username.");
  }

  if (
    entity === "users" &&
    !state.roles.some((item) => item.code === normalized.roleCode)
  ) {
    throw new Error("Rolul selectat pentru utilizator nu exista.");
  }

  const passwordRecord =
    entity === "users"
      ? createPasswordRecord(normalized.password || defaultUserPassword)
      : null;

  const entry = {
    id: state.nextIds[entity] + 1,
    ...normalized,
    ...(entity === "users"
      ? {
          passwordSalt: passwordRecord.salt,
          passwordHash: passwordRecord.hash
        }
      : {}),
    createdAt: new Date().toISOString()
  };

  if (entity === "users") {
    delete entry.password;
  }

  state.nextIds[entity] = entry.id;
  state[entity].push(entry);
  writeConfigState(state);
  return entity === "users" ? sanitizeUserForClient(entry) : entry;
}

async function updateConfigEntry(entity, id, payload) {
  assertEntity(entity);
  const state = readConfigState();
  const list = state[entity];
  const existing = list.find((item) => item.id === Number(id));

  if (!existing) {
    return null;
  }

  const reason = requiredChangeReason(payload.changeReason);
  const user = String(payload.changedBy || "dashboard").trim() || "dashboard";
  const oldValue = entity === "users" ? sanitizeUserForClient(existing) : { ...existing };

  const normalized = normalizeEntityPayload(entity, { ...existing, ...payload });

  if (
    entity === "products" &&
    state.products.some((item) => item.id !== Number(id) && item.code === normalized.code)
  ) {
    throw new Error("Exista deja un produs cu acest cod.");
  }

  if (
    entity === "roles" &&
    state.roles.some((item) => item.id !== Number(id) && item.code === normalized.code)
  ) {
    throw new Error("Exista deja un rol cu acest cod.");
  }

  if (
    entity === "users" &&
    state.users.some(
      (item) =>
        item.id !== Number(id) &&
        String(item.username || "").trim().toLowerCase() === normalized.username.toLowerCase()
    )
  ) {
    throw new Error("Exista deja un utilizator cu acest username.");
  }

  Object.assign(existing, normalized, {
    updatedAt: new Date().toISOString()
  });

  if (entity === "users" && normalized.password) {
    const passwordRecord = createPasswordRecord(normalized.password);
    existing.passwordSalt = passwordRecord.salt;
    existing.passwordHash = passwordRecord.hash;
  }

  if (entity === "users") {
    delete existing.password;
  }

  writeConfigState(state);
  const receiptsState = readReceiptsState();
  createAuditEntry(receiptsState, {
    entityType: entity,
    entityId: existing.id,
    action: "config-update",
    reason,
    user,
    oldValue,
    newValue: entity === "users" ? sanitizeUserForClient(existing) : { ...existing }
  });
  writeReceiptsState(receiptsState);
  return entity === "users" ? sanitizeUserForClient(existing) : existing;
}

async function updateSystemSettings(payload) {
  const state = readConfigState();
  const reason = requiredChangeReason(payload.changeReason);
  const user = String(payload.changedBy || "dashboard").trim() || "dashboard";
  const oldValue = { ...state.systemSettings };
  state.systemSettings = {
    ...state.systemSettings,
    closeOfDayHour: sanitizeNumber(payload.closeOfDayHour ?? state.systemSettings.closeOfDayHour),
    reportChannel: String(payload.reportChannel || state.systemSettings.reportChannel).trim(),
    reportAudience: String(payload.reportAudience || state.systemSettings.reportAudience).trim(),
    defaultCurrency: String(payload.defaultCurrency || state.systemSettings.defaultCurrency).trim()
  };
  writeConfigState(state);
  const receiptsState = readReceiptsState();
  createAuditEntry(receiptsState, {
    entityType: "system-settings",
    entityId: 1,
    action: "settings-update",
    reason,
    user,
    oldValue,
    newValue: { ...state.systemSettings }
  });
  writeReceiptsState(receiptsState);
  return state.systemSettings;
}

const TRANSA_B_MIGRATION_KEY = "transa-b-v1";

function runTransaBMigration() {
  try {
    ensureStorage();
  } catch (_err) {
    return { skipped: true, reason: "storage-unavailable" };
  }

  const state = readReceiptsState();
  if (!state.migrations) state.migrations = {};
  if (state.migrations[TRANSA_B_MIGRATION_KEY]) {
    return { skipped: true, reason: "already-applied" };
  }

  const summary = {
    deliveriesRemapped: 0,
    receiptsBackfilled: 0,
    receiptsOpenComplaintFlag: 0,
    transactionsBackfilled: 0,
    rolesAdded: 0
  };

  if (!Array.isArray(state.partnerAdvances)) {
    state.partnerAdvances = [];
  }

  for (const delivery of state.deliveries || []) {
    const legacy = LEGACY_DELIVERY_STATUS_MAP[delivery.status];
    if (legacy) {
      delivery.status = legacy;
      summary.deliveriesRemapped++;
    }
    if (!delivery.status) {
      delivery.status = DELIVERY_STATES.LIVRAT;
      summary.deliveriesRemapped++;
    }
    if (delivery.grossWeight === undefined) delivery.grossWeight = 0;
    if (delivery.tareWeight === undefined) delivery.tareWeight = 0;
    if (delivery.netWeight === undefined) {
      delivery.netWeight = Number(delivery.deliveredQuantity || 0);
    }
    if (delivery.plannedQuantity === undefined) {
      delivery.plannedQuantity = Number(delivery.deliveredQuantity || 0);
    }
  }

  for (const receipt of state.receipts || []) {
    let changed = false;
    if (receipt.reservedQuantity === undefined) {
      receipt.reservedQuantity = Number(receipt.deliveredQuantity || 0);
      changed = true;
    }
    if (receipt.availableQuantity === undefined) {
      const base = Number(
        receipt.finalNetQuantity ?? receipt.provisionalNetQuantity ?? receipt.quantity ?? 0
      );
      receipt.availableQuantity = Math.max(base - Number(receipt.reservedQuantity || 0), 0);
      changed = true;
    }
    if (receipt.hasOpenComplaint === undefined) {
      recalcReceiptOpenComplaintsFlag(state, receipt.id);
      summary.receiptsOpenComplaintFlag++;
    }
    if (receipt.grossWeight === undefined) receipt.grossWeight = 0;
    if (receipt.tareWeight === undefined) receipt.tareWeight = 0;
    if (receipt.netWeight === undefined) {
      receipt.netWeight = Number(receipt.finalNetQuantity ?? receipt.provisionalNetQuantity ?? 0);
    }
    if (changed) summary.receiptsBackfilled++;
  }

  for (const tx of state.transactions || []) {
    if (tx.appliedAmount === undefined) {
      tx.appliedAmount = Number(tx.amount || 0);
      tx.advanceAmount = 0;
      summary.transactionsBackfilled++;
    }
  }

  state.migrations[TRANSA_B_MIGRATION_KEY] = {
    appliedAt: new Date().toISOString(),
    summary
  };

  const hasChanges =
    summary.deliveriesRemapped +
      summary.receiptsBackfilled +
      summary.receiptsOpenComplaintFlag +
      summary.transactionsBackfilled >
    0;

  if (hasChanges) {
    createAuditEntry(state, {
      entityType: "migration",
      entityId: null,
      action: "backfill",
      reason: `Tranșa B v1: ${JSON.stringify(summary)}`,
      user: "system",
      newValue: summary
    });
    writeReceiptsState(state);
  }

  try {
    const configState = readConfigState();
    const hasAccountantSef = configState.roles.some((role) => role.code === "accountant-sef");
    if (!hasAccountantSef) {
      const nextId = Math.max(
        Number(configState.nextIds.roles || 0),
        ...configState.roles.map((role) => Number(role.id || 0))
      ) + 1;
      configState.roles.push({
        id: nextId,
        name: "Contabil sef",
        code: "accountant-sef",
        permissions: "reclamatii, ajustari stoc, ajustari factura, audit",
        createdAt: new Date().toISOString()
      });
      configState.nextIds.roles = nextId;
      writeConfigState(configState);
      summary.rolesAdded = 1;
    }
  } catch (err) {
    console.error("Migration: unable to ensure accountant-sef role:", err.message);
  }

  return { applied: true, summary };
}

try {
  runTransaBMigration();
} catch (err) {
  console.error("Tranșa B migration failed:", err.message);
}

module.exports = {
  createConfigEntry,
  createComplaint,
  createDelivery,
  createOpeningDocument,
  appendAuditLog,
  getDailyReport,
  createProcessing,
  createReceipt,
  createTransaction,
  getConfig,
  findUserByUsername,
  getStats,
  getStockSummary,
  listAuditLogs,
  listComplaints,
  listDeliveries,
  listOpeningDebtItems,
  listOpeningDocuments,
  listPartnerAdvances,
  listProcessings,
  listReceipts,
  listTransactions,
  applyAdvanceCredit,
  closeReceipt,
  reopenReceipt,
  transitionDelivery,
  updateComplaint,
  updateConfigEntry,
  updateDelivery,
  updateProcessing,
  updateReceiptStatus,
  updateReceiptStatusWithAudit,
  updateTransaction,
  updateUserPasswordById,
  updateSystemSettings,
  runTransaBMigration
};
