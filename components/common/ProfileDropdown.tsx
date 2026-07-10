"use client"

import { ReactNode } from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogOut, User } from "lucide-react"

interface ProfileDropdownProps {
  children: ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLogoutClick: () => void;
}

export function ProfileDropdown({ children, isOpen, onOpenChange, onLogoutClick }: ProfileDropdownProps) {
  return (
    <DropdownMenu open={isOpen} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger className="w-full outline-none">
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        side="top"
        className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[220px] mb-2 rounded-xl p-1.5 premium-shadow border-border/50 bg-background/95 backdrop-blur-md"
      >
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mb-1">
          Account
        </div>
        <DropdownMenuItem className="w-full cursor-pointer rounded-lg py-2 focus:bg-muted">
          <User className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <div className="h-px bg-border/50 my-1 -mx-1.5" />
        <DropdownMenuItem 
          onClick={onLogoutClick}
          className="w-full text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer rounded-lg py-2"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-medium">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
