"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export function TutorialButton() {
  const [isMounted, setIsMounted] = useState(false)
  
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const openManual = () => {
    window.open('/manual_usuario.html', '_blank')
  }

  if (!isMounted) return null

  return (
    <Button 
      onClick={openManual}
      className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg bg-primary text-primary-foreground"
    >
      <span className="text-lg font-bold">?</span>
    </Button>
  )
}