const test = require("node:test");
const assert = require("node:assert/strict");

const { findTariffValue } = require("../src/receipt-handlers");

const baseTariffs = [
  {
    service: "Curatire",
    product: "General",
    partner: "General",
    fiscalProfile: "General",
    value: 100,
    validFrom: "2020-01-01",
    active: true
  },
  {
    service: "Curatire",
    product: "Grau",
    partner: "General",
    fiscalProfile: "General",
    value: 120,
    validFrom: "2020-01-01",
    active: true
  },
  {
    service: "Curatire",
    product: "Grau",
    partner: "Agro Nord",
    fiscalProfile: "General",
    value: 140,
    validFrom: "2020-01-01",
    active: true
  }
];

test("picks partner+product specific tariff over product-only and general", () => {
  const value = findTariffValue({
    tariffs: baseTariffs,
    service: "curatire",
    productName: "Grau",
    partnerName: "Agro Nord",
    fiscalProfileName: "General",
    referenceDate: "2026-04-20"
  });
  assert.equal(value, 140);
});

test("falls back to product-only tariff when no partner match", () => {
  const value = findTariffValue({
    tariffs: baseTariffs,
    service: "curatire",
    productName: "Grau",
    partnerName: "Neconoscut",
    fiscalProfileName: "General",
    referenceDate: "2026-04-20"
  });
  assert.equal(value, 120);
});

test("falls back to general tariff when nothing specific matches", () => {
  const value = findTariffValue({
    tariffs: baseTariffs,
    service: "curatire",
    productName: "Floarea soarelui",
    partnerName: "Neconoscut",
    fiscalProfileName: "General",
    referenceDate: "2026-04-20"
  });
  assert.equal(value, 100);
});

test("ignores tariffs with validFrom in the future", () => {
  const value = findTariffValue({
    tariffs: [
      ...baseTariffs,
      {
        service: "Curatire",
        product: "Grau",
        partner: "Agro Nord",
        fiscalProfile: "General",
        value: 999,
        validFrom: "2099-01-01",
        active: true
      }
    ],
    service: "curatire",
    productName: "Grau",
    partnerName: "Agro Nord",
    fiscalProfileName: "General",
    referenceDate: "2026-04-20"
  });
  assert.equal(value, 140);
});

test("ignores inactive tariffs", () => {
  const value = findTariffValue({
    tariffs: [
      {
        service: "Curatire",
        product: "Grau",
        partner: "Agro Nord",
        fiscalProfile: "General",
        value: 140,
        validFrom: "2020-01-01",
        active: false
      },
      ...baseTariffs.filter((item) => item.partner !== "Agro Nord")
    ],
    service: "curatire",
    productName: "Grau",
    partnerName: "Agro Nord",
    fiscalProfileName: "General",
    referenceDate: "2026-04-20"
  });
  assert.equal(value, 120);
});

test("returns 0 when no tariff matches the service", () => {
  const value = findTariffValue({
    tariffs: baseTariffs,
    service: "servicii-inventate",
    productName: "Grau",
    partnerName: "Agro Nord",
    fiscalProfileName: "General",
    referenceDate: "2026-04-20"
  });
  assert.equal(value, 0);
});
