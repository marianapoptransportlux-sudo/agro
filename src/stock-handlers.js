const { getStockSummary } = require("./storage");

function sendJson(res, statusCode, payload) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function getStockSummaryHandler(_req, res) {
  try {
    const summary = await getStockSummary();
    return sendJson(res, 200, summary);
  } catch (error) {
    console.error("Failed to load stock summary:", error.message);
    return sendJson(res, 500, { error: "Nu am putut incarca stocurile." });
  }
}

module.exports = {
  getStockSummaryHandler
};
