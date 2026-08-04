import type { AuditLogEntry, PaginatedResult, PaginationParams } from '@/types';

const STORAGE_KEY = 'cs_audit_logs';

function getAuditLogsFromStorage(): AuditLogEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveAuditLogsToStorage(logs: AuditLogEntry[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }
}

export async function getAuditLogs(companyId: string): Promise<AuditLogEntry[]> {
  const all = getAuditLogsFromStorage();
  return all.filter((log) => log.company_id === companyId).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function getAuditLogsPaginated(
  companyId: string,
  search: string,
  { page = 1, pageSize = 10 }: PaginationParams = {}
): Promise<PaginatedResult<AuditLogEntry>> {
  const all = await getAuditLogs(companyId);
  let filtered = all;

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = all.filter(
      (log) =>
        log.module.toLowerCase().includes(q) ||
        log.record_name.toLowerCase().includes(q) ||
        log.performed_by.toLowerCase().includes(q)
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

export async function addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'created_at' | 'date' | 'time'>): Promise<AuditLogEntry> {
  const now = new Date();
  const newEntry: AuditLogEntry = {
    ...entry,
    id: crypto.randomUUID(),
    date: now.toISOString().split('T')[0],
    time: now.toLocaleTimeString(),
    created_at: now.toISOString(),
  };
  const all = getAuditLogsFromStorage();
  all.push(newEntry);
  saveAuditLogsToStorage(all);
  return newEntry;
}

export async function clearAuditLogs(companyId: string): Promise<void> {
  const all = getAuditLogsFromStorage();
  const filtered = all.filter((log) => log.company_id !== companyId);
  saveAuditLogsToStorage(filtered);
}
