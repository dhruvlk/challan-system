import { createClient } from '@/lib/supabase/client';
import {
  getAmountReceived,
  getChallanTotal,
  resolvePaymentStatus,
} from '@/lib/payment-status';
import type { Challan, ChallanPayment } from '@/types';

const supabase = () => createClient();

function mapPayment(row: Record<string, unknown>): ChallanPayment {
  return row as unknown as ChallanPayment;
}

export async function getChallanPayments(challanId: string): Promise<ChallanPayment[]> {
  const { data, error } = await supabase()
    .from('challan_payments')
    .select('*')
    .eq('challan_id', challanId)
    .order('payment_date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(mapPayment);
}

export interface RecordChallanPaymentInput {
  challanId: string;
  companyId: string;
  amount: number;
  paymentDate: string;
  paymentMode?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
  userId?: string | null;
}

export async function recordChallanPayment(
  input: RecordChallanPaymentInput
): Promise<Challan> {
  const { getChallanById } = await import('@/services/challans.service');
  const challan = await getChallanById(input.challanId);
  if (!challan) throw new Error('Challan not found');

  const grandTotal = getChallanTotal(challan);
  const currentReceived = getAmountReceived(challan);
  const newTotalReceived = currentReceived + input.amount;

  if (newTotalReceived > grandTotal + 0.01) {
    throw new Error(
      `Payment amount exceeds remaining balance of ₹${(grandTotal - currentReceived).toFixed(2)}`
    );
  }

  const { error: insertError } = await supabase().from('challan_payments').insert({
    challan_id: input.challanId,
    company_id: input.companyId,
    amount: input.amount,
    payment_date: input.paymentDate,
    payment_mode: input.paymentMode ?? null,
    reference_number: input.referenceNumber ?? null,
    notes: input.notes ?? null,
    created_by: input.userId ?? null,
  });

  if (insertError) throw insertError;

  const paymentStatus = resolvePaymentStatus({
    grand_total: grandTotal,
    payment_amount_received: newTotalReceived,
    due_date: challan.due_date,
  });

  const { error: updateError } = await supabase()
    .from('challans')
    .update({
      payment_amount_received: newTotalReceived,
      payment_received_date: input.paymentDate,
      payment_mode: input.paymentMode ?? null,
      payment_reference: input.referenceNumber ?? null,
      payment_notes: input.notes ?? null,
      payment_status: paymentStatus,
    })
    .eq('id', input.challanId);

  if (updateError) throw updateError;

  const updated = await getChallanById(input.challanId);
  if (!updated) throw new Error('Failed to load updated challan');
  return updated;
}
