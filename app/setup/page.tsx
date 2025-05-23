"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a página de configurações, aba banco de dados
    router.replace("/configuracoes?tab=database")
  }, [router])

  return (
    <div className="container relative">
      <div className="mx-auto flex w-full flex-col gap-4 md:gap-8 py-4">
        <div>
          <h1 className="text-3xl font-semibold">Redirecionando...</h1>
          <p className="text-muted-foreground">
            A página de configuração do banco de dados foi movida para a página de configurações.
          </p>
        </div>
      </div>
    </div>
  )
} 