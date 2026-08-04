import type { Expense, PaginatedResult, PaginationParams } from '@/types';

const STORAGE_KEY = 'cs_expenses';

function getExpensesFromStorage(): Expense[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveExpensesToStorage(expenses: Expense[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }
}

export async function getExpenses(companyId: string): Promise<Expense[]> {
  const all = getExpensesFromStorage();
  return all.filter((e) => e.company_id === companyId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getExpensesPaginated(
  companyId: string,
  search: string,
  { page = 1, pageSize = 10 }: PaginationParams = {}
): Promise<PaginatedResult<Expense>> {
  const all = await getExpenses(companyId);
  let filtered = all;

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = all.filter(
      (e) =>
        e.category.toLowerCase().includes(q) ||
        e.paid_to?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
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

export async function addExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
  const newExpense: Expense = {
    ...expense,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  const all = getExpensesFromStorage();
  all.push(newExpense);
  saveExpensesToStorage(all);
  return newExpense;
}

export async function updateExpense(expense: Expense): Promise<Expense> {
  const all = getExpensesFromStorage();
  const index = all.findIndex((e) => e.id === expense.id);
  if (index === -1) throw new Error('Expense not found');
  
  const updated = { ...expense, updated_at: new Date().toISOString() };
  all[index] = updated;
  saveExpensesToStorage(all);
  return updated;
}

export async function deleteExpense(id: string): Promise<void> {
  const all = getExpensesFromStorage();
  const filtered = all.filter((e) => e.id !== id);
  saveExpensesToStorage(filtered);
}
