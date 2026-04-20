const SYSTEM_ROLE_CAPABILITIES = {
  operator: [
    "receipts-read",
    "receipt-write",
    "processings-read",
    "processing-write",
    "stocks-read",
    "deliveries-read",
    "delivery-write",
    "complaints-read",
    "complaint-write",
    "config-read"
  ],
  manager: [
    "receipts-read",
    "receipt-write",
    "processings-read",
    "processing-write",
    "stocks-read",
    "deliveries-read",
    "delivery-write",
    "complaints-read",
    "complaint-write",
    "finance",
    "finance-write",
    "opening",
    "reports",
    "audit",
    "config-read"
  ],
  accountant: [
    "receipts-read",
    "processings-read",
    "stocks-read",
    "deliveries-read",
    "complaints-read",
    "complaint-write",
    "finance",
    "finance-write",
    "opening",
    "reports",
    "config-read"
  ],
  admin: [
    "receipts-read",
    "receipt-write",
    "processings-read",
    "processing-write",
    "stocks-read",
    "deliveries-read",
    "delivery-write",
    "complaints-read",
    "complaint-write",
    "finance",
    "finance-write",
    "opening",
    "reports",
    "audit",
    "security-admin",
    "setup",
    "config-read"
  ]
};

const SYSTEM_ROLES = [
  { id: 1, code: "operator", name: "Operator", permissions: "receipts, processings, deliveries, complaints, stocks", system: true },
  { id: 2, code: "manager", name: "Manager", permissions: "operations, finance, reports, audit", system: true },
  { id: 3, code: "accountant", name: "Contabil", permissions: "finance, complaints, opening, reports", system: true },
  { id: 4, code: "admin", name: "Administrator", permissions: "setup, users, security, operations", system: true }
];

const LEGACY_ROLE_ALIASES = {
  control: "manager",
  contabil: "accountant"
};

function normalizeRoleCode(roleCode) {
  const normalized = String(roleCode || "").trim().toLowerCase();
  return LEGACY_ROLE_ALIASES[normalized] || normalized;
}

function listSystemRoles() {
  return SYSTEM_ROLES.map((item) => ({ ...item }));
}

function getRolePermissions(roleCode) {
  return [...(SYSTEM_ROLE_CAPABILITIES[normalizeRoleCode(roleCode)] || [])];
}

function getRoleName(roleCode) {
  return SYSTEM_ROLES.find((item) => item.code === normalizeRoleCode(roleCode))?.name || "";
}

module.exports = {
  getRoleName,
  getRolePermissions,
  listSystemRoles,
  normalizeRoleCode
};
