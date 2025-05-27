"use client"

import { useAuth } from "@/context/AuthContext"
import { useState } from "react"

export function AuthBypassToggle() {
  const { bypassAuth, setBypassAuth } = useAuth()
  const [isChanging, setIsChanging] = useState(false)

  const handleToggle = () => {
    setIsChanging(true)
    setBypassAuth(!bypassAuth)
    
    // Apenas para mostrar o estado de processamento brevemente
    setTimeout(() => {
      setIsChanging(false)
    }, 500)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={handleToggle}
        disabled={isChanging}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-md text-sm font-medium flex items-center shadow-lg"
      >
        {isChanging ? (
          "Processando..."
        ) : (
          bypassAuth ? "Desativar Bypass" : "Ativar Bypass"
        )}
      </button>
    </div>
  )
} 