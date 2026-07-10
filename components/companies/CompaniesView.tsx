"use client"

import { useCompany } from "@/components/company-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, PlusCircle, Pencil } from "lucide-react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/common/PageHeader"

export function CompaniesView() {
  const { companies, selectedCompany, setSelectedCompany } = useCompany()
  const router = useRouter()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Companies"
        description="Manage your companies and their details."
        action={
          <Button onClick={() => router.push('/companies/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Company
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card 
            key={company.id} 
            className={`cursor-pointer transition-all hover:border-primary/50 ${selectedCompany?.id === company.id ? 'border-primary ring-1 ring-primary' : ''}`}
            onClick={() => setSelectedCompany(company)}
          >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  {company.name}
                </CardTitle>
                <CardDescription className="line-clamp-1">
                  {company.gst_number ? `GST: ${company.gst_number}` : 'No GST provided'}
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                e.stopPropagation()
                router.push(`/companies/${company.id}/edit`)
              }}>
                <Pencil className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground space-y-1 mt-2">
                <p className="line-clamp-1">{company.email || 'No email'}</p>
                <p className="line-clamp-1">{company.phone || 'No phone'}</p>
                <p className="line-clamp-2 mt-2">{company.address || 'No address'}</p>
              </div>
            </CardContent>
          </Card>
        ))}
        {companies.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 text-center border rounded-lg border-dashed">
            <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No companies found</h3>
            <p className="text-sm text-muted-foreground mb-4">Get started by creating your first company.</p>
            <Button onClick={() => router.push('/companies/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Company
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
