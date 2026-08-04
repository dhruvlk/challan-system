import AuditLogClient from "@/components/audit-log/AuditLogClient"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Audit Log | Textile Challan Management System",
  description: "View system activity logs",
}

export default function AuditLogPage() {
  return <AuditLogClient />
}
