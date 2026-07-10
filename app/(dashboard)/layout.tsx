import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { CompanyProvider } from "@/components/company-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <CompanyProvider>
        <div className="flex min-h-screen flex-col md:flex-row bg-muted/20">
          <Sidebar />
          <div className="flex flex-1 flex-col w-full min-w-0">
            <Header />
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
              {children}
            </main>
          </div>
        </div>
      </CompanyProvider>
    </AuthGuard>
  )
}
