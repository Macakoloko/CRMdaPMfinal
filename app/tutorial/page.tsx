"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TutorialPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para o manual do usuário
    window.location.href = "/manual_usuario.html"
  }, [router])

  // Mostra um spinner enquanto redireciona
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-lg font-medium">Carregando o manual do usuário...</p>
      </div>
    </div>
  )
}