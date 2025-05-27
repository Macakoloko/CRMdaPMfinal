"use client"

import { SidebarNavigation, MobileSidebarNavigation } from "@/components/sidebar-navigation"
import { TopNavigation } from "@/components/top-navigation"
import { ReactNode } from "react"

interface PageLayoutProps {
  children: ReactNode
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <SidebarNavigation />
      <main className="flex-1 md:ml-64 pb-16 md:pb-0">
        <TopNavigation />
        {children}
      </main>
      <MobileSidebarNavigation />
    </div>
  )
} 