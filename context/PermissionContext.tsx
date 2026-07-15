"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useCompany } from '@/components/company-provider'
import { getUserRoleForCompany } from '@/services/company-members.service'
import { getPermissionsForSessionUser } from '@/services/permissions.service'
import {
  moduleFromPathname,
  type PermissionAction,
  type PermissionModule,
} from '@/constants/permissions'
import { hasPermission, ownerMatrix } from '@/lib/permissions'
import type { PermissionMatrix } from '@/types/permissions'
import { AccessDenied } from '@/components/auth/AccessDenied'

type PermissionContextValue = {
  matrix: PermissionMatrix | null
  role: string | null
  isOwner: boolean
  isLoading: boolean
  can: (module: PermissionModule, action?: PermissionAction) => boolean
  canView: (module: PermissionModule) => boolean
  refreshPermissions: () => Promise<void>
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined)

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const [matrix, setMatrix] = useState<PermissionMatrix | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshPermissions = useCallback(async () => {
    if (!user || !selectedCompany) {
      setMatrix(null)
      setRole(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const companyRole = await getUserRoleForCompany(user.id, selectedCompany.id)
      const ownsCompany = selectedCompany.user_id === user.id
      const effectiveRole =
        companyRole === 'Owner' || ownsCompany
          ? 'Owner'
          : (companyRole ?? user.role)
      setRole(effectiveRole)
      if (effectiveRole === 'Owner') {
        setMatrix(ownerMatrix())
      } else {
        const next = await getPermissionsForSessionUser(
          selectedCompany.id,
          user.id,
          effectiveRole
        )
        setMatrix(next)
      }
    } catch (error) {
      console.error('[permissions]', error)
      // Fallback so owners are not locked out if a transient query fails
      if (user.role === 'Owner' || selectedCompany.user_id === user.id) {
        setRole('Owner')
        setMatrix(ownerMatrix())
      } else {
        setMatrix(null)
        setRole(user.role ?? null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedCompany])

  useEffect(() => {
    refreshPermissions()
  }, [refreshPermissions])

  const isOwner = role === 'Owner'

  const can = useCallback(
    (module: PermissionModule, action: PermissionAction = 'view') => {
      return hasPermission(matrix, module, action, { isOwner })
    },
    [matrix, isOwner]
  )

  const canView = useCallback(
    (module: PermissionModule) => can(module, 'view'),
    [can]
  )

  const value = useMemo(
    () => ({
      matrix,
      role,
      isOwner,
      isLoading,
      can,
      canView,
      refreshPermissions,
    }),
    [matrix, role, isOwner, isLoading, can, canView, refreshPermissions]
  )

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

export function RoutePermissionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const { canView, isLoading } = usePermissions()

  const routeModule = moduleFromPathname(pathname)

  if (isLoading || !user || !selectedCompany || !routeModule) {
    return <>{children}</>
  }

  if (!canView(routeModule)) {
    return <AccessDenied />
  }

  return <>{children}</>
}

export function usePermissions() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermissions must be used within PermissionProvider')
  }
  return context
}
