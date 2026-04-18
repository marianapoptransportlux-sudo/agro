const { updateReceiptStatusHandler } = require("../../../src/receipt-handlers");

module.exports = async (req, res) => {
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const id = req.query?.id;
  return updateReceiptStatusHandler(req, res, id);
};
