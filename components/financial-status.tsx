"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Check, X, DollarSign, ArrowDownCircle, ArrowUpCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  type: string
  amount: number
  date: string
  description: string
  category: string
  payment_method?: string
  notes?: string
}

export function FinancialStatus() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showConnectionStatus, setShowConnectionStatus] = useState(true)
  
  // Check connection and load data
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Test connection with Supabase through our API
        const response = await fetch('/api/financial/transactions?limit=1')
        
        if (!response.ok) {
          throw new Error(`Erro na conexão com API: ${response.statusText}`)
        }
        
        setConnectionStatus("connected")
        
        // Auto-hide connection status after 5 seconds if connected
        setTimeout(() => {
          setShowConnectionStatus(false)
        }, 5000)
        
        // Load transactions
        await loadTransactions()
      } catch (error: any) {
        console.error("Erro ao verificar conexão:", error)
        setConnectionStatus("error")
        setErrorMessage(error.message || "Erro desconhecido ao conectar com o banco de dados")
        setStatus("error")
      }
    }
    
    const loadTransactions = async () => {
      try {
        setIsLoading(true)
        
        const response = await fetch('/api/financial/transactions')
        
        if (!response.ok) {
          throw new Error(`Erro ao carregar transações: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (data.data && data.data.length > 0) {
          setTransactions(data.data)
          setStatus("success")
        } else {
          setTransactions([])
          setStatus("error")
        }
      } catch (error) {
        console.error("Erro ao carregar transações:", error)
        setStatus("error")
      } finally {
        setIsLoading(false)
      }
    }
    
    checkConnection()
  }, [])
  
  // Calculate totals
  const totalIncome = transactions
    .filter(tx => tx.type === "income")
    .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)
    
  const totalExpense = transactions
    .filter(tx => tx.type === "expense")
    .reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0)
    
  const balance = totalIncome - totalExpense

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Status Financeiro
          {(status === "loading" || connectionStatus === "checking") && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {status === "success" && connectionStatus === "connected" && (
            <Check className="h-4 w-4 text-green-500" />
          )}
          {(status === "error" || connectionStatus === "error") && (
            <X className="h-4 w-4 text-red-500" />
          )}
        </CardTitle>
        <CardDescription>
          Dados financeiros do Supabase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {(showConnectionStatus || connectionStatus === "error" || connectionStatus === "checking") && (
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Conexão Supabase:</span>
              <Badge variant={
                connectionStatus === "connected" ? "default" :
                connectionStatus === "error" ? "destructive" : "outline"
              }>
                {connectionStatus === "connected" && "Conectado"}
                {connectionStatus === "error" && "Erro"}
                {connectionStatus === "checking" && "Verificando..."}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Dados Financeiros:</span>
              <Badge variant={
                status === "success" ? "default" :
                status === "error" ? "destructive" : "outline"
              }>
                {status === "success" && "Carregados"}
                {status === "error" && "Erro"}
                {status === "loading" && "Carregando..."}
              </Badge>
            </div>
          </div>
        )}
        
        {connectionStatus === "error" && errorMessage && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4" />
              Erro de conexão:
            </div>
            <p className="mt-1">{errorMessage}</p>
            <p className="mt-2">
              Verifique se o script SQL foi executado corretamente no Supabase:
            </p>
            <ul className="mt-1 list-disc pl-5">
              <li>Acesse o painel do Supabase</li>
              <li>Vá para a seção SQL Editor</li>
              <li>Execute o script em scripts/create-financial-tables.sql</li>
            </ul>
            <div className="mt-3">
              <Link href="/configuracoes?tab=database" className="text-blue-600 hover:underline font-medium">
                Ir para configurações do Banco de Dados
              </Link>
            </div>
          </div>
        )}
        
        {status === "success" && connectionStatus === "connected" && (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Receitas</span>
                </div>
                <div className="mt-2 text-2xl font-bold">€{totalIncome.toFixed(2)}</div>
              </div>
              
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <ArrowDownCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Despesas</span>
                </div>
                <div className="mt-2 text-2xl font-bold">€{totalExpense.toFixed(2)}</div>
              </div>
              
              <div className="rounded-lg border bg-card p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Saldo</span>
                </div>
                <div className={`mt-2 text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  €{balance.toFixed(2)}
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border p-3">
              <h3 className="mb-2 text-sm font-medium">Transações recentes</h3>
              <div className="space-y-2">
                {transactions.slice(0, 3).map(tx => (
                  <div key={tx.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                    <div className="flex items-center gap-2">
                      {tx.type === "income" ? (
                        <ArrowUpCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span>{tx.description}</span>
                    </div>
                    <div className={tx.type === "income" ? "text-green-600" : "text-red-600"}>
                      {tx.type === "income" ? "+" : "-"}€{parseFloat(tx.amount.toString()).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
        
        {status === "error" && connectionStatus === "connected" && (
          <div className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4" />
              Nenhum dado financeiro encontrado
            </div>
            <p className="mt-1">
              A conexão com o Supabase está funcionando, mas não foram encontrados dados financeiros.
              Tente adicionar algumas transações.
            </p>
            <div className="mt-3">
              <Link href="/configuracoes?tab=database" className="text-blue-600 hover:underline font-medium">
                Ir para configurações do Banco de Dados
              </Link>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => window.location.reload()}
          disabled={status === "loading" || connectionStatus === "checking"}
          variant="outline"
          className="w-full"
        >
          {(status === "loading" || connectionStatus === "checking") && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Atualizar Dados
        </Button>
      </CardFooter>
    </Card>
  )
} 