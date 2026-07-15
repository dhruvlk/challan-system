"use client"

import { useCompany } from "@/components/company-provider"
import { usePermissions } from "@/context/PermissionContext"
import { PermissionGate } from "@/components/auth/PermissionGate"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, PlusCircle, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { MotionStagger, MotionStaggerItem } from "@/components/common/motion"
import { CompanyAvatar } from "@/components/companies/CompanyAvatar"
import { cn } from "@/lib/utils"

export default function CompaniesClient() {
  const { companies, selectedCompany, setSelectedCompany } = useCompany()
  const { can } = usePermissions()
  const router = useRouter()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organization"
        title="Companies"
        description="Manage your companies and their details."
        action={
          can("companies", "create") ? (
            <Button onClick={() => router.push("/companies/new")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add company
            </Button>
          ) : undefined
        }
      />

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Create your first company to start managing challans and customers."
          action={
            can("companies", "create") ? (
              <Button onClick={() => router.push("/companies/new")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Create company
              </Button>
            ) : undefined
          }
        />
      ) : (
        <MotionStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <MotionStaggerItem key={company.id}>
              <Card
                className={cn(
                  "group cursor-pointer transition-all duration-200 hover:shadow-elevated",
                  selectedCompany?.id === company.id && "border-primary/40 ring-1 ring-primary/20"
                )}
                onClick={() => setSelectedCompany(company)}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-3 pb-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <CompanyAvatar
                      name={company.name}
                      logoUrl={company.logo_url}
                      size="card"
                      interactive
                    />
                    <div className="min-w-0 space-y-0.5">
                      <CardTitle className="truncate text-base font-semibold leading-tight">
                        {company.name}
                      </CardTitle>
                      <CardDescription className="line-clamp-1 text-xs">
                        {company.gst_number ? `GST: ${company.gst_number}` : "No GST provided"}
                      </CardDescription>
                    </div>
                  </div>
                  <PermissionGate module="companies" action="edit">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/companies/${company.id}/edit`)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </PermissionGate>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p className="line-clamp-1">{company.email || "No email"}</p>
                  <p className="line-clamp-1">{company.phone || "No phone"}</p>
                  <p className="line-clamp-2 pt-1">{company.address || "No address"}</p>
                </CardContent>
              </Card>
            </MotionStaggerItem>
          ))}
        </MotionStagger>
      )}
    </div>
  )
}
