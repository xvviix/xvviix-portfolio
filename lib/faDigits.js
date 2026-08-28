// Shared helper: convert Latin digits to Persian digits for FA copy.
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export const faDigits = (value) =>
  String(value).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)]);
