const { createClient } = require("@supabase/supabase-js");
const localStorage = require("./local-storage");

const REQUIRED_ENV_VARS = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];

function hasRequiredConfig() {
  return REQUIRED_ENV_VARS.every((key) => Boolean(process.env[key]));
}

function createSupabaseClient() {
  if (!hasRequiredConfig()) {
    throw new Error(
      "Supabase storage is enabled, but SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing."
    );
  }

  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

const supabase = createSupabaseClient();

function mapReceipt(row) {
  return {
    id: row.id,
    supplier: row.supplier,
    product: row.product,
    quantity: Number(row.quantity),
    unit: row.unit,
    price: Number(row.price),
    vehicle: row.vehicle || "",
    note: row.note || "",
    source: row.source,
    status: row.status,
    receivedBy: row.received_by || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at || null
  };
}

function buildReceiptInsert(payload) {
  return {
    supplier: payload.supplier,
    product: payload.product,
    quantity: Number(payload.quantity),
    unit: payload.unit,
    price: Number(payload.price),
    vehicle: payload.vehicle || "",
    note: payload.note || "",
    source: payload.source || "dashboard",
    status: payload.status || "Noua",
    received_by: payload.receivedBy || ""
  };
}

function createStats(receipts) {
  const totalReceipts = receipts.length;
  const totalQuantity = receipts.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const totalValue = receipts.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0),
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

async function listReceipts() {
  const { data, error } = await supabase
    .from("receipts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(mapReceipt);
}

async function createReceipt(payload) {
  const { data, error } = await supabase
    .from("receipts")
    .insert(buildReceiptInsert(payload))
    .select()
    .single();

  if (error) {
    throw error;
  }

  return mapReceipt(data);
}

async function updateReceiptStatus(id, status) {
  const { data, error } = await supabase
    .from("receipts")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", Number(id))
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapReceipt(data) : null;
}

async function getStats() {
  const receipts = await listReceipts();
  return createStats(receipts);
}

module.exports = {
  appendAuditLog: localStorage.appendAuditLog,
  createConfigEntry: localStorage.createConfigEntry,
  createComplaint: localStorage.createComplaint,
  createDelivery: localStorage.createDelivery,
  createOpeningDocument: localStorage.createOpeningDocument,
  createProcessing: localStorage.createProcessing,
  createReceipt,
  createTransaction: localStorage.createTransaction,
  getConfig: localStorage.getConfig,
  getDailyReport: localStorage.getDailyReport,
  findUserByUsername: localStorage.findUserByUsername,
  getStats,
  getStockSummary: localStorage.getStockSummary,
  hasRequiredConfig,
  listAuditLogs: localStorage.listAuditLogs,
  listComplaints: localStorage.listComplaints,
  listDeliveries: localStorage.listDeliveries,
  listOpeningDocuments: localStorage.listOpeningDocuments,
  listProcessings: localStorage.listProcessings,
  listReceipts,
  listTransactions: localStorage.listTransactions,
  updateConfigEntry: localStorage.updateConfigEntry,
  updateReceiptStatus,
  updateReceiptStatusWithAudit: localStorage.updateReceiptStatusWithAudit,
  updateUserPasswordById: localStorage.updateUserPasswordById,
  updateSystemSettings: localStorage.updateSystemSettings
};
