const {
  createReceiptHandler,
  listReceiptsHandler
} = require("../src/receipt-handlers");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    return listReceiptsHandler(req, res);
  }

  if (req.method === "POST") {
    return createReceiptHandler(req, res);
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "Method not allowed." });
};
