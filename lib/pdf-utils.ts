import type { Company } from '@/types';

export function formatCompanyAddress(company: Company): string {
  const parts = [company.address, company.city, company.state, company.pincode].filter(Boolean);
  return parts.join(', ');
}

export interface BankDetailRow {
  label?: string;
  value: string;
  isBankName?: boolean;
}

export function getBankDetailRows(company: Company): BankDetailRow[] {
  const rows: BankDetailRow[] = [];

  if (company.bank_name) {
    rows.push({ value: company.bank_name, isBankName: true });
  }
  if (company.account_name) {
    rows.push({ label: 'A/C Name:', value: company.account_name });
  }
  if (company.account_number) {
    rows.push({ label: 'A/C No:', value: company.account_number });
  }
  if (company.ifsc_code) {
    rows.push({ label: 'IFSC:', value: company.ifsc_code });
  }
  if (company.branch) {
    rows.push({ label: 'Branch:', value: company.branch });
  }

  if (rows.length === 0 && company.bank_details) {
    return company.bank_details
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((value) => ({ value }));
  }

  return rows;
}

/** @deprecated Use getBankDetailRows for aligned PDF layout */
export function formatBankDetails(company: Company): string[] {
  return getBankDetailRows(company).map((row) =>
    row.label ? `${row.label} ${row.value}` : row.value
  );
}

export function parseTerms(terms?: string | null): string[] {
  if (!terms?.trim()) return [];

  const chunks = terms
    .split(/\n|•/)
    .flatMap((chunk) => chunk.split(/(?<=\.)\s+(?=[a-z])/i))
    .map((line) => line.replace(/^[-•*\d.)\s]+/, '').trim())
    .filter(Boolean);

  return chunks;
}

export function itemDescription(item: {
  description?: string | null;
  quality?: string | null;
  fabric_name?: string | null;
  product?: { name?: string; hsn_code?: string | null } | null;
}): string {
  if (item.description?.trim()) return item.description.trim();
  const parts = [
    item.product?.name,
    item.quality,
    item.fabric_name,
  ].filter(Boolean);
  return parts.join(' ').trim();
}

export function resolveHsnCode(
  company?: { hsn_code?: string | null } | null,
  items: { product?: { hsn_code?: string | null } | null }[] = []
): string {
  for (const item of items) {
    if (item.product?.hsn_code) return item.product.hsn_code;
  }
  if (company?.hsn_code?.trim()) return company.hsn_code.trim();
  return '-';
}

/** @deprecated Use resolveHsnCode */
export function primaryHsnCode(items: { product?: { hsn_code?: string | null } | null }[]): string {
  return resolveHsnCode(null, items);
}
