"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ChevronDown } from "lucide-react"
import { ProfileDropdown } from "@/components/common/ProfileDropdown"
import { cn } from "@/lib/utils"

interface SidebarProfileProps {
  onLogoutClick: () => void;
  collapsed?: boolean;
}

export function SidebarProfile({ onLogoutClick, collapsed = false }: SidebarProfileProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <ProfileDropdown isOpen={isOpen} onOpenChange={setIsOpen} onLogoutClick={onLogoutClick}>
      <div className={cn(
        "flex items-center gap-3 rounded-xl border border-transparent hover:bg-muted/50 p-2 cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isOpen && "bg-muted/50 border-border/50 premium-shadow",
        collapsed && "justify-center"
      )}>
        <Avatar className="h-9 w-9 bg-primary/10 border border-primary/20 shrink-0">
          <AvatarFallback className="text-primary font-medium">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        {!collapsed && (
          <>
            <div className="flex flex-col overflow-hidden text-sm leading-tight flex-1 text-left">
              <span className="font-semibold truncate text-foreground">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
            <div className="text-muted-foreground ml-auto shrink-0">
              <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isOpen && "rotate-180")} />
            </div>
          </>
        )}
      </div>
    </ProfileDropdown>
  )
}
