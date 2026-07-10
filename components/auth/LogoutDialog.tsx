"use client"

import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/dialogs/ConfirmationDialog"

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    onOpenChange(false)
    toast.success("Logged out successfully.")
    router.push("/login")
  }

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Logout"
      description="Are you sure you want to logout?"
      confirmText="Logout"
      onConfirm={handleLogout}
      variant="destructive"
    />
  )
}
