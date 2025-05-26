"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export default function RedirectPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Se o usuário estiver autenticado, redireciona para o dashboard
        router.push("/")
      } else {
        // Se o usuário não estiver autenticado, redireciona para a página de login
        router.push("/auth/login")
      }
    }
  }, [user, loading, router])

  // Mostra um spinner enquanto carrega
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}

