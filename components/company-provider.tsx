"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { getCompanies, getSelectedCompanyId, setSelectedCompanyId } from '@/services/companies.service'
import { useAuth } from '@/hooks/useAuth'
import { Company } from '@/types'

interface CompanyContextType {
  selectedCompany: Company | null
  setSelectedCompany: (company: Company | null) => void
  companies: Company[]
  setCompanies: (companies: Company[]) => void
  isLoading: boolean
  refreshCompanies: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshCompanies = async () => {
    if (!isAuthenticated) {
      setCompanies([])
      setSelectedCompany(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const storedCompanies = await getCompanies()
      setCompanies(storedCompanies)

      const storedId = await getSelectedCompanyId()
      const active = storedCompanies.find((c) => c.is_active)
      const found = storedId
        ? storedCompanies.find((c) => c.id === storedId)
        : active ?? storedCompanies[0]

      setSelectedCompany(found ?? storedCompanies[0] ?? null)
    } catch {
      setCompanies([])
      setSelectedCompany(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    refreshCompanies()
  }, [isAuthenticated])

  const handleSetSelectedCompany = async (company: Company | null) => {
    setSelectedCompany(company)
    if (company) {
      await setSelectedCompanyId(company.id)
      setCompanies((prev) =>
        prev.map((c) => ({ ...c, is_active: c.id === company.id }))
      )
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
        refreshCompanies,
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
