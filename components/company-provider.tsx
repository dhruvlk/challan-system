"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { initializeCompaniesService, getCompanies, getSelectedCompanyId, setSelectedCompanyId } from '@/services/companies.service'
import { Company } from '@/types'

interface CompanyContextType {
  selectedCompany: Company | null
  setSelectedCompany: (company: Company | null) => void
  companies: Company[]
  setCompanies: (companies: Company[]) => void
  isLoading: boolean
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children, initialCompanies = [] }: { children: React.ReactNode, initialCompanies?: Company[] }) {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadCompanies() {
      await initializeCompaniesService()
      const storedCompanies = await getCompanies()
      setCompanies(storedCompanies)
      
      const storedId = await getSelectedCompanyId()
      if (storedId) {
        const found = storedCompanies.find(c => c.id === storedId)
        setSelectedCompany(found || storedCompanies[0] || null)
      } else {
        setSelectedCompany(storedCompanies[0] || null)
      }
      setIsLoading(false)
    }
    loadCompanies()
  }, [])

  useEffect(() => {
    if (!selectedCompany && companies.length > 0) {
      setSelectedCompany(companies[0])
    }
  }, [companies, selectedCompany])

  const handleSetSelectedCompany = async (company: Company | null) => {
    setSelectedCompany(company)
    if (company) {
      await setSelectedCompanyId(company.id)
    } else {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('challan_system_selected_company_id')
      }
    }
  }

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        setSelectedCompany: handleSetSelectedCompany,
        companies,
        setCompanies,
        isLoading,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}
