export interface TaxInput {
  subtotal: number;
  discount?: number;
  cgstPercent?: number;
  sgstPercent?: number;
  igstPercent?: number;
  otherCharges?: number;
}

export interface TaxResult {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  otherCharges: number;
  grandTotal: number;
}

export function calculateTax({
  subtotal,
  discount = 0,
  cgstPercent = 2.5,
  sgstPercent = 2.5,
  igstPercent = 0,
  otherCharges = 0,
}: TaxInput): TaxResult {
  const taxableAmount = Math.max(0, subtotal - discount);
  const cgstAmount = (taxableAmount * cgstPercent) / 100;
  const sgstAmount = (taxableAmount * sgstPercent) / 100;
  const igstAmount = (taxableAmount * igstPercent) / 100;
  const grandTotal = taxableAmount + cgstAmount + sgstAmount + igstAmount + otherCharges;

  return {
    subtotal,
    discount,
    taxableAmount,
    cgstPercent,
    sgstPercent,
    igstPercent,
    cgstAmount,
    sgstAmount,
    igstAmount,
    otherCharges,
    grandTotal,
  };
}

export function sumItemAmounts(items: { amount?: number | null }[]): number {
  return items.reduce((sum, item) => sum + (item.amount ?? 0), 0);
}
