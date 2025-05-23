"use client"

import { Home, DollarSign, Users, MessageCircle, Settings, Calendar, Package, Scissors, Zap } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

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
    name: "Produtos",
    href: "/produtos",
    icon: Package,
  },
  {
    name: "Serviços",
    href: "/servicos",
    icon: Scissors,
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

export function MobileNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background">
      <nav className="flex h-16 items-center justify-around overflow-x-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 px-3 py-2 text-xs",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary",
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

