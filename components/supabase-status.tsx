"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/context/SupabaseContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X } from "lucide-react"

export function SupabaseStatus() {
  const { supabase } = useSupabase()
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [appointmentCount, setAppointmentCount] = useState<number | null>(null)
  const [clientCount, setClientCount] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const checkConnection = async () => {
    setStatus("checking")
    setErrorMessage(null)
    
    try {
      // Test connection by fetching the count of appointments
      const { count: appointmentsCount, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
      
      if (appointmentsError) {
        console.error("Erro na tabela appointments:", appointmentsError)
      } else {
        setAppointmentCount(appointmentsCount)
      }

      // Test connection by fetching the count of clients
      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
      
      if (clientsError) {
        console.error("Erro na tabela clients:", clientsError)
        throw clientsError
      }
      
      setClientCount(clientsCount)
      setStatus("connected")
    } catch (error: any) {
      console.error("Erro na conexão com Supabase:", error)
      setStatus("error")
      setErrorMessage(error.message || "Erro desconhecido ao conectar com o Supabase")
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Status do Supabase
          {status === "checking" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "connected" && <Check className="h-4 w-4 text-green-500" />}
          {status === "error" && <X className="h-4 w-4 text-red-500" />}
        </CardTitle>
        <CardDescription>
          Verificação da conexão com o banco de dados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "checking" && (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Verificando conexão...</p>
          </div>
        )}
        
        {status === "connected" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50">Conectado</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Agendamentos: {appointmentCount !== null ? appointmentCount : "N/A"}
            </p>
            <p className="text-sm text-muted-foreground">
              Clientes: {clientCount !== null ? clientCount : "N/A"}
            </p>
          </div>
        )}
        
        {status === "error" && (
          <div className="space-y-2">
            <Badge variant="outline" className="bg-red-50 text-red-700">Erro de Conexão</Badge>
            {errorMessage && (
              <p className="text-sm text-red-500">{errorMessage}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkConnection}
          disabled={status === "checking"}
        >
          {status === "checking" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verificar Novamente
        </Button>
      </CardFooter>
    </Card>
  )
} 