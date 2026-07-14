"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  FileText,
  PieChart,
  LogOut,
  Menu,
  PlusCircle,
  Truck,
  type LucideIcon,
} from "lucide-react"
import { FEATURES } from "@/lib/features"
import { useCompany } from "@/components/company-provider"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { LogoutDialog } from "@/components/auth/LogoutDialog"
import { CompanyAvatar } from "@/components/companies/CompanyAvatar"
import type { Company } from "@/types"

const navigation: { name: string; href: string; icon: LucideIcon; feature?: keyof typeof FEATURES }[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Companies", href: "/companies", icon: Building2 },
  { name: "Customers", href: "/parties", icon: Users },
  { name: "Products", href: "/products", icon: Package, feature: "productsModule" },
  { name: "Challans", href: "/challans", icon: FileText },
  { name: "Delivery Challans", href: "/delivery-challans", icon: Truck },
  { name: "Reports", href: "/reports", icon: PieChart },
]

const visibleNavigation = navigation.filter(
  (item) => !item.feature || FEATURES[item.feature]
)

interface SidebarContentProps {
  pathname: string
  selectedCompany: Company | null
  onNavigate?: () => void
  onLogoutClick: () => void
}

function SidebarContent({
  pathname,
  selectedCompany,
  onNavigate,
  onLogoutClick,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="border-b border-sidebar-border px-4 py-4">
        <Link
          href="/"
          className="group flex items-center gap-3.5 rounded-xl p-2 transition-colors hover:bg-sidebar-accent/60"
          onClick={onNavigate}
        >
          <CompanyAvatar
            name={selectedCompany?.name ?? "Company"}
            logoUrl={selectedCompany?.logo_url}
            size="sidebar"
            interactive
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold leading-tight tracking-tight text-sidebar-foreground">
              {selectedCompany?.name ?? "Select company"}
            </p>
            {selectedCompany?.gst_number ? (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                GST {selectedCompany.gst_number}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">Company workspace</p>
            )}
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-auto px-3 py-4">
        {visibleNavigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`)
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "text-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-lg bg-primary/10 ring-1 ring-primary/15"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon className={cn("relative z-10 h-4 w-4 shrink-0", isActive && "text-primary")} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border p-4">
        <div className="rounded-xl border border-border/50 bg-card p-4 shadow-xs">
          <p className="text-sm font-medium">Quick action</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Create a delivery challan</p>
          <Button
            size="sm"
            className="mt-3 w-full"
            render={<Link href="/challans/new" onClick={onNavigate} />}
          >
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            New Challan
          </Button>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={onLogoutClick}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </Button>
      </div>
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { selectedCompany } = useCompany()
  const [open, setOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const closeMobileMenu = () => setOpen(false)

  const sidebarProps: SidebarContentProps = {
    pathname,
    selectedCompany,
    onLogoutClick: () => setLogoutDialogOpen(true),
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button
              variant="outline"
              size="icon"
              className="absolute top-3.5 left-3.5 z-50 md:hidden"
            />
          }
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
          <SidebarContent {...sidebarProps} onNavigate={closeMobileMenu} />
        </SheetContent>
      </Sheet>
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar md:block lg:w-[17.5rem]">
        <SidebarContent {...sidebarProps} />
      </aside>
      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />
    </>
  )
}
