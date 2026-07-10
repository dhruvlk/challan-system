import type { Company } from '@/types';
import type { CompanyRow } from '@/types/database';

export function mapCompany(row: CompanyRow): Company {
  return { ...row };
}

export function companyToInsert(
  company: Partial<Company> & { name: string; user_id: string }
) {
  return {
    user_id: company.user_id,
    name: company.name,
    logo_url: company.logo_url ?? null,
    gst_number: company.gst_number ?? null,
    hsn_code: company.hsn_code ?? null,
    address: company.address ?? null,
    city: company.city ?? null,
    state: company.state ?? null,
    pincode: company.pincode ?? null,
    phone: company.phone ?? null,
    email: company.email ?? null,
    website: company.website ?? null,
    pan_number: company.pan_number ?? null,
    tagline: company.tagline ?? null,
    bank_name: company.bank_name ?? null,
    account_name: company.account_name ?? null,
    account_number: company.account_number ?? null,
    ifsc_code: company.ifsc_code ?? null,
    branch: company.branch ?? null,
    bank_details: company.bank_details ?? null,
    signature_url: company.signature_url ?? null,
    terms_conditions: company.terms_conditions ?? null,
    is_active: company.is_active ?? false,
  };
}
