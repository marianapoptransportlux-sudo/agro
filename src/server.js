require("dotenv").config();

const express = require("express");
const path = require("path");
const { startBot } = require("./bot");
const {
  getCloseOfDayStatusHandler,
  runCloseOfDayHandler
} = require("./automation-handlers");
const { startCloseOfDayScheduler } = require("./close-of-day");
const { attachCurrentUser, requireAuth, requireRoles } = require("./auth");
const { changePasswordHandler, loginHandler, logoutHandler, meHandler } = require("./auth-handlers");
const {
  createConfigEntryHandler,
  getConfigHandler,
  updateConfigEntryHandler,
  updateSystemSettingsHandler
} = require("./config-handlers");
const {
  createReceiptHandler,
  healthHandler,
  listReceiptsHandler,
  updateReceiptStatusHandler
} = require("./receipt-handlers");
const {
  createProcessingHandler,
  listProcessingsHandler,
  updateProcessingHandler
} = require("./processing-handlers");
const { getStockSummaryHandler } = require("./stock-handlers");
const {
  createTransactionHandler,
  listTransactionsHandler,
  updateTransactionHandler
} = require("./transaction-handlers");
const { getDailyReportHandler } = require("./report-handlers");
const {
  createDeliveryHandler,
  listDeliveriesHandler,
  updateDeliveryHandler
} = require("./delivery-handlers");
const {
  createComplaintHandler,
  listComplaintsHandler,
  updateComplaintHandler
} = require("./complaint-handlers");
const { listAuditLogsHandler } = require("./audit-handlers");
const { listLockoutsHandler, unlockUsernameHandler } = require("./security-handlers");
const {
  createOpeningDocumentHandler,
  listOpeningDocumentsHandler
} = require("./opening-handlers");

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data:",
      "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'"
    ].join("; ")
  );
  next();
});

app.use(express.json({ limit: "1mb" }));
app.use("/api", attachCurrentUser);
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/api/health", healthHandler);
app.post("/api/auth/login", loginHandler);
app.post("/api/auth/logout", logoutHandler);
app.get("/api/auth/me", meHandler);
app.post("/api/auth/change-password", requireAuth, changePasswordHandler);

app.use("/api", requireAuth);

app.get(
  "/api/opening-documents",
  requireRoles(["manager", "accountant", "admin", "control"]),
  listOpeningDocumentsHandler
);

app.post(
  "/api/opening-documents",
  requireRoles(["manager", "accountant", "admin"]),
  createOpeningDocumentHandler
);

app.get("/api/config", getConfigHandler);

app.post("/api/config/:entity", requireRoles(["admin"]), async (req, res) => {
  return createConfigEntryHandler(req, res, req.params.entity);
});

app.patch("/api/config/:entity/:id", requireRoles(["admin"]), async (req, res) => {
  return updateConfigEntryHandler(req, res, req.params.entity, req.params.id);
});

app.patch("/api/system-settings", requireRoles(["admin"]), updateSystemSettingsHandler);

app.get("/api/receipts", requireRoles(["operator", "manager", "accountant", "admin", "control"]), listReceiptsHandler);

app.post("/api/receipts", requireRoles(["operator", "manager", "admin"]), createReceiptHandler);

app.patch("/api/receipts/:id/status", requireRoles(["operator", "manager", "admin"]), async (req, res) => {
  return updateReceiptStatusHandler(req, res, req.params.id);
});

app.get("/api/processings", requireRoles(["operator", "manager", "accountant", "admin", "control"]), listProcessingsHandler);

app.post("/api/processings", requireRoles(["operator", "manager", "admin"]), createProcessingHandler);

app.patch("/api/processings/:id", requireRoles(["operator", "manager", "admin"]), async (req, res) => {
  return updateProcessingHandler(req, res, req.params.id);
});

app.get("/api/stocks", requireRoles(["operator", "manager", "accountant", "admin", "control"]), getStockSummaryHandler);

app.get("/api/transactions", requireRoles(["manager", "accountant", "admin", "control"]), listTransactionsHandler);

app.post("/api/transactions", requireRoles(["manager", "accountant", "admin"]), createTransactionHandler);

app.patch("/api/transactions/:id", requireRoles(["manager", "accountant", "admin"]), async (req, res) => {
  return updateTransactionHandler(req, res, req.params.id);
});

app.get("/api/deliveries", requireRoles(["operator", "manager", "accountant", "admin", "control"]), listDeliveriesHandler);

app.post("/api/deliveries", requireRoles(["operator", "manager", "admin"]), createDeliveryHandler);

app.patch("/api/deliveries/:id", requireRoles(["operator", "manager", "admin"]), async (req, res) => {
  return updateDeliveryHandler(req, res, req.params.id);
});

app.get("/api/complaints", requireRoles(["operator", "manager", "accountant", "admin", "control"]), listComplaintsHandler);

app.post("/api/complaints", requireRoles(["operator", "manager", "accountant", "admin"]), createComplaintHandler);

app.patch("/api/complaints/:id", requireRoles(["manager", "accountant", "admin"]), async (req, res) => {
  return updateComplaintHandler(req, res, req.params.id);
});

app.get("/api/reports/daily", requireRoles(["manager", "accountant", "admin", "control"]), getDailyReportHandler);

app.get("/api/audit-logs", requireRoles(["manager", "admin", "control"]), listAuditLogsHandler);
app.get("/api/security/lockouts", requireRoles(["admin"]), listLockoutsHandler);
app.post("/api/security/lockouts/:username/unlock", requireRoles(["admin"]), async (req, res) => {
  return unlockUsernameHandler(req, res, req.params.username);
});
app.get("/api/automation/close-of-day/status", requireRoles(["admin"]), getCloseOfDayStatusHandler);
app.post("/api/automation/close-of-day/run", requireRoles(["admin"]), runCloseOfDayHandler);

app.get("*", (_req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  startBot(process.env.TELEGRAM_BOT_TOKEN);
  startCloseOfDayScheduler();
});
