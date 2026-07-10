"use client"

import { useTheme } from "next-themes"
import { useCompany } from "@/components/company-provider"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Moon, Sun, Building2, Check, PlusCircle, User as UserIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  const { setTheme } = useTheme()
  const { selectedCompany, companies, setSelectedCompany } = useCompany()
  const { user } = useAuth()
  const router = useRouter()

  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-muted/40 px-6 justify-end w-full">
      
      {/* Company Switcher */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" className="flex items-center gap-2 max-w-[200px] truncate" />}>
          <Building2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{selectedCompany?.name || 'Select Company'}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {companies.map((company) => (
            <DropdownMenuItem
              key={company.id}
              onClick={() => setSelectedCompany(company)}
              className="flex items-center justify-between"
            >
              <span className="truncate">{company.name}</span>
              {selectedCompany?.id === company.id && (
                <Check className="h-4 w-4 ml-2 shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={() => router.push('/companies/new')}>
            <PlusCircle className="mr-2 h-4 w-4" />
            <span>New Company</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Theme Toggle */}
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme("light")}>
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("dark")}>
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Profile */}
      {user && (
        <div className="flex items-center gap-2 pl-4 border-l">
          <Avatar className="h-8 w-8 bg-primary/10">
            <AvatarFallback className="text-primary font-medium">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:flex flex-col text-sm leading-tight">
            <span className="font-semibold">{user.name}</span>
            <span className="text-xs text-muted-foreground">{user.email}</span>
          </div>
        </div>
      )}
    </header>
  )
}
