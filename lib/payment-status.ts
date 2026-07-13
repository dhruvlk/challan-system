import { isAfter, parseISO, startOfDay } from 'date-fns'
import type { ChallanPaymentStatus } from '@/types'

const PAYMENT_TOLERANCE = 0.01

export function getChallanTotal(challan: { grand_total?: number | null }): number {
  return Number(challan.grand_total ?? 0)
}

export function getAmountReceived(challan: { payment_amount_received?: number | null }): number {
  return Number(challan.payment_amount_received ?? 0)
}

export function getRemainingBalance(
  grandTotal: number,
  amountReceived: number
): number {
  return Math.max(0, grandTotal - amountReceived)
}

export function isPaymentComplete(grandTotal: number, amountReceived: number): boolean {
  if (grandTotal <= 0) return amountReceived > 0
  return amountReceived >= grandTotal - PAYMENT_TOLERANCE
}

export function isPastDue(
  dueDate: string | null | undefined,
  referenceDate: Date = new Date()
): boolean {
  if (!dueDate) return false
  const due = startOfDay(parseISO(dueDate))
  const today = startOfDay(referenceDate)
  return isAfter(today, due)
}

/**
 * Derives payment status from amounts and due date.
 * Overdue takes precedence when due date has passed and payment is incomplete.
 */
export function resolvePaymentStatus(
  challan: {
    grand_total?: number | null
    payment_amount_received?: number | null
    due_date?: string | null
    payment_status?: ChallanPaymentStatus | null
  },
  referenceDate: Date = new Date()
): ChallanPaymentStatus {
  const grandTotal = getChallanTotal(challan)
  const received = getAmountReceived(challan)

  if (isPaymentComplete(grandTotal, received)) {
    return 'Paid'
  }

  if (received > PAYMENT_TOLERANCE) {
    if (isPastDue(challan.due_date, referenceDate)) {
      return 'Overdue'
    }
    return 'Partially Paid'
  }

  if (isPastDue(challan.due_date, referenceDate)) {
    return 'Overdue'
  }

  return 'Pending'
}

export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
