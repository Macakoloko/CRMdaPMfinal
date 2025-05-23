"use client"

import { useState, useEffect } from "react"
import { useSupabase } from "@/context/SupabaseContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X, RefreshCw } from "lucide-react"

export function SupabaseClientStatus() {
  const { supabase } = useSupabase()
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking")
  const [clientCount, setClientCount] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCreatingTable, setIsCreatingTable] = useState(false)

  const checkConnection = async () => {
    setStatus("checking")
    setErrorMessage(null)
    
    try {
      // Test connection by fetching the count of clients
      const { count, error } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error("Erro na tabela clients:", error)
        throw error
      }
      
      setClientCount(count)
      setStatus("connected")
    } catch (error: any) {
      console.error("Erro na conexão com Supabase:", error)
      setStatus("error")
      setErrorMessage(error.message || "Erro desconhecido ao conectar com o Supabase")
    }
  }

  const createClientsTable = async () => {
    setIsCreatingTable(true)
    try {
      // Criar tabela clients
      const { error: createClientsError } = await supabase
        .from('clients')
        .insert([
          {
            name: 'Cliente Exemplo',
            email: 'exemplo@email.com',
            phone: '123456789',
            birth_date: new Date().toISOString(),
            address: 'Endereço de exemplo',
            postal_code: '12345-678',
            city: 'Cidade Exemplo',
            notes: 'Cliente criado para teste',
            initials: 'CE',
            status: 'active'
          }
        ])
        .select()

      if (createClientsError) {
        console.error("Erro ao criar tabela clients:", createClientsError)
        
        // Se o erro for porque a tabela não existe, vamos para o painel do Supabase
        if (createClientsError.message.includes("does not exist")) {
          setErrorMessage(`A tabela 'clients' não existe. Por favor, acesse o painel do Supabase para criar as tabelas necessárias.`)
          
          // Abrir o painel do Supabase em uma nova aba
          window.open('https://app.supabase.com/project/aribaiysmgwwyoemdyxr/editor', '_blank')
        } else {
          setErrorMessage(`Erro ao criar tabela: ${createClientsError.message}`)
        }
        
        setStatus("error")
        return
      }

      // Criar tabela client_services
      const { error: createServicesError } = await supabase
        .from('client_services')
        .insert([
          {
            client_id: '00000000-0000-0000-0000-000000000000', // ID fictício, será substituído
            service_name: 'Serviço Exemplo',
            service_date: new Date().toISOString(),
            price: 100.00,
            notes: 'Serviço criado para teste'
          }
        ])
        .select()

      if (createServicesError) {
        console.error("Erro ao criar tabela client_services:", createServicesError)
        setErrorMessage(`Erro ao criar tabela de serviços: ${createServicesError.message}`)
        setStatus("error")
        return
      }

      // Verificar se as tabelas foram criadas
      await checkConnection()
    } catch (error: any) {
      console.error("Erro ao criar tabelas:", error)
      setErrorMessage(`Erro ao criar tabelas: ${error.message || "Erro desconhecido"}`)
      setStatus("error")
    } finally {
      setIsCreatingTable(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          Status da Tabela de Clientes
          {status === "checking" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "connected" && <Check className="h-4 w-4 text-green-500" />}
          {status === "error" && <X className="h-4 w-4 text-red-500" />}
        </CardTitle>
        <CardDescription>
          Verificação da conexão com a tabela de clientes no Supabase
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
              <Badge variant="outline" className="bg-green-50 text-green-700">Conectado</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Clientes cadastrados: {clientCount !== null ? clientCount : "N/A"}
            </p>
          </div>
        )}
        
        {status === "error" && (
          <div className="space-y-2">
            <Badge variant="outline" className="bg-red-50 text-red-700">Erro de Conexão</Badge>
            {errorMessage && (
              <p className="text-sm text-red-500 mt-2">{errorMessage}</p>
            )}
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                As tabelas necessárias podem não existir no Supabase. Você tem algumas opções para resolver isso:
              </p>
              <div className="flex flex-col gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={createClientsTable}
                  disabled={isCreatingTable}
                >
                  {isCreatingTable ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando tabelas...
                    </>
                  ) : (
                    <>
                      Tentar criar tabelas
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://app.supabase.com/project/aribaiysmgwwyoemdyxr/editor', '_blank')}
                >
                  Abrir painel do Supabase
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href="/setup">Ir para página de configuração</a>
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Se as opções acima não funcionarem, você pode executar o script SQL manualmente no painel do Supabase. 
                  O script está disponível em <code className="bg-muted px-1 py-0.5 rounded">scripts/create-tables.sql</code>.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={checkConnection}
          disabled={status === "checking"}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Verificar novamente
        </Button>
      </CardFooter>
    </Card>
  )
} 