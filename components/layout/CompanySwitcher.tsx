"use client"

import { useCompany } from "@/components/company-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Building2, Check, ChevronsUpDown, PlusCircle } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface CompanySwitcherProps {
  collapsed?: boolean;
}

export function CompanySwitcher({ collapsed = false }: CompanySwitcherProps) {
  const { selectedCompany, companies, setSelectedCompany } = useCompany()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="w-full outline-none">
        <div className={cn(
          "flex items-center gap-3 rounded-xl border border-transparent hover:bg-muted/50 p-2 cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isOpen && "bg-muted/50 border-border/50 premium-shadow",
          collapsed && "justify-center"
        )}>
          <Avatar className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
            {selectedCompany?.logo_url && <AvatarImage src={selectedCompany.logo_url} />}
            <AvatarFallback className="rounded-lg bg-transparent text-primary">
              <Building2 className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          
          {!collapsed && (
            <>
              <div className="flex flex-col overflow-hidden text-sm flex-1 text-left">
                <span className="font-semibold truncate text-foreground leading-tight">
                  {selectedCompany ? selectedCompany.name : 'Select Company'}
                </span>
                <span className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
                  Workspace
                </span>
              </div>
              <div className="text-muted-foreground ml-auto shrink-0">
                <ChevronsUpDown className="h-4 w-4" />
              </div>
            </>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[240px] mt-1 rounded-xl p-1.5 premium-shadow border-border/50 bg-background/95 backdrop-blur-md"
      >
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mb-1">
          Select Workspace
        </div>
        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => setSelectedCompany(company)}
            className="flex items-center justify-between cursor-pointer rounded-lg py-2 focus:bg-muted"
          >
            <div className="flex items-center gap-3 truncate pr-4">
              <Avatar className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 shrink-0">
                {company.logo_url && <AvatarImage src={company.logo_url} />}
                <AvatarFallback className="rounded-md bg-transparent text-primary text-xs">
                  {company.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="truncate font-medium">{company.name}</span>
            </div>
            {selectedCompany?.id === company.id && (
              <Check className="h-4 w-4 shrink-0 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <div className="h-px bg-border/50 my-1 -mx-1.5" />
        <DropdownMenuItem 
          onClick={() => router.push('/companies/new')}
          className="cursor-pointer rounded-lg py-2 focus:bg-muted text-primary focus:text-primary"
        >
          <PlusCircle className="mr-2 h-4 w-4 shrink-0" />
          <span className="font-medium">Create New Company</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
