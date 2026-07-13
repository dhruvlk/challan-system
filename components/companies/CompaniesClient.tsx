"use client"

import { useCompany } from "@/components/company-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, PlusCircle, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/common/PageHeader"
import { EmptyState } from "@/components/common/EmptyState"
import { MotionStagger, MotionStaggerItem } from "@/components/common/motion"
import { cn } from "@/lib/utils"

export default function CompaniesClient() {
  const { companies, selectedCompany, setSelectedCompany } = useCompany()
  const router = useRouter()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Organization"
        title="Companies"
        description="Manage your companies and their details."
        action={
          <Button onClick={() => router.push("/companies/new")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add company
          </Button>
        }
      />

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Create your first company to start managing challans and customers."
          action={
            <Button onClick={() => router.push("/companies/new")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create company
            </Button>
          }
        />
      ) : (
        <MotionStagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <MotionStaggerItem key={company.id}>
              <Card
                className={cn(
                  "cursor-pointer transition-all duration-200 hover:shadow-elevated",
                  selectedCompany?.id === company.id && "border-primary/40 ring-1 ring-primary/20"
                )}
                onClick={() => setSelectedCompany(company)}
              >
                <CardHeader className="flex flex-row items-start justify-between gap-3">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="truncate">{company.name}</span>
                    </CardTitle>
                    <CardDescription className="line-clamp-1">
                      {company.gst_number ? `GST: ${company.gst_number}` : "No GST provided"}
                    </CardDescription>
                  </div>
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
