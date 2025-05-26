"use client"

import { Home, DollarSign, Users, MessageCircle, Settings, Calendar, Package, Scissors, Zap, Menu, X } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    name: "Home",
    href: "/",
    icon: Home,
  },
  {
    name: "Agenda",
    href: "/agendamentos",
    icon: Calendar,
  },
  {
    name: "Financeiro",
    href: "/financeiro",
    icon: DollarSign,
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Users,
  },
  {
    name: "Chat",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    name: "Produtos e Serviços",
    href: "/produtos",
    icon: Package,
  },
  {
    name: "Automações",
    href: "/automacoes",
    icon: Zap,
  },
  {
    name: "Config",
    href: "/configuracoes",
    icon: Settings,
  },
]

export function SidebarNavigation() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [businessName, setBusinessName] = useState("SALÃO BELEZA TOTAL")
  const [mounted, setMounted] = useState(false)

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  // Detectar tamanho da tela para responsividade
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Verificar na montagem e quando redimensiona
    checkIfMobile()
    window.addEventListener('resize', checkIfMobile)
    
    return () => {
      window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  // Carregar o nome do estabelecimento do localStorage
  useEffect(() => {
    // Carregar o nome do estabelecimento do localStorage se existir
    const savedBusinessInfo = localStorage.getItem("businessInfo")
    if (savedBusinessInfo) {
      try {
        const businessInfo = JSON.parse(savedBusinessInfo)
        if (businessInfo.nome) {
          setBusinessName(businessInfo.nome.toUpperCase())
        }
      } catch (error) {
        console.error("Erro ao carregar informações da empresa:", error)
      }
    }
  }, [])

  // Fechar menu ao navegar (apenas mobile)
  useEffect(() => {
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }, [pathname, isMobile])

  return (
    <>
      {/* Botão toggle para dispositivos móveis */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay quando o menu está aberto no mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Barra lateral */}
      <div 
        className={cn(
          "fixed top-0 left-0 bottom-0 z-40 w-64 border-r bg-sidebar shadow-lg transition-transform duration-300 ease-in-out",
          isMobile ? (isMobileOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0",
          isMobile ? "md:translate-x-0" : "hidden md:block"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <h1 className="text-lg font-bold text-primary truncate">{businessName}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            // Only check active state after component is mounted
            const isActive = mounted && pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 rounded-md px-3 py-2 transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

// Versão de navegação móvel para telas pequenas - apenas para navegação rápida
export function MobileSidebarNavigation() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  // Set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background md:hidden">
      <nav className="flex h-16 items-center justify-around overflow-x-auto">
        {navItems.slice(0, 5).map((item) => {
          // Only check active state after component is mounted
          const isActive = mounted && pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 px-3 py-2 text-xs",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
} 