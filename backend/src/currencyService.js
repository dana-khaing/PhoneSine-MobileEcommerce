const SUPPORTED_CURRENCIES = ["gbp", "usd", "eur"];

function currencyRates() {
  try {
    return { gbp: 1, usd: 1.28, eur: 1.18, ...JSON.parse(process.env.CURRENCY_RATES_JSON || "{}") };
  } catch {
    throw new Error("Currency rates configuration is invalid");
  }
}

function normalizeCurrency(value = "gbp") {
  const currency = String(value).toLowerCase();
  if (!SUPPORTED_CURRENCIES.includes(currency)) throw new Error("Unsupported currency");
  return currency;
}

function convertAmounts(amounts, currency) {
  const normalized = normalizeCurrency(currency);
  const rate = currencyRates()[normalized];
  const converted = {};
  for (const [key, value] of Object.entries(amounts)) {
    converted[key] = key.endsWith("Amount") ? Math.round(value * rate) : value;
  }
  return { ...converted, currency: normalized };
}

module.exports = { convertAmounts, normalizeCurrency, SUPPORTED_CURRENCIES };
