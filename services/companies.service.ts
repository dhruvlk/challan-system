import { Company } from "@/types"
import { mockCompanies } from "@/data/companies"

const STORAGE_KEYS = {
  COMPANIES: 'challan_system_companies',
  SELECTED_COMPANY: 'challan_system_selected_company_id'
}

export async function initializeCompaniesService(): Promise<void> {
  if (typeof window === 'undefined') return
  if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(mockCompanies))
  }
}

export async function getCompanies(): Promise<Company[]> {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEYS.COMPANIES)
  return data ? JSON.parse(data) : []
}

export async function getSelectedCompanyId(): Promise<string | null> {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS.SELECTED_COMPANY)
}

export async function setSelectedCompanyId(id: string): Promise<void> {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.SELECTED_COMPANY, id)
}

export async function addCompany(company: Company): Promise<void> {
  if (typeof window === 'undefined') return
  const companies = await getCompanies()
  companies.unshift(company)
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies))
}

export async function updateCompany(company: Company): Promise<void> {
  if (typeof window === 'undefined') return
  const companies = await getCompanies()
  const index = companies.findIndex(c => c.id === company.id)
  if (index !== -1) {
    companies[index] = company
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies))
  }
}

export async function deleteCompany(id: string): Promise<void> {
  if (typeof window === 'undefined') return
  const companies = await getCompanies()
  const filtered = companies.filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(filtered))
}
