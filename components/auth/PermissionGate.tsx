"use client"

import type { ReactNode } from "react"
import type { PermissionAction, PermissionModule } from "@/constants/permissions"
import { usePermissions } from "@/context/PermissionContext"

type PermissionGateProps = {
  module: PermissionModule
  action?: PermissionAction
  children: ReactNode
  fallback?: ReactNode
}

export function PermissionGate({
  module,
  action = "view",
  children,
  fallback = null,
}: PermissionGateProps) {
  const { can, isLoading } = usePermissions()
  if (isLoading) return null
  if (!can(module, action)) return <>{fallback}</>
  return <>{children}</>
}
