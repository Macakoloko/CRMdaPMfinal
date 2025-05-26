"use client"

import { SidebarNavigation, MobileSidebarNavigation } from "@/components/sidebar-navigation"
import { TopNavigation } from "@/components/top-navigation"
import { AuthGuard } from "@/components/auth-guard"

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <SidebarNavigation />
        <main className="flex-1 md:ml-64 pb-16 md:pb-0">
          <TopNavigation />
          {children}
        </main>
        <MobileSidebarNavigation />
      </div>
    </AuthGuard>
  )
} 