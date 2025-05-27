"use client"

import { SidebarNavigation, MobileSidebarNavigation } from "@/components/sidebar-navigation"
import { TopNavigation } from "@/components/top-navigation"
import { AuthGuard } from "@/components/auth-guard"
import { AppTutorial } from "@/components/app-tutorial"
import { useEffect, useState } from "react"

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isMounted, setIsMounted] = useState(false)
  const [forceRender, setForceRender] = useState(0)

  // Garantir que o componente só seja renderizado no cliente
  useEffect(() => {
    setIsMounted(true)
    
    // Verificar se há uma flag para forçar o tutorial
    try {
      const forceStart = sessionStorage.getItem("forceStartTutorial")
      if (forceStart === "true") {
        console.log("Detectada flag para iniciar tutorial")
        // Forçar re-renderização do componente
        setForceRender(prev => prev + 1)
      }
    } catch (error) {
      console.error("Erro ao acessar sessionStorage:", error)
    }
  }, [])

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <SidebarNavigation />
        <main className="flex-1 md:ml-64 pb-16 md:pb-0">
          <TopNavigation />
          {children}
        </main>
        <MobileSidebarNavigation />
        {isMounted && <AppTutorial key={`tutorial-${forceRender}`} />}
      </div>
    </AuthGuard>
  )
} 