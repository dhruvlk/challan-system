import type { Payment, PaginatedResult, PaginationParams } from '@/types';

const STORAGE_KEY = 'cs_payments';

function getPaymentsFromStorage(): Payment[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function savePaymentsToStorage(payments: Payment[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
  }
}

export async function getPayments(companyId: string): Promise<Payment[]> {
  const all = getPaymentsFromStorage();
  return all.filter((p) => p.company_id === companyId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getPaymentsPaginated(
  companyId: string,
  search: string,
  { page = 1, pageSize = 10 }: PaginationParams = {}
): Promise<PaginatedResult<Payment>> {
  const all = await getPayments(companyId);
  let filtered = all;

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = all.filter(
      (p) =>
        p.invoice_number?.toLowerCase().includes(q) ||
        p.reference_number?.toLowerCase().includes(q) ||
        p.notes?.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize) || 1,
  };
}

export async function addPayment(payment: Omit<Payment, 'id' | 'created_at'>): Promise<Payment> {
  const newPayment: Payment = {
    ...payment,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  const all = getPaymentsFromStorage();
  all.push(newPayment);
  savePaymentsToStorage(all);
  return newPayment;
}

export async function updatePayment(payment: Payment): Promise<Payment> {
  const all = getPaymentsFromStorage();
  const index = all.findIndex((p) => p.id === payment.id);
  if (index === -1) throw new Error('Payment not found');
  
  const updated = { ...payment, updated_at: new Date().toISOString() };
  all[index] = updated;
  savePaymentsToStorage(all);
  return updated;
}

export async function deletePayment(id: string): Promise<void> {
  const all = getPaymentsFromStorage();
  const filtered = all.filter((p) => p.id !== id);
  savePaymentsToStorage(filtered);
}
