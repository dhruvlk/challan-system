"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Bell, ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { StaggerContainer, StaggerItem, FadeIn } from "@/components/animations"
import { ThemeToggle } from "./ThemeToggle"

function generateBreadcrumbs(pathname: string) {
  const paths = pathname.split('/').filter(Boolean);
  if (paths.length === 0) return [{ title: 'Dashboard', href: '/' }];

  return [
    { title: 'Dashboard', href: '/' },
    ...paths.map((path, index) => {
      const href = '/' + paths.slice(0, index + 1).join('/');
      // Capitalize and remove hyphens
      const title = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      return { title, href };
    })
  ];
}

export function Header() {
  const { setTheme, theme } = useTheme()
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between bg-background/80 backdrop-blur-md px-6 border-b border-border/40">
      
      {/* Breadcrumb Navigation */}
      <StaggerContainer className="flex items-center text-sm font-medium" delayChildren={0.1} staggerChildren={0.05}>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <StaggerItem key={crumb.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground/50" />
              )}
              {isLast ? (
                <span className="text-foreground">{crumb.title}</span>
              ) : (
                <Link 
                  href={crumb.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.title}
                </Link>
              )}
            </StaggerItem>
          )
        })}
      </StaggerContainer>

      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500 delay-200 fill-mode-both">
        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  )
}
