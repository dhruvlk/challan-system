"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Building2,
  Users,
  Package,
  FileText,
  PieChart,
  Menu,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { LogoutDialog } from "@/components/auth/LogoutDialog"
import { SidebarProfile } from "./SidebarProfile"
import { CompanySwitcher } from "./CompanySwitcher"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Customers', href: '/parties', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Challans', href: '/challans', icon: FileText },
  { name: 'Reports', href: '/reports', icon: PieChart },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true)
  }

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const isCollapsed = collapsed && !isMobile;
    
    return (
      <div className="flex h-full flex-col bg-background/95 backdrop-blur-xl border-r shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] transition-all duration-300">
        <div className="flex h-16 items-center px-4 shrink-0">
          <CompanySwitcher collapsed={isCollapsed} />
        </div>
        
        <div className="flex-1 overflow-auto py-4">
          <nav className="grid items-start px-3 gap-1">
            <TooltipProvider delay={0}>
              {navigation.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== '/');
                
                const linkContent = (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 group relative",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    {isActive && !isCollapsed && (
                      <motion.div 
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" 
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <item.icon className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200", 
                      isActive && "scale-110",
                      !isActive && "group-hover:scale-110"
                    )} />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger render={linkContent} />
                      <TooltipContent side="right" sideOffset={16} className="font-medium rounded-lg">
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </TooltipProvider>
          </nav>
        </div>

        <div className="mt-auto p-4 flex flex-col gap-3 shrink-0">
          <SidebarProfile onLogoutClick={handleLogoutClick} collapsed={isCollapsed} />
        </div>
      </div>
    );
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="shrink-0 md:hidden fixed top-3 left-4 z-50 rounded-lg glass" />}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-[280px] border-r-0">
          <SidebarContent isMobile />
        </SheetContent>
      </Sheet>
      
      <motion.div 
        layout
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:block h-screen sticky top-0 z-40 relative group overflow-visible"
      >
        <SidebarContent />
        <Button
          variant="outline"
          size="icon-xs"
          className="absolute -right-3 top-6 rounded-full shadow-md border-border/50 z-50 bg-background hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </Button>
      </motion.div>
      
      <LogoutDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen} />
    </>
  )
}
