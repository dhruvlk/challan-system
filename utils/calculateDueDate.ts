import { addDays, addWeeks, addMonths, isValid } from "date-fns";

export type PaymentUnit = "Days" | "Weeks" | "Months";

export function calculateDueDate(
  challanDate: Date | string | null | undefined,
  paymentValue: number | null | undefined,
  paymentUnit: PaymentUnit | string | null | undefined
): Date | null {
  if (!challanDate || !paymentValue || !paymentUnit) {
    return null;
  }

  const baseDate = new Date(challanDate);
  if (!isValid(baseDate)) {
    return null;
  }

  const amount = Number(paymentValue);
  if (isNaN(amount) || amount <= 0) {
    return null;
  }

  switch (paymentUnit) {
    case "Days":
      return addDays(baseDate, amount);
    case "Weeks":
      return addWeeks(baseDate, amount);
    case "Months":
      return addMonths(baseDate, amount);
    default:
      return null;
  }
}
