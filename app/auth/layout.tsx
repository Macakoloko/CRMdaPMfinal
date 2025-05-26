"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Se o usuário já estiver autenticado, redirecionar para a página inicial
    if (user && !loading) {
      router.push("/")
    }
  }, [user, loading, router])

  // Se ainda estiver carregando, não renderiza nada
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Se o usuário não estiver autenticado, renderiza as páginas de autenticação
  if (!user) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    )
  }

  // Esse return é necessário para o TypeScript, mas não deve ser alcançado
  return null
} 