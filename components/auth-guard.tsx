"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  // DESENVOLVIMENTO: Desabilitando temporariamente a proteção de autenticação
  // Retorna diretamente os children sem verificar autenticação
  return <>{children}</>
  
  // Código original comentado abaixo:
  /*
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Se não estiver carregando e o usuário não estiver autenticado
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  // Se estiver carregando, exibe um spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // Se o usuário estiver autenticado, renderiza o conteúdo
  if (user) {
    return <>{children}</>
  }

  // Este return é para o TypeScript, não deve ser alcançado na prática
  return null
  */
} 