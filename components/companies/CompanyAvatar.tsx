"use client"

import { useState } from "react"
import { getCompanyAvatarPalette, getCompanyInitials } from "@/lib/company-initials"
import { cn } from "@/lib/utils"

const sizeStyles = {
  card: {
    box: "h-10 w-10 rounded-xl",
    text: "text-[11px] font-bold tracking-tight",
    textCompact: "text-[10px] font-bold tracking-tighter",
  },
  sidebar: {
    box: "h-14 w-14 rounded-[14px]",
    text: "text-sm font-extrabold tracking-tight",
    textCompact: "text-xs font-extrabold tracking-tighter",
  },
  lg: {
    box: "h-16 w-16 rounded-[14px]",
    text: "text-base font-extrabold tracking-tight",
    textCompact: "text-sm font-extrabold tracking-tighter",
  },
} as const

export type CompanyAvatarSize = keyof typeof sizeStyles

export interface CompanyAvatarProps {
  name: string
  logoUrl?: string | null
  size?: CompanyAvatarSize
  className?: string
  interactive?: boolean
}

export function CompanyAvatar({
  name,
  logoUrl,
  size = "sidebar",
  className,
  interactive = false,
}: CompanyAvatarProps) {
  const displayName = name.trim() || "Company"
  const initials = getCompanyInitials(displayName)
  const palette = getCompanyAvatarPalette(displayName)
  const styles = sizeStyles[size]
  const hasLogo = Boolean(logoUrl?.trim())
  const [failedLogoUrl, setFailedLogoUrl] = useState<string | null>(null)

  const showLogo = hasLogo && failedLogoUrl !== logoUrl
  const textStyle = initials.length >= 3 ? styles.textCompact : styles.text

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden border shadow-sm",
        styles.box,
        showLogo ? "border-border/60 bg-muted/30" : palette.background,
        !showLogo && palette.border,
        interactive &&
          "transition-all duration-200 ease-out group-hover:scale-[1.03] group-hover:shadow-md",
        className
      )}
      role="img"
      aria-label={showLogo ? `${displayName} logo` : `${displayName} (${initials})`}
    >
      {showLogo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={logoUrl}
          src={logoUrl!}
          alt={`${displayName} logo`}
          className="size-full object-cover"
          onError={() => setFailedLogoUrl(logoUrl!)}
        />
      ) : (
        <span className={cn("select-none leading-none", textStyle, palette.text)}>
          {initials}
        </span>
      )}
    </div>
  )
}
