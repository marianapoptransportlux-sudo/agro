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

function sameDay(value, dateValue) {
  return String(value || "").slice(0, 10) === String(dateValue || "").trim();
}

function getOpenDocuments(receipts, deliveries) {
  return {
    receipts: receipts.filter((item) => !["Inchis", "Anulat", "Finalizata"].includes(String(item.status || ""))),
    deliveries: deliveries.filter((item) => !["Inchisa", "Anulata", "Finalizata"].includes(String(item.status || "")))
  };
}

function getOutstandingFinancials(receipts, deliveries, openingDebtItems) {
  const receiptPayables = receipts
    .map((item) => {
      const targetAmount = Number(item.preliminaryPayableAmount || 0);
      const paidAmount = Number(item.paidAmount || 0);
      const outstandingAmount = Math.max(targetAmount - paidAmount, 0);
      return {
        id: item.id,
        type: "receipt",
        partner: item.supplier || "-",
        product: item.product || "-",
        status: item.paymentStatus || (paidAmount <= 0 ? "Neachitat" : outstandingAmount > 0 ? "Partial" : "Achitat"),
        targetAmount,
        settledAmount: paidAmount,
        outstandingAmount
      };
    })
    .filter((item) => item.outstandingAmount > 0);

  const deliveryCollections = deliveries
    .map((item) => {
      const targetAmount = Number(item.contractPrice || 0) * Number(item.deliveredQuantity || 0);
      const collectedAmount = Number(item.collectedAmount || 0);
      const outstandingAmount = Math.max(targetAmount - collectedAmount, 0);
      return {
        id: item.id,
        type: "delivery",
        partner: item.customer || "-",
        product: item.product || "-",
        status:
          item.collectionStatus ||
          (collectedAmount <= 0 ? "Neincasat" : outstandingAmount > 0 ? "Partial incasat" : "Incasat"),
        targetAmount,
        settledAmount: collectedAmount,
        outstandingAmount
      };
    })
    .filter((item) => item.outstandingAmount > 0);

  const openingDebts = openingDebtItems
    .map((item) => {
      const targetAmount = Number(item.amount || 0);
      const settledAmount = Number(item.settledAmount || 0);
      const outstandingAmount = Math.max(targetAmount - settledAmount, 0);
      return {
        id: item.openingDebtId,
        type: item.direction === "collection" ? "opening-collection" : "opening-payment",
        partner: item.partner || "-",
        product: "Sold initial",
        status: item.status || (item.direction === "collection" ? "Neincasat" : "Neachitat"),
        targetAmount,
        settledAmount,
        outstandingAmount
      };
    })
    .filter((item) => item.outstandingAmount > 0);

  const supplierPayables = [
    ...receiptPayables,
    ...openingDebts.filter((item) => item.type === "opening-payment")
  ].sort((left, right) => right.outstandingAmount - left.outstandingAmount);

  const customerReceivables = [
    ...deliveryCollections,
    ...openingDebts.filter((item) => item.type === "opening-collection")
  ].sort((left, right) => right.outstandingAmount - left.outstandingAmount);

  return {
    supplierPayables,
    customerReceivables,
    totalPayables: supplierPayables.reduce((sum, item) => sum + Number(item.outstandingAmount || 0), 0),
    totalReceivables: customerReceivables.reduce((sum, item) => sum + Number(item.outstandingAmount || 0), 0)
  };
}

function getOperationalProblems(report, receipts, deliveries, complaints, auditLogs, openDocuments, financials, dateValue) {
  const receiptsWithoutPrice = receipts.filter((item) => Number(item.price || 0) <= 0);
  const qualityDeviationReceipts = receipts.filter(
    (item) => Number(item.excessHumidity || 0) > 0 || Number(item.excessImpurity || 0) > 0
  );
  const deliveriesWithoutInvoice = deliveries.filter((item) => !String(item.invoiceNumber || "").trim());
  const deliveriesWithoutContractPrice = deliveries.filter((item) => Number(item.contractPrice || 0) <= 0);
  const openComplaints = complaints.filter((item) => String(item.status || "").toLowerCase() === "deschisa");
  const importantChangesToday = auditLogs.filter(
    (item) => sameDay(item.createdAt, dateValue) && item.action !== "create" && item.entityType !== "auth"
  );
  const negativeCashGap = Math.max(financials.totalPayables - financials.totalReceivables, 0);

  return {
    report,
    receiptsWithoutPrice,
    qualityDeviationReceipts,
    deliveriesWithoutInvoice,
    deliveriesWithoutContractPrice,
    openComplaints,
    importantChangesToday,
    openReceipts: openDocuments.receipts,
    openDeliveries: openDocuments.deliveries,
    supplierPayables: financials.supplierPayables,
    customerReceivables: financials.customerReceivables,
    totalOpenDocuments: openDocuments.receipts.length + openDocuments.deliveries.length,
    negativeCashGap,
    severeCount:
      openComplaints.length +
      receiptsWithoutPrice.length +
      deliveriesWithoutInvoice.length +
      deliveriesWithoutContractPrice.length
  };
}

function getTopExceptionBuckets(problems, auditLogs, dateValue) {
  return [
    { label: "Receptii fara pret", count: problems.receiptsWithoutPrice.length },
    { label: "Receptii cu abatere calitate", count: problems.qualityDeviationReceipts.length },
    { label: "Livrari fara factura", count: problems.deliveriesWithoutInvoice.length },
    { label: "Livrari fara pret contract", count: problems.deliveriesWithoutContractPrice.length },
    { label: "Reclamatii deschise", count: problems.openComplaints.length },
    {
      label: "Modificari operationale azi",
      count: auditLogs.filter(
        (item) => sameDay(item.createdAt, dateValue) && item.action !== "create" && item.entityType !== "auth"
      ).length
    }
  ]
    .filter((item) => item.count > 0)
    .sort((left, right) => right.count - left.count)
    .slice(0, 5);
}

function getExecutiveStatus(snapshot) {
  const criticalSignals =
    snapshot.problems.openComplaints.length +
    snapshot.problems.deliveriesWithoutInvoice.length +
    snapshot.problems.receiptsWithoutPrice.length;
  const attentionSignals =
    snapshot.problems.qualityDeviationReceipts.length +
    snapshot.problems.totalOpenDocuments +
    snapshot.problems.importantChangesToday.length;

  if (criticalSignals >= 5 || snapshot.financials.totalPayables > snapshot.financials.totalReceivables * 1.5) {
    return {
      label: "CRITIC",
      reason: "presiune pe cash sau blocaje comerciale"
    };
  }

  if (criticalSignals > 0 || attentionSignals >= 4) {
    return {
      label: "ATENTIE",
      reason: "sunt exceptii care cer interventie"
    };
  }

  return {
    label: "STABIL",
    reason: "ziua este sub control operational"
  };
}

function getPriorityActions(snapshot) {
  const actions = [];

  if (snapshot.problems.receiptsWithoutPrice.length) {
    actions.push(
      `Fixeaza pretul pentru ${snapshot.problems.receiptsWithoutPrice.length} receptii ca sa inchizi expunerea la plata.`
    );
  }

  if (snapshot.problems.deliveriesWithoutInvoice.length) {
    actions.push(
      `Emite factura pentru ${snapshot.problems.deliveriesWithoutInvoice.length} livrari ca sa nu blochezi incasarile.`
    );
  }

  if (snapshot.problems.openComplaints.length) {
    actions.push(
      `Rezolva ${snapshot.problems.openComplaints.length} reclamatii deschise inainte sa afecteze relatia comerciala.`
    );
  }

  if (snapshot.financials.totalPayables > snapshot.financials.totalReceivables) {
    actions.push(
      `Prioritizeaza colectarea restantelor: incasarile acopera mai putin decat platile restante cu ${formatCurrency(
        snapshot.problems.negativeCashGap
      )}.`
    );
  }

  if (snapshot.problems.totalOpenDocuments) {
    actions.push(
      `Inchide ${snapshot.problems.totalOpenDocuments} documente ramase deschise pentru a evita corectii maine.`
    );
  }

  if (snapshot.problems.qualityDeviationReceipts.length) {
    actions.push(
      `Verifica loturile cu abatere de calitate: ${snapshot.problems.qualityDeviationReceipts.length} receptii au penalizari potentiale.`
    );
  }

  if (!actions.length) {
    actions.push("Nicio actiune urgenta. Urmareste doar executia normala a zilei urmatoare.");
  }

  return actions.slice(0, 4);
}

function buildExecutiveSummaryMessage(snapshot) {
  const status = getExecutiveStatus(snapshot);
  const grossQuantity = Number(snapshot.report.summary.grossQuantity || 0);
  const provisionalNetQuantity = Number(snapshot.report.summary.provisionalNetQuantity || 0);
  const yieldPercent = grossQuantity > 0 ? (provisionalNetQuantity / grossQuantity) * 100 : 0;

  return [
    `Inchidere zi ${snapshot.report.date} | STATUS ${status.label}`,
    `Concluzie: ${status.reason}.`,
    `KPI: receptii ${snapshot.report.summary.receiptsCount} | net ${formatNumber(provisionalNetQuantity)} t | randament ${formatNumber(yieldPercent)}% | livrat ${formatNumber(snapshot.report.summary.deliveredQuantity || 0)} t`,
    `Cash: plati azi ${formatCurrency(snapshot.report.summary.paymentsTotal || 0)} | incasari azi ${formatCurrency(snapshot.report.summary.collectionsTotal || 0)}`,
    `Expunere: plati restante ${formatCurrency(snapshot.financials.totalPayables)} | incasari restante ${formatCurrency(snapshot.financials.totalReceivables)} | stoc ${formatNumber(snapshot.report.summary.stockTotal)} t`
  ].join("\n");
}

function buildPriorityActionsMessage(snapshot) {
  const actions = getPriorityActions(snapshot);
  return ["Prioritati manager pentru urmatoarea tura:", ...actions.map((item, index) => `${index + 1}. ${item}`)].join(
    "\n"
  );
}

function buildOperationalFocusMessage(snapshot) {
  const lines = [
    "Probleme si blocaje:",
    `Receptii fara pret: ${snapshot.problems.receiptsWithoutPrice.length}`,
    `Abateri calitative: ${snapshot.problems.qualityDeviationReceipts.length}`,
    `Livrari fara factura: ${snapshot.problems.deliveriesWithoutInvoice.length}`,
    `Livrari fara pret contract: ${snapshot.problems.deliveriesWithoutContractPrice.length}`,
    `Documente deschise: ${snapshot.problems.totalOpenDocuments}`,
    `Reclamatii deschise: ${snapshot.problems.openComplaints.length}`
  ];

  if (snapshot.problems.receiptsWithoutPrice[0]) {
    const item = snapshot.problems.receiptsWithoutPrice[0];
    lines.push(`Exemplu critic: receptie #${item.id} ${item.supplier} / ${item.product} fara pret.`);
  }

  if (snapshot.problems.deliveriesWithoutInvoice[0]) {
    const item = snapshot.problems.deliveriesWithoutInvoice[0];
    lines.push(`Exemplu comercial: livrare #${item.id} ${item.customer || "-"} fara factura.`);
  }

  return lines.join("\n");
}

function buildFinancialExposureMessage(snapshot) {
  const payables = snapshot.financials.supplierPayables.slice(0, 3);
  const receivables = snapshot.financials.customerReceivables.slice(0, 3);

  if (!payables.length && !receivables.length) {
    return "Expunere financiara: nu exista restante semnificative la plata sau incasare.";
  }

  return [
    `Expunere financiara: gap net ${formatCurrency(snapshot.financials.totalReceivables - snapshot.financials.totalPayables)}`,
    `Top plati restante: ${payables.length ? payables.map((item) => `${item.partner} ${formatCurrency(item.outstandingAmount)}`).join(" | ") : "niciuna"}`,
    `Top incasari restante: ${receivables.length ? receivables.map((item) => `${item.partner} ${formatCurrency(item.outstandingAmount)}`).join(" | ") : "niciuna"}`
  ].join("\n");
}

function buildComplaintsMessage(snapshot) {
  const openComplaints = snapshot.problems.openComplaints.slice(0, 5);

  if (!openComplaints.length) {
    return "Reclamatii: nicio reclamatie deschisa.";
  }

  return [
    "Reclamatii deschise:",
    ...openComplaints.map(
      (item) =>
        `#${item.id} ${item.product} | ${item.customer || "-"} | ${formatNumber(item.contestedQuantity)} t | ${item.complaintType}`
    )
  ].join("\n");
}

function buildOpenDocumentsMessage(snapshot) {
  const openReceipts = snapshot.openDocuments.receipts.slice(0, 4);
  const openDeliveries = snapshot.openDocuments.deliveries.slice(0, 4);

  if (!openReceipts.length && !openDeliveries.length) {
    return "Documente neinchise: niciun document ramas deschis.";
  }

  return [
    "Documente neinchise:",
    ...openReceipts.map(
      (item) =>
        `R#${item.id} ${item.product} | ${item.supplier} | ${item.status} | ${formatNumber(item.provisionalNetQuantity || item.quantity)} ${item.unit}`
    ),
    ...openDeliveries.map(
      (item) =>
        `L#${item.id} ${item.product} | ${item.customer || "-"} | ${item.status} | ${formatNumber(item.deliveredQuantity)} t`
    )
  ].join("\n");
}

function buildTopExceptionsMessage(snapshot) {
  if (!snapshot.exceptionBuckets.length) {
    return "Top exceptii: nicio exceptie relevanta azi.";
  }

  return [
    "Top exceptii azi:",
    ...snapshot.exceptionBuckets.map((item, index) => `${index + 1}. ${item.label}: ${item.count}`)
  ].join("\n");
}

function buildRecentChangesMessage(snapshot) {
  const importantChanges = snapshot.auditLogs
    .filter((item) => sameDay(item.createdAt, snapshot.report.date) && item.action !== "create")
    .slice(0, 6);

  if (!importantChanges.length) {
    return "Modificari importante recente: niciuna.";
  }

  return [
    "Modificari importante recente:",
    ...importantChanges.map((item) => {
      const stamp = String(item.createdAt || "").replace("T", " ").slice(0, 16);
      return `${stamp} | ${item.entityType} #${item.entityId || "-"} | ${item.action} | ${item.reason}`;
    })
  ].join("\n");
}

function getManagementSnapshot({ report, receipts, deliveries, complaints, auditLogs, openingDebtItems, dateValue }) {
  const openDocuments = getOpenDocuments(receipts, deliveries);
  const financials = getOutstandingFinancials(receipts, deliveries, openingDebtItems);
  const problems = getOperationalProblems(
    report,
    receipts,
    deliveries,
    complaints,
    auditLogs,
    openDocuments,
    financials,
    dateValue || report.date
  );
  const exceptionBuckets = getTopExceptionBuckets(problems, auditLogs, dateValue || report.date);

  return {
    report,
    receipts,
    deliveries,
    complaints,
    auditLogs,
    openingDebtItems,
    openDocuments,
    financials,
    problems,
    exceptionBuckets
  };
}

function buildManagementTelegramReportMessages(snapshot) {
  return [
    buildExecutiveSummaryMessage(snapshot),
    buildPriorityActionsMessage(snapshot),
    buildOperationalFocusMessage(snapshot),
    buildFinancialExposureMessage(snapshot),
    buildComplaintsMessage(snapshot),
    buildOpenDocumentsMessage(snapshot),
    buildTopExceptionsMessage(snapshot),
    buildRecentChangesMessage(snapshot)
  ];
}

function buildManagementDetailMessages(snapshot) {
  return [
    buildOperationalFocusMessage(snapshot),
    buildFinancialExposureMessage(snapshot),
    buildComplaintsMessage(snapshot),
    buildOpenDocumentsMessage(snapshot),
    buildTopExceptionsMessage(snapshot),
    buildRecentChangesMessage(snapshot)
  ];
}

module.exports = {
  buildManagementDetailMessages,
  buildManagementTelegramReportMessages,
  formatCurrency,
  formatNumber,
  getManagementSnapshot
};
