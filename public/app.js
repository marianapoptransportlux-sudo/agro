const loginScreenEl = document.getElementById("login-screen");
const pageShellEl = document.getElementById("page-shell");
const loginFormEl = document.getElementById("login-form");
const loginMessageEl = document.getElementById("login-message");
const currentUserNameEl = document.getElementById("current-user-name");
const currentUserRoleEl = document.getElementById("current-user-role");
const logoutButtonEl = document.getElementById("logout-button");
const changePasswordButtonEl = document.getElementById("change-password-button");
const passwordPanelEl = document.getElementById("password-panel");
const changePasswordFormEl = document.getElementById("change-password-form");
const changePasswordMessageEl = document.getElementById("change-password-message");
const cancelPasswordButtonEl = document.getElementById("cancel-password-button");
const statsEl = document.getElementById("stats");
const bodyEl = document.getElementById("receipts-body");
const openingDocumentFormEl = document.getElementById("opening-document-form");
const openingDocumentDateEl = document.getElementById("opening-document-date");
const openingDocumentMessageEl = document.getElementById("opening-document-message");
const openingStockProductEl = document.getElementById("opening-stock-product");
const openingStockLocationEl = document.getElementById("opening-stock-location");
const openingStockQuantityEl = document.getElementById("opening-stock-quantity");
const addOpeningStockButton = document.getElementById("add-opening-stock");
const openingStockBodyEl = document.getElementById("opening-stock-body");
const openingDebtPartnerEl = document.getElementById("opening-debt-partner");
const openingDebtDirectionEl = document.getElementById("opening-debt-direction");
const openingDebtAmountEl = document.getElementById("opening-debt-amount");
const openingDebtNoteEl = document.getElementById("opening-debt-note");
const addOpeningDebtButton = document.getElementById("add-opening-debt");
const openingDebtBodyEl = document.getElementById("opening-debt-body");
const processingsBodyEl = document.getElementById("processings-body");
const formEl = document.getElementById("receipt-form");
const processingFormEl = document.getElementById("processing-form");
const messageEl = document.getElementById("form-message");
const processingMessageEl = document.getElementById("processing-message");
const configSummaryEl = document.getElementById("config-summary");
const supplierSelect = document.getElementById("supplier-select");
const productSelect = document.getElementById("product-select");
const locationSelect = document.getElementById("location-select");
const userSelect = document.getElementById("user-select");
const unitInput = document.getElementById("unit-input");
const humidityInput = document.getElementById("humidity-input");
const impurityInput = document.getElementById("impurity-input");
const fiscalProfileOptions = document.getElementById("fiscal-profile-options");
const roleOptions = document.getElementById("role-options");
const systemSettingsForm = document.getElementById("system-settings-form");
const settingsMessageEl = document.getElementById("settings-message");
const editorTitleEl = document.getElementById("editor-title");
const editorCopyEl = document.getElementById("editor-copy");
const editorForm = document.getElementById("editor-form");
const editorFieldsEl = document.getElementById("editor-fields");
const editorEmptyEl = document.getElementById("editor-empty");
const editorMessageEl = document.getElementById("editor-message");
const editorSaveButton = document.getElementById("editor-save");
const editorCancelButton = document.getElementById("editor-cancel");
const lockoutsBodyEl = document.getElementById("lockouts-body");
const estimateHumidityNormEl = document.getElementById("estimate-humidity-norm");
const estimateImpurityNormEl = document.getElementById("estimate-impurity-norm");
const estimateNetEl = document.getElementById("estimate-net");
const estimateServicesEl = document.getElementById("estimate-services");
const estimatePayableEl = document.getElementById("estimate-payable");
const processingReceiptSelect = document.getElementById("processing-receipt-select");
const processingTypeSelect = document.getElementById("processing-type-select");
const processingUserSelect = document.getElementById("processing-user-select");
const processedQuantityInput = document.getElementById("processed-quantity-input");
const confirmedWasteInput = document.getElementById("confirmed-waste-input");
const processingSourceEl = document.getElementById("processing-source");
const processingProvisionalNetEl = document.getElementById("processing-provisional-net");
const processingFinalNetEl = document.getElementById("processing-final-net");
const stocksBodyEl = document.getElementById("stocks-body");
const stockSummaryEl = document.getElementById("stock-summary");
const receiptStatusFilterEl = document.getElementById("receipt-status-filter");
const receiptProductFilterEl = document.getElementById("receipt-product-filter");
const processingTypeFilterEl = document.getElementById("processing-type-filter");
const processingReceiptFilterEl = document.getElementById("processing-receipt-filter");
const transactionsBodyEl = document.getElementById("transactions-body");
const transactionFormEl = document.getElementById("transaction-form");
const transactionMessageEl = document.getElementById("transaction-message");
const transactionReferenceTypeSelect = document.getElementById("transaction-reference-type-select");
const transactionReferenceSelect = document.getElementById("transaction-reference-select");
const transactionDirectionSelect = document.getElementById("transaction-direction-select");
const transactionDirectionChipEl = document.getElementById("transaction-direction-chip");
const transactionPaymentTypeSelect = document.getElementById("transaction-payment-type-select");
const transactionPartnerEl = document.getElementById("transaction-partner");
const transactionTargetEl = document.getElementById("transaction-target");
const transactionStatusEl = document.getElementById("transaction-status");
const deliveryFormEl = document.getElementById("delivery-form");
const deliveryMessageEl = document.getElementById("delivery-message");
const deliveryReceiptSelect = document.getElementById("delivery-receipt-select");
const deliveryCustomerSelect = document.getElementById("delivery-customer-select");
const deliveryQuantityInput = document.getElementById("delivery-quantity-input");
const deliveryLocationEl = document.getElementById("delivery-location");
const deliveryAvailableEl = document.getElementById("delivery-available");
const deliveryStatusPreviewEl = document.getElementById("delivery-status");
const deliveriesBodyEl = document.getElementById("deliveries-body");
const complaintFormEl = document.getElementById("complaint-form");
const complaintMessageEl = document.getElementById("complaint-message");
const complaintDeliverySelect = document.getElementById("complaint-delivery-select");
const complaintsBodyEl = document.getElementById("complaints-body");
const openReceiptStatusFilterEl = document.getElementById("open-receipt-status-filter");
const openDeliveryStatusFilterEl = document.getElementById("open-delivery-status-filter");
const openPartnerFilterEl = document.getElementById("open-partner-filter");
const openReceiptsBodyEl = document.getElementById("open-receipts-body");
const openDeliveriesBodyEl = document.getElementById("open-deliveries-body");
const auditBodyEl = document.getElementById("audit-body");
const dailyReportFormEl = document.getElementById("daily-report-form");
const dailyReportDateEl = document.getElementById("daily-report-date");
const dailyReportSummaryEl = document.getElementById("daily-report-summary");
const dailyReportReceiptsEl = document.getElementById("daily-report-receipts");
const dailyReportProcessingsEl = document.getElementById("daily-report-processings");
const dailyReportDeliveriesEl = document.getElementById("daily-report-deliveries");
const dailyReportTransactionsEl = document.getElementById("daily-report-transactions");
const dailyReportComplaintsEl = document.getElementById("daily-report-complaints");
const receiptSaveNewButton = document.getElementById("receipt-save-new-button");
const transactionSaveNewButton = document.getElementById("transaction-save-new-button");
const deliverySaveNewButton = document.getElementById("delivery-save-new-button");

const entityLabels = {
  partners: "Parteneri",
  products: "Produse",
  storageLocations: "Locatii",
  tariffs: "Tarife",
  roles: "Roluri",
  users: "Utilizatori",
  paymentTypes: "Tipuri plata",
  fiscalProfiles: "Statut fiscal",
  processingTypes: "Tipuri procesare"
};

let currentConfig = null;
let currentEditor = null;
let openingDocumentsCache = [];
let openingStockDraft = [];
let openingDebtDraft = [];
let receiptsCache = [];
let processingsCache = [];
let transactionsCache = [];
let deliveriesCache = [];
let complaintsCache = [];
let auditLogsCache = [];
let lockoutsCache = [];
let currentSessionUser = null;

const nativeFetch = window.fetch.bind(window);

const currency = new Intl.NumberFormat("ro-RO", {
  style: "currency",
  currency: "MDL",
  maximumFractionDigits: 2
});

const roleAccessMap = {
  operator: new Set([
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
  ]),
  manager: new Set([
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
  ]),
  accountant: new Set([
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
  ]),
  admin: new Set([
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
  ]),
  control: new Set([
    "receipts-read",
    "processings-read",
    "stocks-read",
    "deliveries-read",
    "complaints-read",
    "finance",
    "opening",
    "reports",
    "audit",
    "config-read"
  ])
};

function formatNumber(value) {
  return new Intl.NumberFormat("ro-RO", {
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

function setCurrentUser(user) {
  currentSessionUser = user || null;
  currentUserNameEl.textContent = currentSessionUser?.name || "-";
  currentUserRoleEl.textContent = currentSessionUser?.roleCode || "-";
}

function canAccess(capability) {
  if (!currentSessionUser?.roleCode) {
    return false;
  }

  return roleAccessMap[currentSessionUser.roleCode]?.has(capability) || false;
}

function applyRoleAccess() {
  document.querySelectorAll("[data-access]").forEach((element) => {
    const capability = element.dataset.access;
    element.hidden = !canAccess(capability);
  });

  if (!canAccess("setup") && document.querySelector('.view-tab.is-active')?.dataset.view === "setup") {
    setView("operations");
  }
}

function showLoginScreen(message = "") {
  pageShellEl.hidden = true;
  loginScreenEl.hidden = false;
  passwordPanelEl.hidden = true;
  if (message !== undefined) {
    loginMessageEl.textContent = message;
  }
  loginFormEl.reset();
  document.getElementById("login-username").focus();
}

function showDashboardShell() {
  loginScreenEl.hidden = true;
  pageShellEl.hidden = false;
}

function togglePasswordPanel(show) {
  passwordPanelEl.hidden = !show;
  if (!show) {
    changePasswordFormEl.reset();
    changePasswordMessageEl.textContent = "";
  }
}

async function apiFetch(input, init = {}) {
  const response = await nativeFetch(input, {
    credentials: "same-origin",
    ...init,
    headers: {
      ...(init.headers || {})
    }
  });

  if (response.status === 401) {
    setCurrentUser(null);
    showLoginScreen("Sesiunea a expirat sau nu esti autentificat.");
    throw new Error("Autentificare necesara.");
  }

  if (response.status === 403) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || "Nu ai drepturi pentru aceasta operatiune.");
  }

  return response;
}

window.fetch = apiFetch;

async function loadSession() {
  const response = await nativeFetch("/api/auth/me", {
    credentials: "same-origin"
  });

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  return payload.user || null;
}

async function login(username, password) {
  const response = await nativeFetch("/api/auth/login", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ username, password })
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Autentificarea a esuat.");
  }

  return payload.user;
}

async function logout() {
  await nativeFetch("/api/auth/logout", {
    method: "POST",
    credentials: "same-origin"
  });
}

async function changePassword(payload) {
  const response = await apiFetch("/api/auth/change-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Nu am putut schimba parola.");
  }

  return data.user;
}

function setView(view) {
  document.querySelectorAll(".view-tab").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
  });

  document.querySelectorAll(".view-section").forEach((section) => {
    section.classList.toggle("is-active", section.dataset.viewPanel === view);
  });
}

function renderStats(stats) {
  const cards = [
    ["Receptii totale", stats.totalReceipts],
    ["Cantitate totala", formatNumber(stats.totalQuantity)],
    ["Valoare estimata", currency.format(stats.totalValue || 0)],
    ["Receptii noi", stats.byStatus.Noua || 0]
  ];

  statsEl.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="stat">
          <span class="stat-label">${label}</span>
          <strong class="stat-value">${value}</strong>
        </article>
      `
    )
    .join("");
}

function renderConfigSummary(summary) {
  const cards = [
    ["Parteneri", summary.partners],
    ["Produse", summary.products],
    ["Locatii", summary.storageLocations],
    ["Tarife", summary.tariffs],
    ["Roluri", summary.roles],
    ["Utilizatori", summary.users]
  ];

  configSummaryEl.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="stat">
          <span class="stat-label">${label}</span>
          <strong class="stat-value">${value}</strong>
        </article>
      `
    )
    .join("");
}

function renderOpeningDrafts() {
  openingStockBodyEl.innerHTML = openingStockDraft
    .map(
      (item) => `
        <tr>
          <td>${item.product}</td>
          <td>${item.location}</td>
          <td>${formatNumber(item.quantity)}</td>
        </tr>
      `
    )
    .join("");

  openingDebtBodyEl.innerHTML = openingDebtDraft
    .map(
      (item) => `
        <tr>
          <td>${item.partner}</td>
          <td>${item.direction === "collection" ? "Incasare" : "Plata"}</td>
          <td>${currency.format(Number(item.amount || 0))}</td>
        </tr>
      `
    )
    .join("");
}

function renderProcessingStats(stats) {
  if (!stats.processing) {
    return;
  }

  const processingCards = [
    ["Procesari", stats.processing.totalProcessings],
    ["Cantitate procesata", formatNumber(stats.processing.totalProcessedQuantity)],
    ["Deseu confirmat", formatNumber(stats.processing.totalConfirmedWaste)]
  ];

  const extraMarkup = processingCards
    .map(
      ([label, value]) => `
        <article class="stat stat-secondary">
          <span class="stat-label">${label}</span>
          <strong class="stat-value">${value}</strong>
        </article>
      `
    )
    .join("");

  statsEl.insertAdjacentHTML("beforeend", extraMarkup);
}

function renderFinanceStats(stats) {
  if (!stats.finance) {
    return;
  }

  const financeCards = [
    ["Plati totale", currency.format(stats.finance.totalPayments || 0)],
    ["Incasari totale", currency.format(stats.finance.totalCollections || 0)],
    ["Tranzactii", stats.finance.totalTransactions || 0]
  ];

  const extraMarkup = financeCards
    .map(
      ([label, value]) => `
        <article class="stat stat-secondary">
          <span class="stat-label">${label}</span>
          <strong class="stat-value">${value}</strong>
        </article>
      `
    )
    .join("");

  statsEl.insertAdjacentHTML("beforeend", extraMarkup);
}

function renderDeliveryStats(stats) {
  if (!stats.deliveries || !stats.complaints) {
    return;
  }

  const deliveryCards = [
    ["Livrari", stats.deliveries.totalDeliveries || 0],
    ["Cantitate livrata", formatNumber(stats.deliveries.totalDeliveredQuantity || 0)],
    ["Reclamatii deschise", stats.complaints.openComplaints || 0]
  ];

  const extraMarkup = deliveryCards
    .map(
      ([label, value]) => `
        <article class="stat stat-secondary">
          <span class="stat-label">${label}</span>
          <strong class="stat-value">${value}</strong>
        </article>
      `
    )
    .join("");

  statsEl.insertAdjacentHTML("beforeend", extraMarkup);
}

function renderAuditStats(stats) {
  if (!stats.audit) {
    return;
  }

  const auditCards = [
    ["Modificari", stats.audit.totalAuditLogs || 0],
    ["Ultimele 24h", stats.audit.recentAuditLogs || 0]
  ];

  const extraMarkup = auditCards
    .map(
      ([label, value]) => `
        <article class="stat stat-secondary">
          <span class="stat-label">${label}</span>
          <strong class="stat-value">${value}</strong>
        </article>
      `
    )
    .join("");

  statsEl.insertAdjacentHTML("beforeend", extraMarkup);
}

function renderStockSummary(summary) {
  const cards = [
    ["Cantitate stoc", formatNumber(summary.totals.totalQuantity)],
    ["Locatii active", summary.totals.totalLocations],
    ["Produse in stoc", summary.totals.totalProducts]
  ];

  stockSummaryEl.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="stat stat-secondary">
          <span class="stat-label">${label}</span>
          <strong class="stat-value">${value}</strong>
        </article>
      `
    )
    .join("");

  stocksBodyEl.innerHTML = summary.byLocation
    .map(
      (item) => `
        <tr>
          <td>${item.location}</td>
          <td>${item.product}</td>
          <td>${formatNumber(item.quantity)}</td>
          <td>${item.unit}</td>
        </tr>
      `
    )
    .join("");
}

function statusOptions(current) {
  return ["Draft", "Confirmat", "Procesata", "Inchis", "Anulat", "Redeschis", "Noua", "Verificata", "Finalizata"].map((status) => {
    const selected = current === status ? "selected" : "";
    return `<option value="${status}" ${selected}>${status}</option>`;
  });
}

function renderReceipts(receipts) {
  const canEditStatuses = canAccess("receipt-write");
  const filteredReceipts = receipts.filter((item) => {
    const statusMatch = !receiptStatusFilterEl.value || item.status === receiptStatusFilterEl.value;
    const productMatch = !receiptProductFilterEl.value || item.product === receiptProductFilterEl.value;
    return statusMatch && productMatch;
  });

  bodyEl.innerHTML = filteredReceipts
    .map((item) => {
      return `
        <tr>
          <td>#${item.id}</td>
          <td>${item.product}</td>
          <td>${item.supplier}</td>
          <td>${formatNumber(item.grossQuantity || item.quantity)} / ${formatNumber(item.provisionalNetQuantity || item.quantity)} ${item.unit}</td>
          <td>${item.location || "-"}</td>
          <td>${currency.format(Number(item.preliminaryPayableAmount || 0))}</td>
          <td>
            <select class="status" data-id="${item.id}" ${canEditStatuses ? "" : "disabled"}>
              ${statusOptions(item.status).join("")}
            </select>
          </td>
          <td>${item.source}</td>
        </tr>
      `;
    })
    .join("");
}

function renderProcessings(processings) {
  const canEditStatuses = canAccess("processing-write");
  const filteredProcessings = processings.filter((item) => {
    const typeMatch =
      !processingTypeFilterEl.value || item.processingType === processingTypeFilterEl.value;
    const receiptMatch =
      !processingReceiptFilterEl.value || String(item.receiptId) === processingReceiptFilterEl.value;
    return typeMatch && receiptMatch;
  });

  processingsBodyEl.innerHTML = filteredProcessings
    .map(
      (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>${item.product}</td>
          <td>#${item.receiptId}</td>
          <td>${item.processingType}</td>
          <td>${formatNumber(item.processedQuantity)}</td>
          <td>${formatNumber(item.confirmedWaste)}</td>
          <td>
            <div>${formatNumber(item.finalNetQuantity)}</div>
            <select class="processing-status" data-id="${item.id}" ${canEditStatuses ? "" : "disabled"}>
              ${["Confirmat", "Inchis", "Anulat", "Redeschis"].map((status) => {
                const selected = item.status === status ? "selected" : "";
                return `<option value="${status}" ${selected}>${status}</option>`;
              }).join("")}
            </select>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderTransactions(transactions) {
  const canEditStatuses = canAccess("finance-write");
  transactionsBodyEl.innerHTML = transactions
    .map(
      (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>${item.referenceType === "delivery" ? `Livrare #${item.deliveryId}` : `Receptie #${item.receiptId}`}</td>
          <td>${item.partner}</td>
          <td>${item.direction === "collection" ? "Incasare" : "Plata"}</td>
          <td>
            <div>${item.paymentType || "-"}</div>
            <select class="transaction-status" data-id="${item.id}" ${canEditStatuses ? "" : "disabled"}>
              ${["Confirmat", "Inchis", "Anulat", "Redeschis"].map((status) => {
                const selected = item.status === status ? "selected" : "";
                return `<option value="${status}" ${selected}>${status}</option>`;
              }).join("")}
            </select>
          </td>
          <td>${currency.format(Number(item.amount || 0))}</td>
        </tr>
      `
    )
    .join("");
}

function renderDeliveries(deliveries) {
  const canEditStatuses = canAccess("delivery-write");
  deliveriesBodyEl.innerHTML = deliveries
    .map(
      (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>#${item.receiptId}</td>
          <td>${item.customer}</td>
          <td>${item.product}</td>
          <td>${formatNumber(item.deliveredQuantity)}</td>
          <td>
            <div>${item.invoiceNumber || "-"}</div>
            <select class="delivery-status" data-id="${item.id}" ${canEditStatuses ? "" : "disabled"}>
              ${["Confirmat", "Inchis", "Anulat", "Redeschis"].map((status) => {
                const selected = item.status === status ? "selected" : "";
                return `<option value="${status}" ${selected}>${status}</option>`;
              }).join("")}
            </select>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderComplaints(complaints) {
  const canEditStatuses = canAccess("complaint-write");
  complaintsBodyEl.innerHTML = complaints
    .map(
      (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>#${item.deliveryId}</td>
          <td>${item.customer}</td>
          <td>${item.complaintType}</td>
          <td>${formatNumber(item.contestedQuantity)}</td>
          <td>
            <select class="complaint-status" data-id="${item.id}" ${canEditStatuses ? "" : "disabled"}>
              ${["Deschisa", "Acceptata", "Respinsa", "Inchisa", "Redeschisa"].map((status) => {
                const selected = item.status === status ? "selected" : "";
                return `<option value="${status}" ${selected}>${status}</option>`;
              }).join("")}
            </select>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderOpenJournal() {
  const partnerFilter = String(openPartnerFilterEl.value || "").trim().toLowerCase();
  const receiptStatusFilter = openReceiptStatusFilterEl.value;
  const deliveryStatusFilter = openDeliveryStatusFilterEl.value;

  const openReceipts = receiptsCache.filter((item) => {
    const status = item.paymentStatus || "Neachitat";
    const statusMatch = !receiptStatusFilter || status === receiptStatusFilter;
    const partnerMatch = !partnerFilter || String(item.supplier || "").toLowerCase().includes(partnerFilter);
    return statusMatch && partnerMatch;
  });
  const openingPaymentDebts = openingDocumentsCache
    .flatMap((item) => item.debtItems || [])
    .filter((item) => item.direction === "payment")
    .filter((item) => {
      const statusMatch = !receiptStatusFilter || (item.status || "Neachitat") === receiptStatusFilter;
      const partnerMatch =
        !partnerFilter || String(item.partner || "").toLowerCase().includes(partnerFilter);
      return statusMatch && partnerMatch;
    });

  const openDeliveries = deliveriesCache.filter((item) => {
    const status = item.collectionStatus || "Neincasat";
    const statusMatch = !deliveryStatusFilter || status === deliveryStatusFilter;
    const partnerMatch = !partnerFilter || String(item.customer || "").toLowerCase().includes(partnerFilter);
    return statusMatch && partnerMatch;
  });
  const openingCollectionDebts = openingDocumentsCache
    .flatMap((item) => item.debtItems || [])
    .filter((item) => item.direction === "collection")
    .filter((item) => {
      const statusMatch = !deliveryStatusFilter || (item.status || "Neincasat") === deliveryStatusFilter;
      const partnerMatch =
        !partnerFilter || String(item.partner || "").toLowerCase().includes(partnerFilter);
      return statusMatch && partnerMatch;
    });

  openReceiptsBodyEl.innerHTML = [...openingPaymentDebts, ...openReceipts]
    .map(
      (item) => `
        <tr>
          <td>${item.id ? `#${item.id}` : "Sold initial"}</td>
          <td>${item.supplier || item.partner}</td>
          <td>${currency.format(Number(item.preliminaryPayableAmount || item.amount || 0))}</td>
          <td>${currency.format(Number(item.paidAmount || item.settledAmount || 0))}</td>
          <td>${item.paymentStatus || item.status || "Neachitat"}</td>
        </tr>
      `
    )
    .join("");

  openDeliveriesBodyEl.innerHTML = [...openingCollectionDebts, ...openDeliveries]
    .map(
      (item) => `
        <tr>
          <td>${item.id ? `#${item.id}` : "Sold initial"}</td>
          <td>${item.customer || item.partner}</td>
          <td>${currency.format(Number(item.contractPrice || 0) * Number(item.deliveredQuantity || 0) || Number(item.amount || 0))}</td>
          <td>${currency.format(Number(item.collectedAmount || item.settledAmount || 0))}</td>
          <td>${item.collectionStatus || item.status || "Neincasat"}</td>
        </tr>
      `
    )
    .join("");
}

function renderAuditLogs(auditLogs) {
  auditBodyEl.innerHTML = auditLogs
    .slice(0, 20)
    .map(
      (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>${item.entityType}${item.entityId ? ` #${item.entityId}` : ""}</td>
          <td>${item.action}</td>
          <td>${item.user || "-"}</td>
          <td>${item.reason}</td>
          <td>${String(item.createdAt || "").replace("T", " ").slice(0, 16)}</td>
        </tr>
      `
    )
    .join("");
}

function renderLockouts(lockouts) {
  if (!lockoutsBodyEl) {
    return;
  }

  if (!lockouts.length) {
    lockoutsBodyEl.innerHTML = `
      <tr>
        <td colspan="4">Nu exista utilizatori blocati in acest moment.</td>
      </tr>
    `;
    return;
  }

  lockoutsBodyEl.innerHTML = lockouts
    .map(
      (item) => `
        <tr>
          <td>${item.username}</td>
          <td>${String(item.blockedUntil || "").replace("T", " ").slice(0, 16)}</td>
          <td>${Math.max(Math.ceil(Number(item.retryAfterMs || 0) / 60000), 1)} min</td>
          <td>
            <button class="ghost-button unlock-user-button" type="button" data-username="${item.username}">
              Deblocheaza
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderDailyReport(report) {
  const cards = [
    ["Receptii", report.summary.receiptsCount],
    ["Brut intrat", formatNumber(report.summary.grossQuantity)],
    ["Net provizoriu", formatNumber(report.summary.provisionalNetQuantity)],
    ["Procesat", formatNumber(report.summary.processedQuantity)],
    ["Livrat", formatNumber(report.summary.deliveredQuantity || 0)],
    ["Deseu", formatNumber(report.summary.confirmedWaste)],
    ["Plati", currency.format(report.summary.paymentsTotal || 0)],
    ["Incasari", currency.format(report.summary.collectionsTotal || 0)],
    ["Reclamatii deschise", report.summary.openComplaints || 0],
    ["Stoc total", formatNumber(report.summary.stockTotal)]
  ];

  dailyReportSummaryEl.innerHTML = cards
    .map(
      ([label, value]) => `
        <article class="stat stat-secondary">
          <span class="stat-label">${label}</span>
          <strong class="stat-value">${value}</strong>
        </article>
      `
    )
    .join("");

  dailyReportReceiptsEl.innerHTML = report.receipts
    .map(
      (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>${item.supplier}</td>
          <td>${item.product}</td>
          <td>${formatNumber(item.grossQuantity || item.quantity)}</td>
          <td>${formatNumber(item.provisionalNetQuantity || item.quantity)}</td>
        </tr>
      `
    )
    .join("");

  dailyReportProcessingsEl.innerHTML = report.processings
    .map(
      (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>#${item.receiptId}</td>
          <td>${item.processingType}</td>
          <td>${formatNumber(item.processedQuantity)}</td>
          <td>${formatNumber(item.confirmedWaste)}</td>
        </tr>
      `
    )
    .join("");

  dailyReportTransactionsEl.innerHTML = report.transactions
    .map(
      (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>${item.partner}</td>
          <td>${item.direction === "collection" ? "Incasare" : "Plata"}</td>
          <td>${item.paymentType || "-"}</td>
          <td>${currency.format(Number(item.amount || 0))}</td>
        </tr>
      `
    )
    .join("");

  dailyReportDeliveriesEl.innerHTML = (report.deliveries || [])
    .map(
      (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>${item.customer}</td>
          <td>${item.product}</td>
          <td>${formatNumber(item.deliveredQuantity)}</td>
          <td>${item.invoiceNumber || "-"}</td>
        </tr>
      `
    )
    .join("");

  dailyReportComplaintsEl.innerHTML = (report.complaints || [])
    .map(
      (item) => `
        <tr>
          <td>#${item.id}</td>
          <td>#${item.deliveryId}</td>
          <td>${item.complaintType}</td>
          <td>${formatNumber(item.contestedQuantity)}</td>
          <td>${item.status}</td>
        </tr>
      `
    )
    .join("");
}

function renderSelectOptions(select, items, mapLabel, placeholder, mapValue = (item) => item.id || item.code) {
  const options = [
    `<option value="" disabled selected>${placeholder}</option>`,
    ...items.map((item) => `<option value="${mapValue(item)}">${mapLabel(item)}</option>`)
  ];

  select.innerHTML = options.join("");
}

function setSelectValue(select, preferredValues = []) {
  const availableValues = Array.from(select.options)
    .filter((option) => !option.disabled)
    .map((option) => String(option.value));
  const matchedValue = preferredValues.find((value) =>
    value !== undefined &&
    value !== null &&
    value !== "" &&
    availableValues.includes(String(value))
  );

  select.value = matchedValue !== undefined ? String(matchedValue) : availableValues[0] || "";
  return select.value;
}

function renderReceiptSelectors(config) {
  const currentSelections = {
    supplierId: supplierSelect.value,
    productId: productSelect.value,
    locationId: locationSelect.value,
    receivedBy: userSelect.value,
    processingReceiptId: processingReceiptSelect.value,
    processingType: processingTypeSelect.value,
    processingUserId: processingUserSelect.value,
    paymentType: transactionPaymentTypeSelect.value,
    deliveryReceiptId: deliveryReceiptSelect.value,
    deliveryCustomerId: deliveryCustomerSelect.value,
    complaintDeliveryId: complaintDeliverySelect.value
  };
  const suppliers = config.partners.filter((item) => item.role === "furnizor" || item.role === "ambele");
  const customers = config.partners.filter((item) => item.role === "cumparator" || item.role === "ambele");
  const operators = config.users.filter((item) =>
    ["operator", "manager", "admin"].includes(item.roleCode)
  );

  renderSelectOptions(supplierSelect, suppliers, (item) => item.name, "Selecteaza furnizor");
  renderSelectOptions(productSelect, config.products, (item) => `${item.name} (${item.code})`, "Selecteaza produs");
  renderSelectOptions(locationSelect, config.storageLocations, (item) => item.name, "Selecteaza locatie");
  renderSelectOptions(userSelect, operators, (item) => item.name, "Selecteaza utilizator");
  renderSelectOptions(
    openingStockProductEl,
    config.products,
    (item) => `${item.name} (${item.code})`,
    "Selecteaza produs"
  );
  renderSelectOptions(
    openingStockLocationEl,
    config.storageLocations,
    (item) => item.name,
    "Selecteaza locatie"
  );
  renderSelectOptions(
    openingDebtPartnerEl,
    config.partners,
    (item) => item.name,
    "Selecteaza partener"
  );

  setSelectValue(supplierSelect, [currentSelections.supplierId, suppliers[0]?.id]);
  setSelectValue(productSelect, [currentSelections.productId, config.products[0]?.id]);
  setSelectValue(locationSelect, [currentSelections.locationId, config.storageLocations[0]?.id]);
  setSelectValue(userSelect, [currentSessionUser?.id, currentSelections.receivedBy, operators[0]?.id]);
  setSelectValue(openingStockProductEl, [openingStockProductEl.value, config.products[0]?.id]);
  setSelectValue(openingStockLocationEl, [openingStockLocationEl.value, config.storageLocations[0]?.id]);
  setSelectValue(openingDebtPartnerEl, [openingDebtPartnerEl.value, config.partners[0]?.id]);
  syncUnitByProduct();

  const processingReceiptOptions = receiptsCache.filter((item) => item.status !== "Procesata");
  renderSelectOptions(
    processingReceiptSelect,
    processingReceiptOptions,
    (item) => `#${item.id} - ${item.product} - ${item.supplier}`,
    "Selecteaza receptia"
  );
  renderSelectOptions(
    processingTypeSelect,
    config.processingTypes.filter((item) => item.active),
    (item) => item.name,
    "Selecteaza procesarea"
  );
  renderSelectOptions(
    processingUserSelect,
    operators,
    (item) => item.name,
    "Selecteaza operator"
  );
  renderSelectOptions(
    transactionPaymentTypeSelect,
    config.paymentTypes.filter((item) => item.active),
    (item) => item.name,
    "Selecteaza tipul de plata",
    (item) => item.name
  );
  renderSelectOptions(
    deliveryReceiptSelect,
    receiptsCache.filter(
      (item) =>
        Number(
          item.availableQuantity ??
            item.finalNetQuantity ??
            item.provisionalNetQuantity ??
            item.quantity
        ) > 0
    ),
    (item) => `#${item.id} - ${item.product} - ${item.location || "-"}`,
    "Selecteaza receptia"
  );
  renderSelectOptions(
    deliveryCustomerSelect,
    customers,
    (item) => item.name,
    "Selecteaza cumparator"
  );
  renderSelectOptions(
    complaintDeliverySelect,
    deliveriesCache,
    (item) => `#${item.id} - ${item.customer} - ${item.product}`,
    "Selecteaza livrarea"
  );

  const activePaymentType = config.paymentTypes.find((item) => item.active);
  setSelectValue(processingReceiptSelect, [currentSelections.processingReceiptId, processingReceiptOptions[0]?.id]);
  setSelectValue(
    processingTypeSelect,
    [currentSelections.processingType, config.processingTypes.find((item) => item.active)?.name]
  );
  setSelectValue(processingUserSelect, [currentSelections.processingUserId, currentSessionUser?.id, operators[0]?.id]);
  setSelectValue(transactionPaymentTypeSelect, [currentSelections.paymentType, activePaymentType?.name]);
  setSelectValue(
    deliveryReceiptSelect,
    [
      currentSelections.deliveryReceiptId,
      receiptsCache.find(
        (item) =>
          Number(
            item.availableQuantity ??
              item.finalNetQuantity ??
              item.provisionalNetQuantity ??
              item.quantity
          ) > 0
      )?.id
    ]
  );
  setSelectValue(deliveryCustomerSelect, [currentSelections.deliveryCustomerId, customers[0]?.id]);
  setSelectValue(complaintDeliverySelect, [currentSelections.complaintDeliveryId, deliveriesCache[0]?.id]);

  renderTransactionReferenceOptions();
  syncTransactionDirection();
  renderTransactionPreview();
  renderDeliveryPreview();
}

function renderFilterOptions() {
  const productNames = Array.from(new Set(receiptsCache.map((item) => item.product))).sort((a, b) =>
    a.localeCompare(b, "ro")
  );
  const processingTypes = Array.from(
    new Set(processingsCache.map((item) => item.processingType))
  ).sort((a, b) => a.localeCompare(b, "ro"));
  const processingReceipts = Array.from(new Set(processingsCache.map((item) => item.receiptId))).sort(
    (a, b) => a - b
  );

  receiptProductFilterEl.innerHTML = [
    '<option value="">Toate produsele</option>',
    ...productNames.map((name) => `<option value="${name}">${name}</option>`)
  ].join("");

  processingTypeFilterEl.innerHTML = [
    '<option value="">Toate procesarile</option>',
    ...processingTypes.map((name) => `<option value="${name}">${name}</option>`)
  ].join("");

  processingReceiptFilterEl.innerHTML = [
    '<option value="">Toate receptiile</option>',
    ...processingReceipts.map((id) => `<option value="${id}">#${id}</option>`)
  ].join("");
}

function renderMiniList(entity, items) {
  const target = document.getElementById(`${entity}-list`);
  if (!target) {
    return;
  }

  if (!items.length) {
    target.innerHTML = `<p class="empty-state">Nu exista elemente inca.</p>`;
    return;
  }

  target.innerHTML = items
    .map((item) => {
      const detail = getItemDetails(entity, item);
      const canToggle = Object.prototype.hasOwnProperty.call(item, "active");
      return `
        <article class="list-item">
          <div>
            <strong>${getItemTitle(entity, item)}</strong>
            <p>${detail}</p>
          </div>
          <div class="list-actions">
            <button class="ghost-button" type="button" data-action="edit" data-entity="${entity}" data-id="${item.id}">
              Editeaza
            </button>
            ${
              canToggle
                ? `<button class="ghost-button" type="button" data-action="toggle" data-entity="${entity}" data-id="${item.id}">
                    ${item.active ? "Dezactiveaza" : "Activeaza"}
                  </button>`
                : ""
            }
          </div>
        </article>
      `;
    })
    .join("");
}

function getItemTitle(entity, item) {
  switch (entity) {
    case "tariffs":
      return `${item.service} - ${item.value}`;
    default:
      return item.name || item.code || `#${item.id}`;
  }
}

function getItemDetails(entity, item) {
  switch (entity) {
    case "partners":
      return `${item.role} | ${item.fiscalProfile} | ${item.phone || "fara telefon"}`;
    case "products":
      return `${item.unit} | umiditate ${item.humidityNorm}% | impuritati ${item.impurityNorm}%`;
    case "storageLocations":
      return `${item.type} | cap. ${formatNumber(item.capacity)} | cost ${item.costCategory}`;
    case "tariffs":
      return `${item.product} | ${item.calculation} | valabil din ${item.validFrom} | ${item.active ? "activ" : "inactiv"}`;
    case "roles":
      return `${item.code} | ${item.permissions}`;
    case "users":
      return `${item.username || "-"} | ${item.roleCode} | ${item.channel} | ${item.active === false ? "inactiv" : "activ"}`;
    case "paymentTypes":
      return item.active ? "activ" : "inactiv";
    case "fiscalProfiles":
      return `retinere ${item.withholdingPercent}% | TVA ${item.vat ? "da" : "nu"}`;
    case "processingTypes":
      return `${item.resource} | norma ${item.consumptionNorm}`;
    default:
      return "";
  }
}

function renderSetupLists(config) {
  [
    "partners",
    "products",
    "storageLocations",
    "tariffs",
    "roles",
    "users",
    "paymentTypes",
    "fiscalProfiles",
    "processingTypes"
  ].forEach((entity) => renderMiniList(entity, config[entity]));
}

function renderSetupSelectors(config) {
  fiscalProfileOptions.innerHTML = config.fiscalProfiles
    .map((item) => `<option value="${item.name}">${item.name}</option>`)
    .join("");

  roleOptions.innerHTML = config.roles
    .map((item) => `<option value="${item.code}">${item.name}</option>`)
    .join("");

  systemSettingsForm.elements.closeOfDayHour.value = config.systemSettings.closeOfDayHour;
  systemSettingsForm.elements.reportChannel.value = config.systemSettings.reportChannel;
  systemSettingsForm.elements.reportAudience.value = config.systemSettings.reportAudience;
  systemSettingsForm.elements.defaultCurrency.value = config.systemSettings.defaultCurrency;
}

function getEditorSchema(entity) {
  const commonActiveField = {
    name: "active",
    label: "Status",
    type: "select",
    options: [
      { value: "true", label: "Activ" },
      { value: "false", label: "Inactiv" }
    ]
  };

  const schemas = {
    partners: {
      title: "Editare partener",
      copy: "Actualizeaza datele partenerului si statutul lui operational.",
      fields: [
        { name: "name", label: "Denumire", type: "text" },
        { name: "idno", label: "IDNO", type: "text" },
        { name: "phone", label: "Telefon", type: "text" },
        { name: "address", label: "Adresa", type: "text" },
        {
          name: "role",
          label: "Rol",
          type: "select",
          options: [
            { value: "furnizor", label: "Furnizor" },
            { value: "cumparator", label: "Cumparator" },
            { value: "ambele", label: "Ambele" }
          ]
        },
        {
          name: "fiscalProfile",
          label: "Statut fiscal",
          type: "select",
          options: () => currentConfig.fiscalProfiles.map((item) => ({ value: item.name, label: item.name }))
        }
      ]
    },
    products: {
      title: "Editare produs",
      copy: "Modifica parametrii de baza pentru produs.",
      fields: [
        { name: "name", label: "Denumire", type: "text" },
        { name: "code", label: "Cod", type: "text" },
        { name: "unit", label: "Unitate", type: "text" },
        { name: "humidityNorm", label: "Norma umiditate", type: "number", step: "0.01" },
        { name: "impurityNorm", label: "Norma impuritati", type: "number", step: "0.01" },
        commonActiveField
      ]
    },
    storageLocations: {
      title: "Editare locatie de stoc",
      copy: "Actualizeaza tipul, capacitatea si categoria de cost.",
      fields: [
        { name: "name", label: "Denumire", type: "text" },
        {
          name: "type",
          label: "Tip locatie",
          type: "select",
          options: [
            { value: "groapa", label: "Groapa" },
            { value: "tampon", label: "Tampon" },
            { value: "cilindru", label: "Cilindru" },
            { value: "depozit", label: "Depozit" }
          ]
        },
        { name: "capacity", label: "Capacitate", type: "number", step: "0.01" },
        {
          name: "costCategory",
          label: "Categorie cost",
          type: "select",
          options: [
            { value: "neprocesat", label: "Neprocesat" },
            { value: "procesat", label: "Procesat" }
          ]
        },
        commonActiveField
      ]
    },
    tariffs: {
      title: "Editare tarif",
      copy: "Actualizeaza valoarea si regula comerciala pentru tarif.",
      fields: [
        { name: "service", label: "Serviciu", type: "text" },
        { name: "product", label: "Produs", type: "text" },
        { name: "partner", label: "Partener", type: "text" },
        { name: "fiscalProfile", label: "Statut fiscal", type: "text" },
        { name: "calculation", label: "Mod calcul", type: "text" },
        { name: "value", label: "Valoare", type: "number", step: "0.01" },
        { name: "validFrom", label: "Valabil din", type: "date" },
        commonActiveField
      ]
    },
    roles: {
      title: "Editare rol",
      copy: "Actualizeaza denumirea rolului si lista de permisiuni.",
      fields: [
        { name: "name", label: "Nume rol", type: "text" },
        { name: "code", label: "Cod rol", type: "text" },
        { name: "permissions", label: "Permisiuni", type: "text" }
      ]
    },
    users: {
      title: "Editare utilizator",
      copy: "Actualizeaza username-ul, rolul si parola utilizatorului.",
      fields: [
        { name: "name", label: "Nume", type: "text" },
        { name: "username", label: "Username", type: "text" },
        {
          name: "roleCode",
          label: "Rol",
          type: "select",
          options: () => currentConfig.roles.map((item) => ({ value: item.code, label: item.name }))
        },
        {
          name: "channel",
          label: "Canal",
          type: "select",
          options: [
            { value: "web", label: "web" },
            { value: "web+telegram", label: "web+telegram" },
            { value: "telegram", label: "telegram" }
          ]
        },
        commonActiveField,
        { name: "password", label: "Parola noua", type: "password" }
      ]
    },
    paymentTypes: {
      title: "Editare tip plata",
      copy: "Actualizeaza denumirea si disponibilitatea tipului de plata.",
      fields: [{ name: "name", label: "Denumire", type: "text" }, commonActiveField]
    },
    fiscalProfiles: {
      title: "Editare statut fiscal",
      copy: "Actualizeaza retinerea si regimul TVA.",
      fields: [
        { name: "name", label: "Denumire", type: "text" },
        { name: "withholdingPercent", label: "Retinere %", type: "number", step: "0.01" },
        {
          name: "vat",
          label: "TVA",
          type: "select",
          options: [
            { value: "true", label: "Cu TVA" },
            { value: "false", label: "Fara TVA" }
          ]
        },
        commonActiveField
      ]
    },
    processingTypes: {
      title: "Editare tip procesare",
      copy: "Actualizeaza norma de consum si resursa folosita.",
      fields: [
        { name: "name", label: "Denumire", type: "text" },
        { name: "consumptionNorm", label: "Norma consum", type: "number", step: "0.01" },
        { name: "resource", label: "Resursa", type: "text" },
        commonActiveField
      ]
    }
  };

  return schemas[entity] || null;
}

function fieldOptions(field) {
  if (typeof field.options === "function") {
    return field.options();
  }

  return field.options || [];
}

function renderEditorField(field, item) {
  const value = item[field.name];
  const safeValue =
    field.type === "password"
      ? ""
      : value === undefined || value === null
        ? ""
        : String(value);

  if (field.type === "select") {
    const options = fieldOptions(field)
      .map((option) => {
        const selected = String(option.value) === safeValue ? "selected" : "";
        return `<option value="${option.value}" ${selected}>${option.label}</option>`;
      })
      .join("");

    return `
      <label>
        ${field.label}
        <select name="${field.name}">
          ${options}
        </select>
      </label>
    `;
  }

  return `
    <label>
      ${field.label}
      <input
        name="${field.name}"
        type="${field.type || "text"}"
        value="${safeValue.replace(/"/g, "&quot;")}"
        ${field.step ? `step="${field.step}"` : ""}
      />
    </label>
  `;
}

function resetEditor() {
  currentEditor = null;
  editorTitleEl.textContent = "Editor configurare";
  editorCopyEl.textContent =
    "Selecteaza un element din listele de mai sus pentru editare controlata in pagina.";
  editorFieldsEl.innerHTML = "";
  editorEmptyEl.hidden = false;
  editorSaveButton.disabled = true;
  editorCancelButton.disabled = true;
  editorMessageEl.textContent = "";
}

function openEditor(entity, item) {
  const schema = getEditorSchema(entity);
  if (!schema) {
    return;
  }

  currentEditor = {
    entity,
    id: item.id
  };

  editorTitleEl.textContent = schema.title;
  editorCopyEl.textContent = schema.copy;
  editorFieldsEl.innerHTML = schema.fields.map((field) => renderEditorField(field, item)).join("");
  editorEmptyEl.hidden = true;
  editorSaveButton.disabled = false;
  editorCancelButton.disabled = false;
  editorMessageEl.textContent = "";
}

function syncUnitByProduct() {
  const selectedProduct = currentConfig.products.find(
    (item) => String(item.id) === String(productSelect.value)
  );

  unitInput.value = selectedProduct ? selectedProduct.unit : "";
  if (selectedProduct) {
    if (!String(humidityInput.value || "").trim()) {
      humidityInput.value = String(selectedProduct.humidityNorm ?? 0);
    }

    if (!String(impurityInput.value || "").trim()) {
      impurityInput.value = String(selectedProduct.impurityNorm ?? 0);
    }
  }
  renderReceiptEstimate();
}

function getActiveTariff(serviceName) {
  return (
    currentConfig.tariffs.find(
      (item) => item.active && item.service.toLowerCase() === serviceName.toLowerCase()
    ) || null
  );
}

function getReceiptEstimate() {
  const selectedProduct = currentConfig.products.find(
    (item) => String(item.id) === String(productSelect.value)
  );
  const selectedPartner = currentConfig.partners.find(
    (item) => String(item.id) === String(supplierSelect.value)
  );
  const fiscalProfile = currentConfig.fiscalProfiles.find(
    (item) => item.name === selectedPartner?.fiscalProfile
  );
  const quantity = Number(formEl.elements.quantity.value || 0);
  const price = Number(formEl.elements.price.value || 0);
  const humidity = Number(humidityInput.value || 0);
  const impurity = Number(impurityInput.value || 0);
  const humidityNorm = Number(selectedProduct?.humidityNorm || 0);
  const impurityNorm = Number(selectedProduct?.impurityNorm || 0);
  const excessHumidity = Math.max(humidity - humidityNorm, 0);
  const excessImpurity = Math.max(impurity - impurityNorm, 0);
  const estimatedWaterLoss = quantity * (excessHumidity / 100);
  const estimatedImpurityLoss = quantity * (excessImpurity / 100);
  const provisionalNetQuantity = Math.max(
    quantity - estimatedWaterLoss - estimatedImpurityLoss,
    0
  );
  const cleaningTariff = Number(getActiveTariff("Curatire")?.value || 0);
  const dryingTariff = Number(getActiveTariff("Uscare")?.value || 0);
  const cleaningServiceTotal = quantity * cleaningTariff;
  const dryingServiceTotal = quantity * excessHumidity * dryingTariff;
  const preliminaryServicesTotal = cleaningServiceTotal + dryingServiceTotal;
  const preliminaryMerchandiseValue = provisionalNetQuantity * price;
  const withholdingPercent = Number(fiscalProfile?.withholdingPercent || 0);
  const withholdingAmount =
    Math.max(preliminaryMerchandiseValue - preliminaryServicesTotal, 0) *
    (withholdingPercent / 100);
  const preliminaryPayableAmount = Math.max(
    preliminaryMerchandiseValue - preliminaryServicesTotal - withholdingAmount,
    0
  );

  return {
    humidityNorm,
    impurityNorm,
    provisionalNetQuantity,
    preliminaryServicesTotal,
    preliminaryPayableAmount
  };
}

function renderReceiptEstimate() {
  if (!currentConfig) {
    return;
  }

  const estimate = getReceiptEstimate();
  estimateHumidityNormEl.textContent = `${formatNumber(estimate.humidityNorm)}%`;
  estimateImpurityNormEl.textContent = `${formatNumber(estimate.impurityNorm)}%`;
  estimateNetEl.textContent = formatNumber(estimate.provisionalNetQuantity);
  estimateServicesEl.textContent = currency.format(estimate.preliminaryServicesTotal || 0);
  estimatePayableEl.textContent = currency.format(estimate.preliminaryPayableAmount || 0);
}

async function loadReceipts() {
  if (!canAccess("receipts-read")) {
    receiptsCache = [];
    renderReceipts([]);
    return;
  }
  const response = await fetch("/api/receipts");
  const data = await response.json();
  receiptsCache = data.receipts;
  renderStats(data.stats);
  renderProcessingStats(data.stats);
  renderFinanceStats(data.stats);
  renderDeliveryStats(data.stats);
  renderAuditStats(data.stats);
  renderReceipts(data.receipts);
  renderOpenJournal();
  if (currentConfig) {
    renderReceiptSelectors(currentConfig);
    renderProcessingEstimate();
  }
  renderFilterOptions();
}

async function loadProcessings() {
  if (!canAccess("processings-read")) {
    processingsCache = [];
    renderProcessings([]);
    return;
  }
  const response = await fetch("/api/processings");
  const data = await response.json();
  processingsCache = data.processings;
  renderProcessings(data.processings);
  renderFilterOptions();
}

async function loadStocks() {
  if (!canAccess("stocks-read")) {
    renderStockSummary({ byLocation: [], totals: { totalQuantity: 0, totalLocations: 0, totalProducts: 0 } });
    return;
  }
  const response = await fetch("/api/stocks");
  const data = await response.json();
  renderStockSummary(data);
}

async function loadTransactions() {
  if (!canAccess("finance")) {
    transactionsCache = [];
    renderTransactions([]);
    return;
  }
  const response = await fetch("/api/transactions");
  const data = await response.json();
  transactionsCache = data.transactions;
  renderTransactions(data.transactions);
  renderTransactionPreview();
}

async function loadDeliveries() {
  if (!canAccess("deliveries-read")) {
    deliveriesCache = [];
    renderDeliveries([]);
    return;
  }
  const response = await fetch("/api/deliveries");
  const data = await response.json();
  deliveriesCache = data.deliveries;
  renderDeliveries(data.deliveries);
  renderOpenJournal();
  if (currentConfig) {
    renderReceiptSelectors(currentConfig);
  }
}

async function loadComplaints() {
  if (!canAccess("complaints-read")) {
    complaintsCache = [];
    renderComplaints([]);
    return;
  }
  const response = await fetch("/api/complaints");
  const data = await response.json();
  complaintsCache = data.complaints;
  renderComplaints(data.complaints);
  if (currentConfig) {
    renderReceiptSelectors(currentConfig);
  }
}

async function loadAuditLogs() {
  if (!canAccess("audit")) {
    auditLogsCache = [];
    renderAuditLogs([]);
    return;
  }
  const response = await fetch("/api/audit-logs");
  const data = await response.json();
  auditLogsCache = data.auditLogs;
  renderAuditLogs(data.auditLogs);
}

async function loadLockouts() {
  if (!canAccess("security-admin")) {
    lockoutsCache = [];
    renderLockouts([]);
    return;
  }

  const response = await fetch("/api/security/lockouts");
  const data = await response.json();
  lockoutsCache = data.lockouts || [];
  renderLockouts(lockoutsCache);
}

async function loadOpeningDocuments() {
  if (!canAccess("opening")) {
    openingDocumentsCache = [];
    renderOpenJournal();
    return;
  }
  const response = await fetch("/api/opening-documents");
  const data = await response.json();
  openingDocumentsCache = data.openingDocuments;
  renderOpenJournal();
}

async function loadDailyReport() {
  if (!canAccess("reports")) {
    renderDailyReport({
      summary: {
        receiptsCount: 0,
        grossQuantity: 0,
        provisionalNetQuantity: 0,
        processedQuantity: 0,
        deliveredQuantity: 0,
        confirmedWaste: 0,
        paymentsTotal: 0,
        collectionsTotal: 0,
        openComplaints: 0,
        stockTotal: 0
      },
      receipts: [],
      processings: [],
      transactions: [],
      deliveries: [],
      complaints: []
    });
    return;
  }
  const dateValue = dailyReportDateEl.value || new Date().toISOString().slice(0, 10);
  const response = await fetch(`/api/reports/daily?date=${encodeURIComponent(dateValue)}`);
  const data = await response.json();
  renderDailyReport(data);
}

async function loadConfig() {
  if (!canAccess("config-read")) {
    return;
  }
  const response = await fetch("/api/config");
  const data = await response.json();
  const pendingEditor = currentEditor ? { ...currentEditor } : null;
  currentConfig = data;
  renderConfigSummary(data.summary);
  renderReceiptSelectors(data);
  renderSetupLists(data);
  renderSetupSelectors(data);
  renderReceiptEstimate();
  applyRoleAccess();

  if (pendingEditor) {
    const refreshedItem = getEntityItem(pendingEditor.entity, pendingEditor.id);
    if (refreshedItem) {
      openEditor(pendingEditor.entity, refreshedItem);
    } else {
      resetEditor();
    }
  }
}

async function loadDashboard() {
  dailyReportDateEl.value = new Date().toISOString().slice(0, 10);
  openingDocumentDateEl.value = new Date().toISOString().slice(0, 10);
  await Promise.all([
    loadOpeningDocuments(),
    loadReceipts(),
    loadConfig(),
    loadProcessings(),
    loadStocks(),
    loadTransactions(),
    loadDeliveries(),
    loadComplaints(),
    loadAuditLogs(),
    loadLockouts(),
    loadDailyReport()
  ]);
}

async function createReceipt(formData) {
  const product = currentConfig.products.find((item) => String(item.id) === formData.get("productId"));
  const partner = currentConfig.partners.find((item) => String(item.id) === formData.get("supplierId"));
  const location = currentConfig.storageLocations.find(
    (item) => String(item.id) === formData.get("locationId")
  );
  const receiver = currentConfig.users.find((item) => String(item.id) === formData.get("receivedBy"));
  const selectedProduct = currentConfig.products.find(
    (item) => String(item.id) === String(formData.get("productId"))
  );

  const payload = {
    supplierId: formData.get("supplierId"),
    supplier: partner?.name || "",
    productId: formData.get("productId"),
    product: product?.name || "",
    quantity: formData.get("quantity"),
    unit: product?.unit || formData.get("unit"),
    price: formData.get("price") || "0",
    humidity: formData.get("humidity") || String(selectedProduct?.humidityNorm ?? 0),
    impurity: formData.get("impurity") || String(selectedProduct?.impurityNorm ?? 0),
    vehicle: formData.get("vehicle"),
    note: formData.get("note"),
    locationId: formData.get("locationId"),
    location: location?.name || "",
    receivedBy: receiver?.name || currentSessionUser?.name || "",
    source: "dashboard"
  };

  const response = await fetch("/api/receipts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Eroare la salvare.");
  }
}

function validateReceiptForm(formData) {
  if (!formData.get("supplierId")) {
    return "Selecteaza furnizorul.";
  }

  if (!formData.get("productId")) {
    return "Selecteaza produsul.";
  }

  if (Number(formData.get("quantity") || 0) <= 0) {
    return "Cantitatea trebuie sa fie mai mare ca zero.";
  }

  if (Number(formData.get("price") || 0) < 0) {
    return "Pretul nu poate fi negativ.";
  }

  if (Number(formData.get("humidity") || 0) < 0 || Number(formData.get("impurity") || 0) < 0) {
    return "Umiditatea si impuritatile trebuie sa fie valori pozitive.";
  }

  return "";
}

function validateTransactionForm(formData) {
  if (!formData.get("referenceId")) {
    return "Selecteaza referinta pentru plata sau incasare.";
  }

  if (Number(formData.get("amount") || 0) <= 0) {
    return "Suma trebuie sa fie mai mare ca zero.";
  }

  return "";
}

function validateDeliveryForm(formData) {
  if (!formData.get("receiptId")) {
    return "Selecteaza receptia sursa.";
  }

  if (!formData.get("customerId")) {
    return "Selecteaza cumparatorul.";
  }

  if (Number(formData.get("deliveredQuantity") || 0) <= 0) {
    return "Cantitatea livrata trebuie sa fie mai mare ca zero.";
  }

  return "";
}

function getFormSubmitMode(form) {
  const mode = form.dataset.submitMode === "save-new" ? "save-new" : "save";
  form.dataset.submitMode = "save";
  return mode;
}

function resetReceiptForm(mode = "save") {
  const preserveContext = mode !== "save-new";
  const preservedValues = {
    supplierId: preserveContext ? supplierSelect.value : "",
    productId: preserveContext ? productSelect.value : "",
    locationId: preserveContext ? locationSelect.value : "",
    receivedBy: preserveContext ? userSelect.value : "",
    price: preserveContext ? formEl.elements.price.value : "",
    humidity: preserveContext ? humidityInput.value : "",
    impurity: preserveContext ? impurityInput.value : ""
  };

  formEl.reset();
  if (currentConfig) {
    renderReceiptSelectors(currentConfig);
  }

  if (preserveContext) {
    setSelectValue(supplierSelect, [preservedValues.supplierId]);
    setSelectValue(productSelect, [preservedValues.productId]);
    setSelectValue(locationSelect, [preservedValues.locationId]);
    setSelectValue(userSelect, [preservedValues.receivedBy, currentSessionUser?.id]);
  }

  formEl.elements.price.value = preservedValues.price || "";
  humidityInput.value = preservedValues.humidity || "";
  impurityInput.value = preservedValues.impurity || "";
  formEl.elements.quantity.value = "";
  formEl.elements.vehicle.value = "";
  formEl.elements.note.value = "";
  syncUnitByProduct();
  formEl.elements.quantity.focus();
}

function resetTransactionForm(mode = "save") {
  const preserveContext = mode !== "save-new";
  const preservedValues = {
    referenceType: preserveContext ? transactionReferenceTypeSelect.value : "",
    referenceId: preserveContext ? transactionReferenceSelect.value : "",
    paymentType: preserveContext ? transactionPaymentTypeSelect.value : ""
  };

  transactionFormEl.reset();
  if (preserveContext && preservedValues.referenceType) {
    transactionReferenceTypeSelect.value = preservedValues.referenceType;
  }

  renderTransactionReferenceOptions();
  syncTransactionDirection();

  if (preserveContext) {
    setSelectValue(transactionReferenceSelect, [preservedValues.referenceId]);
    setSelectValue(transactionPaymentTypeSelect, [preservedValues.paymentType]);
  }

  transactionFormEl.elements.amount.value = "";
  transactionFormEl.elements.note.value = "";
  renderTransactionPreview();
  transactionFormEl.elements.amount.focus();
}

function resetDeliveryForm(mode = "save") {
  const preserveContext = mode !== "save-new";
  const preservedValues = {
    receiptId: preserveContext ? deliveryReceiptSelect.value : "",
    customerId: preserveContext ? deliveryCustomerSelect.value : "",
    contractNumber: preserveContext ? deliveryFormEl.elements.contractNumber.value : "",
    contractDate: preserveContext ? deliveryFormEl.elements.contractDate.value : "",
    contractPrice: preserveContext ? deliveryFormEl.elements.contractPrice.value : ""
  };

  deliveryFormEl.reset();
  if (currentConfig) {
    renderReceiptSelectors(currentConfig);
  }

  if (preserveContext) {
    setSelectValue(deliveryReceiptSelect, [preservedValues.receiptId]);
    setSelectValue(deliveryCustomerSelect, [preservedValues.customerId]);
    deliveryFormEl.elements.contractNumber.value = preservedValues.contractNumber || "";
    deliveryFormEl.elements.contractDate.value = preservedValues.contractDate || "";
    deliveryFormEl.elements.contractPrice.value = preservedValues.contractPrice || "";
  }

  deliveryFormEl.elements.deliveredQuantity.value = "";
  deliveryFormEl.elements.vehicle.value = "";
  deliveryFormEl.elements.invoiceNumber.value = "";
  deliveryFormEl.elements.note.value = "";
  renderDeliveryPreview();
  deliveryFormEl.elements.deliveredQuantity.focus();
}

async function createOpeningDocument(formData) {
  const payload = {
    documentDate: formData.get("documentDate"),
    note: formData.get("note"),
    stockItems: openingStockDraft,
    debtItems: openingDebtDraft,
    createdBy: "dashboard"
  };

  const response = await fetch("/api/opening-documents", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Nu am putut salva soldul initial.");
  }
}

function getSelectedReceiptForProcessing() {
  return receiptsCache.find(
    (item) => String(item.id) === String(processingReceiptSelect.value)
  );
}

function renderProcessingEstimate() {
  const receipt = getSelectedReceiptForProcessing();
  const processedQuantity = Number(processedQuantityInput.value || 0);
  const confirmedWaste = Number(confirmedWasteInput.value || 0);
  const finalNet = Math.max(processedQuantity - confirmedWaste, 0);

  processingSourceEl.textContent = receipt?.location || "-";
  processingProvisionalNetEl.textContent = formatNumber(receipt?.provisionalNetQuantity || 0);
  processingFinalNetEl.textContent = formatNumber(finalNet);
}

async function createProcessing(formData) {
  const receipt = getSelectedReceiptForProcessing();
  const operator = currentConfig.users.find(
    (item) => String(item.id) === String(formData.get("operator"))
  );

  const payload = {
    receiptId: formData.get("receiptId"),
    processingType: formData.get("processingType"),
    processedQuantity: formData.get("processedQuantity"),
    confirmedWaste: formData.get("confirmedWaste"),
    finalHumidity: formData.get("finalHumidity"),
    operator: operator?.name || "",
    note: formData.get("note"),
    sourceLocation: receipt?.location || ""
  };

  const response = await fetch("/api/processings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Eroare la salvarea procesarii.");
  }
}

function getTransactionReferenceType() {
  return transactionReferenceTypeSelect.value === "delivery"
    ? "delivery"
    : transactionReferenceTypeSelect.value === "opening-debt"
      ? "opening-debt"
      : "receipt";
}

function renderTransactionReferenceOptions() {
  const referenceType = getTransactionReferenceType();
  const currentReferenceValue = transactionReferenceSelect.value;

  if (referenceType === "delivery") {
    renderSelectOptions(
      transactionReferenceSelect,
      deliveriesCache,
      (item) => `#${item.id} - ${item.customer} - ${item.product}`,
      "Selecteaza livrarea"
    );

    setSelectValue(transactionReferenceSelect, [currentReferenceValue, deliveriesCache[0]?.id]);

    return;
  }

  if (referenceType === "opening-debt") {
    const openingDebtItems = openingDocumentsCache.flatMap((item) => item.debtItems || []);
    renderSelectOptions(
      transactionReferenceSelect,
      openingDebtItems,
      (item) =>
        `${item.openingDebtId} - ${item.partner} - ${item.direction === "collection" ? "Incasare" : "Plata"}`,
      "Selecteaza datoria initiala",
      (item) => item.openingDebtId
    );

    setSelectValue(
      transactionReferenceSelect,
      [currentReferenceValue, openingDebtItems[0]?.openingDebtId]
    );

    return;
  }

  renderSelectOptions(
    transactionReferenceSelect,
    receiptsCache,
    (item) => `#${item.id} - ${item.supplier} - ${item.product}`,
    "Selecteaza receptia"
  );

  setSelectValue(transactionReferenceSelect, [currentReferenceValue, receiptsCache[0]?.id]);
}

function getTransactionDirectionLabel(direction) {
  return direction === "collection" ? "Incasare" : "Plata";
}

function syncTransactionDirection() {
  const referenceType = getTransactionReferenceType();
  let direction = "payment";

  if (referenceType === "delivery") {
    direction = "collection";
  } else if (referenceType === "opening-debt") {
    const openingDebt = getSelectedOpeningDebtForTransaction();
    direction = openingDebt?.direction === "collection" ? "collection" : "payment";
  }

  transactionDirectionSelect.value = direction;
  if (transactionDirectionChipEl) {
    transactionDirectionChipEl.textContent = getTransactionDirectionLabel(direction);
  }
}

function getSelectedReceiptForTransaction() {
  if (getTransactionReferenceType() !== "receipt") {
    return null;
  }

  return receiptsCache.find((item) => String(item.id) === String(transactionReferenceSelect.value));
}

function getSelectedOpeningDebtForTransaction() {
  if (getTransactionReferenceType() !== "opening-debt") {
    return null;
  }

  return openingDocumentsCache
    .flatMap((item) => item.debtItems || [])
    .find((item) => String(item.openingDebtId) === String(transactionReferenceSelect.value));
}

function getSelectedDeliveryForTransaction() {
  if (getTransactionReferenceType() !== "delivery") {
    return null;
  }

  return deliveriesCache.find((item) => String(item.id) === String(transactionReferenceSelect.value));
}

function getSelectedReceiptForDelivery() {
  return receiptsCache.find(
    (item) => String(item.id) === String(deliveryReceiptSelect.value)
  );
}

function renderTransactionPreview() {
  const referenceType = getTransactionReferenceType();
  const receipt = getSelectedReceiptForTransaction();
  const delivery = getSelectedDeliveryForTransaction();
  const openingDebt = getSelectedOpeningDebtForTransaction();

  if (!receipt && !delivery && !openingDebt) {
    transactionPartnerEl.textContent = "-";
    transactionTargetEl.textContent = currency.format(0);
    transactionStatusEl.textContent = "Neachitat";
    return;
  }

  const direction = transactionDirectionSelect.value;

  if (referenceType === "delivery" && delivery) {
    const targetAmount = Number(delivery.contractPrice || 0) * Number(delivery.deliveredQuantity || 0);
    transactionPartnerEl.textContent = delivery.customer || "-";
    transactionTargetEl.textContent = currency.format(targetAmount);
    transactionStatusEl.textContent =
      direction === "collection" ? delivery.collectionStatus || "Neincasat" : "N/A";
    return;
  }

  if (referenceType === "opening-debt" && openingDebt) {
    transactionPartnerEl.textContent = openingDebt.partner || "-";
    transactionTargetEl.textContent = currency.format(Number(openingDebt.amount || 0));
    transactionStatusEl.textContent = openingDebt.status || "Neachitat";
    return;
  }

  const targetAmount =
    direction === "collection"
      ? Number(receipt.preliminaryMerchandiseValue || receipt.preliminaryPayableAmount || 0)
      : Number(receipt.preliminaryPayableAmount || 0);

  transactionPartnerEl.textContent = receipt.supplier || "-";
  transactionTargetEl.textContent = currency.format(targetAmount);
  transactionStatusEl.textContent = receipt.paymentStatus || "Neachitat";
}

function renderDeliveryPreview() {
  const receipt = getSelectedReceiptForDelivery();

  if (!receipt) {
    deliveryLocationEl.textContent = "-";
    deliveryAvailableEl.textContent = formatNumber(0);
    deliveryStatusPreviewEl.textContent = "Nelivrat";
    return;
  }

  const availableQuantity = Number(
    receipt.availableQuantity ??
      receipt.finalNetQuantity ??
      receipt.provisionalNetQuantity ??
      receipt.quantity ??
      0
  );

  deliveryLocationEl.textContent = receipt.location || "-";
  deliveryAvailableEl.textContent = formatNumber(availableQuantity);
  deliveryStatusPreviewEl.textContent = receipt.deliveryStatus || "Nelivrat";

  if (!deliveryQuantityInput.value) {
    deliveryQuantityInput.value = availableQuantity > 0 ? String(availableQuantity) : "";
  }
}

async function createTransaction(formData) {
  const referenceType =
    formData.get("referenceType") === "delivery"
      ? "delivery"
      : formData.get("referenceType") === "opening-debt"
        ? "opening-debt"
        : "receipt";
  const referenceId = formData.get("referenceId");
  const payload = {
    referenceType,
    receiptId: referenceType === "receipt" ? referenceId : "",
    deliveryId: referenceType === "delivery" ? referenceId : "",
    openingDebtId: referenceType === "opening-debt" ? referenceId : "",
    direction: formData.get("direction"),
    paymentType: formData.get("paymentType"),
    amount: formData.get("amount"),
    note: formData.get("note")
  };

  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Eroare la salvarea tranzactiei.");
  }
}

async function createDelivery(formData) {
  const payload = Object.fromEntries(formData.entries());
  const response = await fetch("/api/deliveries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Eroare la salvarea livrarii.");
  }
}

async function createComplaint(formData) {
  const payload = Object.fromEntries(formData.entries());
  const response = await fetch("/api/complaints", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Eroare la salvarea reclamatiei.");
  }
}

async function updateDeliveryEntry(id, payload) {
  const response = await fetch(`/api/deliveries/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Nu am putut actualiza livrarea.");
  }
}

async function updateComplaintEntry(id, payload) {
  const response = await fetch(`/api/complaints/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Nu am putut actualiza reclamatia.");
  }
}

async function updateProcessingEntry(id, payload) {
  const response = await fetch(`/api/processings/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Nu am putut actualiza procesarea.");
  }
}

async function updateTransactionEntry(id, payload) {
  const response = await fetch(`/api/transactions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Nu am putut actualiza tranzactia.");
  }
}

async function unlockLockedUsername(username) {
  const response = await fetch(`/api/security/lockouts/${encodeURIComponent(username)}/unlock`, {
    method: "POST"
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Nu am putut debloca utilizatorul.");
  }
}

async function updateStatus(id, status) {
  const changeReason = window.prompt("Introdu mentiunea pentru modificarea statusului:");
  if (!changeReason || !changeReason.trim()) {
    throw new Error("Mentiunea este obligatorie pentru modificare.");
  }

  await fetch(`/api/receipts/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status, changeReason, changedBy: "dashboard" })
  });
}

async function createConfigEntry(entity, payload) {
  const response = await fetch(`/api/config/${entity}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Nu am putut salva: ${entityLabels[entity] || entity}`);
  }
}

async function updateConfigEntry(entity, id, payload) {
  const response = await fetch(`/api/config/${entity}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Nu am putut actualiza: ${entityLabels[entity] || entity}`);
  }
}

async function saveSystemSettings(payload) {
  const response = await fetch("/api/system-settings", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Nu am putut salva setarile sistemului.");
  }
}

function requestChangeReason(message) {
  const value = window.prompt(message);
  if (!value || !value.trim()) {
    throw new Error("Mentiunea este obligatorie pentru modificare.");
  }

  return value.trim();
}

function getEntityItem(entity, id) {
  return currentConfig[entity].find((item) => String(item.id) === String(id));
}

document.querySelectorAll(".view-tab").forEach((button) => {
  button.addEventListener("click", () => setView(button.dataset.view));
});

productSelect.addEventListener("change", () => {
  humidityInput.value = "";
  impurityInput.value = "";
  syncUnitByProduct();
});
supplierSelect.addEventListener("change", renderReceiptEstimate);
humidityInput.addEventListener("input", renderReceiptEstimate);
impurityInput.addEventListener("input", renderReceiptEstimate);
formEl.elements.quantity.addEventListener("input", renderReceiptEstimate);
formEl.elements.price.addEventListener("input", renderReceiptEstimate);
receiptStatusFilterEl.addEventListener("change", () => renderReceipts(receiptsCache));
receiptProductFilterEl.addEventListener("change", () => renderReceipts(receiptsCache));
processingTypeFilterEl.addEventListener("change", () => renderProcessings(processingsCache));
processingReceiptFilterEl.addEventListener("change", () => renderProcessings(processingsCache));
processingReceiptSelect.addEventListener("change", renderProcessingEstimate);
processedQuantityInput.addEventListener("input", renderProcessingEstimate);
confirmedWasteInput.addEventListener("input", renderProcessingEstimate);
transactionReferenceTypeSelect.addEventListener("change", () => {
  renderTransactionReferenceOptions();
  syncTransactionDirection();
  renderTransactionPreview();
});
transactionReferenceSelect.addEventListener("change", () => {
  syncTransactionDirection();
  renderTransactionPreview();
});
openReceiptStatusFilterEl.addEventListener("change", renderOpenJournal);
openDeliveryStatusFilterEl.addEventListener("change", renderOpenJournal);
openPartnerFilterEl.addEventListener("input", renderOpenJournal);
deliveryReceiptSelect.addEventListener("change", () => {
  deliveryQuantityInput.value = "";
  renderDeliveryPreview();
});
addOpeningStockButton.addEventListener("click", () => {
  const product = currentConfig.products.find(
    (item) => String(item.id) === String(openingStockProductEl.value)
  );
  const location = currentConfig.storageLocations.find(
    (item) => String(item.id) === String(openingStockLocationEl.value)
  );
  const quantity = Number(openingStockQuantityEl.value || 0);

  if (!product || !location || quantity <= 0) {
    window.alert("Completeaza produsul, locatia si cantitatea pentru stocul initial.");
    return;
  }

  openingStockDraft.push({
    product: product.name,
    productId: product.id,
    location: location.name,
    locationId: location.id,
    quantity,
    unit: product.unit
  });
  openingStockQuantityEl.value = "";
  renderOpeningDrafts();
});
addOpeningDebtButton.addEventListener("click", () => {
  const partner = currentConfig.partners.find(
    (item) => String(item.id) === String(openingDebtPartnerEl.value)
  );
  const amount = Number(openingDebtAmountEl.value || 0);

  if (!partner || amount <= 0) {
    window.alert("Completeaza partenerul si suma pentru datoria initiala.");
    return;
  }

  openingDebtDraft.push({
    partner: partner.name,
    partnerId: partner.id,
    direction: openingDebtDirectionEl.value,
    amount,
    note: openingDebtNoteEl.value || "",
    status: openingDebtDirectionEl.value === "collection" ? "Neincasat" : "Neachitat"
  });
  openingDebtAmountEl.value = "";
  openingDebtNoteEl.value = "";
  renderOpeningDrafts();
});

formEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  messageEl.textContent = "Se salveaza...";
  const submitMode = getFormSubmitMode(formEl);
  const formData = new FormData(formEl);
  const validationError = validateReceiptForm(formData);

  if (validationError) {
    messageEl.textContent = validationError;
    return;
  }

  try {
    await createReceipt(formData);
    resetReceiptForm(submitMode);
    messageEl.textContent = "Receptia a fost salvata.";
    await Promise.all([
      loadReceipts(),
      loadProcessings(),
      loadStocks(),
      loadTransactions(),
      loadDeliveries(),
      loadComplaints(),
      loadAuditLogs(),
      loadDailyReport()
    ]);
  } catch (error) {
    messageEl.textContent = error.message;
  }
});

openingDocumentFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  openingDocumentMessageEl.textContent = "Se salveaza...";

  try {
    await createOpeningDocument(new FormData(openingDocumentFormEl));
    openingStockDraft = [];
    openingDebtDraft = [];
    renderOpeningDrafts();
    openingDocumentFormEl.reset();
    openingDocumentDateEl.value = new Date().toISOString().slice(0, 10);
    openingDocumentMessageEl.textContent = "Documentul de sold initial a fost salvat.";
    await Promise.all([loadOpeningDocuments(), loadStocks(), loadAuditLogs()]);
    if (currentConfig) {
      renderReceiptSelectors(currentConfig);
    }
  } catch (error) {
    openingDocumentMessageEl.textContent = error.message;
  }
});

processingFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  processingMessageEl.textContent = "Se salveaza...";

  try {
    await createProcessing(new FormData(processingFormEl));
    processingFormEl.reset();
    renderProcessingEstimate();
    processingMessageEl.textContent = "Procesarea a fost salvata.";
    await Promise.all([
      loadReceipts(),
      loadProcessings(),
      loadStocks(),
      loadTransactions(),
      loadDeliveries(),
      loadComplaints(),
      loadAuditLogs(),
      loadDailyReport()
    ]);
  } catch (error) {
    processingMessageEl.textContent = error.message;
  }
});

transactionFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  transactionMessageEl.textContent = "Se salveaza...";
  const submitMode = getFormSubmitMode(transactionFormEl);
  const formData = new FormData(transactionFormEl);
  const validationError = validateTransactionForm(formData);

  if (validationError) {
    transactionMessageEl.textContent = validationError;
    return;
  }

  try {
    await createTransaction(formData);
    resetTransactionForm(submitMode);
    transactionMessageEl.textContent = "Tranzactia a fost salvata.";
    await Promise.all([
      loadOpeningDocuments(),
      loadReceipts(),
      loadTransactions(),
      loadDailyReport(),
      loadConfig(),
      loadAuditLogs()
    ]);
  } catch (error) {
    transactionMessageEl.textContent = error.message;
  }
});

deliveryFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  deliveryMessageEl.textContent = "Se salveaza...";
  const submitMode = getFormSubmitMode(deliveryFormEl);
  const formData = new FormData(deliveryFormEl);
  const validationError = validateDeliveryForm(formData);

  if (validationError) {
    deliveryMessageEl.textContent = validationError;
    return;
  }

  try {
    await createDelivery(formData);
    resetDeliveryForm(submitMode);
    deliveryMessageEl.textContent = "Livrarea a fost salvata.";
    await Promise.all([
      loadReceipts(),
      loadStocks(),
      loadDeliveries(),
      loadComplaints(),
      loadAuditLogs(),
      loadDailyReport(),
      loadConfig()
    ]);
  } catch (error) {
    deliveryMessageEl.textContent = error.message;
  }
});

receiptSaveNewButton.addEventListener("click", () => {
  formEl.dataset.submitMode = "save-new";
  formEl.requestSubmit();
});

transactionSaveNewButton.addEventListener("click", () => {
  transactionFormEl.dataset.submitMode = "save-new";
  transactionFormEl.requestSubmit();
});

deliverySaveNewButton.addEventListener("click", () => {
  deliveryFormEl.dataset.submitMode = "save-new";
  deliveryFormEl.requestSubmit();
});

complaintFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  complaintMessageEl.textContent = "Se salveaza...";

  try {
    await createComplaint(new FormData(complaintFormEl));
    complaintFormEl.reset();
    complaintMessageEl.textContent = "Reclamatia a fost salvata.";
    await Promise.all([loadReceipts(), loadDeliveries(), loadComplaints(), loadDailyReport(), loadConfig(), loadAuditLogs()]);
  } catch (error) {
    complaintMessageEl.textContent = error.message;
  }
});

deliveriesBodyEl.addEventListener("change", async (event) => {
  const target = event.target;
  if (!target.matches(".delivery-status")) {
    return;
  }

  try {
    const changeReason = requestChangeReason("Introdu mentiunea pentru modificarea livrarii:");
    await updateDeliveryEntry(target.dataset.id, {
      status: target.value,
      changeReason,
      changedBy: "dashboard"
    });
    await Promise.all([loadDeliveries(), loadReceipts(), loadAuditLogs(), loadDailyReport()]);
  } catch (error) {
    window.alert(error.message);
    await loadDeliveries();
  }
});

complaintsBodyEl.addEventListener("change", async (event) => {
  const target = event.target;
  if (!target.matches(".complaint-status")) {
    return;
  }

  try {
    const changeReason = requestChangeReason("Introdu mentiunea pentru modificarea reclamatiei:");
    await updateComplaintEntry(target.dataset.id, {
      status: target.value,
      changeReason,
      changedBy: "dashboard"
    });
    await Promise.all([loadComplaints(), loadDeliveries(), loadReceipts(), loadAuditLogs(), loadDailyReport()]);
  } catch (error) {
    window.alert(error.message);
    await loadComplaints();
  }
});

processingsBodyEl.addEventListener("change", async (event) => {
  const target = event.target;
  if (!target.matches(".processing-status")) {
    return;
  }

  try {
    const changeReason = requestChangeReason("Introdu mentiunea pentru modificarea procesarii:");
    await updateProcessingEntry(target.dataset.id, {
      status: target.value,
      changeReason,
      changedBy: "dashboard"
    });
    await Promise.all([loadProcessings(), loadAuditLogs(), loadDailyReport()]);
  } catch (error) {
    window.alert(error.message);
    await loadProcessings();
  }
});

transactionsBodyEl.addEventListener("change", async (event) => {
  const target = event.target;
  if (!target.matches(".transaction-status")) {
    return;
  }

  try {
    const changeReason = requestChangeReason("Introdu mentiunea pentru modificarea tranzactiei:");
    await updateTransactionEntry(target.dataset.id, {
      status: target.value,
      changeReason,
      changedBy: "dashboard"
    });
    await Promise.all([loadTransactions(), loadAuditLogs(), loadDailyReport()]);
  } catch (error) {
    window.alert(error.message);
    await loadTransactions();
  }
});

dailyReportFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  await loadDailyReport();
});

bodyEl.addEventListener("change", async (event) => {
  const target = event.target;
  if (!target.matches(".status")) {
    return;
  }

  try {
    await updateStatus(target.dataset.id, target.value);
    await Promise.all([loadReceipts(), loadAuditLogs()]);
  } catch (error) {
    window.alert(error.message);
    await loadReceipts();
  }
});

document.querySelectorAll("[data-entity-form]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const entity = form.dataset.entityForm;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      await createConfigEntry(entity, payload);
      form.reset();
      if (entity === "products") {
        form.elements.unit.value = "tone";
        form.elements.active.value = "true";
      }
      await loadConfig();
    } catch (error) {
      window.alert(error.message);
    }
  });
});

document.querySelectorAll(".list-block").forEach((container) => {
  container.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) {
      return;
    }

    const { action, entity, id } = target.dataset;
    const item = getEntityItem(entity, id);
    if (!item) {
      return;
    }

    try {
      if (action === "edit") {
        openEditor(entity, item);
      }

      if (action === "toggle" && Object.prototype.hasOwnProperty.call(item, "active")) {
        const changeReason = requestChangeReason("Introdu mentiunea pentru activare/dezactivare:");
        await updateConfigEntry(entity, id, {
          ...item,
          active: !item.active,
          changeReason,
          changedBy: "dashboard"
        });
      }

      await Promise.all([loadConfig(), loadAuditLogs()]);
    } catch (error) {
      window.alert(error.message);
    }
  });
});

if (lockoutsBodyEl) {
  lockoutsBodyEl.addEventListener("click", async (event) => {
    const target = event.target.closest(".unlock-user-button");
    if (!target) {
      return;
    }

    try {
      await unlockLockedUsername(target.dataset.username);
      await Promise.all([loadLockouts(), loadAuditLogs()]);
    } catch (error) {
      window.alert(error.message);
    }
  });
}

editorForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!currentEditor) {
    return;
  }

  editorMessageEl.textContent = "Se salveaza...";
  const payload = Object.fromEntries(new FormData(editorForm).entries());
  const currentItem = getEntityItem(currentEditor.entity, currentEditor.id);

  try {
    const changeReason = requestChangeReason("Introdu mentiunea pentru modificare:");
    await updateConfigEntry(currentEditor.entity, currentEditor.id, {
      ...currentItem,
      ...payload,
      changeReason,
      changedBy: "dashboard"
    });
    editorMessageEl.textContent = "Modificarile au fost salvate.";
    await Promise.all([loadConfig(), loadAuditLogs()]);
  } catch (error) {
    editorMessageEl.textContent = error.message;
  }
});

editorCancelButton.addEventListener("click", resetEditor);

systemSettingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  settingsMessageEl.textContent = "Se salveaza...";

  try {
    const changeReason = requestChangeReason("Introdu mentiunea pentru modificarea setarilor:");
    await saveSystemSettings({
      ...Object.fromEntries(new FormData(systemSettingsForm).entries()),
      changeReason,
      changedBy: "dashboard"
    });
    settingsMessageEl.textContent = "Setarile au fost actualizate.";
    await Promise.all([loadConfig(), loadAuditLogs()]);
  } catch (error) {
    settingsMessageEl.textContent = error.message;
  }
});

loginFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginMessageEl.textContent = "Se verifica accesul...";

  try {
    const user = await login(
      loginFormEl.elements.username.value,
      loginFormEl.elements.password.value
    );
    setCurrentUser(user);
    showDashboardShell();
    loginMessageEl.textContent = "";
    await loadDashboard();
  } catch (error) {
    loginMessageEl.textContent = error.message;
  }
});

logoutButtonEl.addEventListener("click", async () => {
  await logout();
  setCurrentUser(null);
  showLoginScreen("Sesiunea a fost inchisa.");
});

changePasswordButtonEl.addEventListener("click", () => {
  togglePasswordPanel(passwordPanelEl.hidden);
});

cancelPasswordButtonEl.addEventListener("click", () => {
  togglePasswordPanel(false);
});

changePasswordFormEl.addEventListener("submit", async (event) => {
  event.preventDefault();
  changePasswordMessageEl.textContent = "Se salveaza...";

  try {
    const formData = new FormData(changePasswordFormEl);
    const user = await changePassword({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword")
    });
    setCurrentUser(user || currentSessionUser);
    changePasswordMessageEl.textContent = "Parola a fost schimbata.";
    togglePasswordPanel(false);
  } catch (error) {
    changePasswordMessageEl.textContent = error.message;
  }
});

async function bootstrap() {
  resetEditor();
  togglePasswordPanel(false);

  try {
    const user = await loadSession();
    if (!user) {
      showLoginScreen();
      return;
    }

    setCurrentUser(user);
    showDashboardShell();
    await loadDashboard();
  } catch (error) {
    console.error("Bootstrap failed:", error.message);
    setCurrentUser(null);
    showLoginScreen("Nu am putut initializa sesiunea.");
  }
}

bootstrap();
