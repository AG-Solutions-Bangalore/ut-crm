import { ToWords } from "to-words";

const toWords = new ToWords({
  localeCode: "en-IN",
  converterOptions: {
    currency: true,
    ignoreZeroCurrency: false,
    ignoreDecimal: false,
  },
});

export const amountToWords = (amount) => {
  // If empty, undefined, null → return "-"
  if (amount === undefined || amount === null || amount === "") return "-";

  // If not a number → return "-"
  if (isNaN(Number(amount))) return "-";

  return toWords.convert(Number(amount));
};
