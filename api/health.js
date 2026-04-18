const { healthHandler } = require("../src/receipt-handlers");

module.exports = async (req, res) => {
  return healthHandler(req, res);
};
