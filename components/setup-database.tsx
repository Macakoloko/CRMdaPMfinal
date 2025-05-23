"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Check, AlertCircle, ExternalLink } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

export function SetupDatabase() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupStatus, setSetupStatus] = useState<"idle" | "success" | "error">("idle")
  const [fixStatus, setFixStatus] = useState<"idle" | "success" | "error">("idle")
  const [procStatus, setProcStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fixErrorMessage, setFixErrorMessage] = useState<string | null>(null)
  const [procErrorMessage, setProcErrorMessage] = useState<string | null>(null)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [manualSetupInfo, setManualSetupInfo] = useState<{
    required: boolean;
    scriptContent?: string;
    sqlToRun?: string;
  }>({ required: false })
  const [showManual, setShowManual] = useState(false)

  // Clear timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const setupFinancialTables = async () => {
    try {
      setIsLoading(true)
      setSetupStatus("idle")
      setErrorMessage(null)
      setManualSetupInfo({ required: false })
      
      // Set a timeout to reset loading state after 15 seconds
      const timeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false)
          setSetupStatus("error")
          setErrorMessage("A operação demorou muito tempo. Tente novamente ou use a configuração manual.")
          toast.error("Tempo esgotado. Tente a configuração manual.")
          setManualSetupInfo({ required: true })
        }
      }, 15000)
      setTimeoutId(timeout)
      
      const response = await fetch('/api/setup-financial-tables')
      const data = await response.json()
      
      // Clear the timeout as we got a response
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
      
      if (!response.ok) {
        if (data.manualSetupRequired) {
          setManualSetupInfo({
            required: true,
            scriptContent: data.scriptContent
          })
        }
        throw new Error(data.error || 'Falha ao configurar tabelas financeiras')
      }
      
      setSetupStatus("success")
      toast.success("Tabelas financeiras configuradas com sucesso!")
    } catch (error: any) {
      console.error("Erro ao configurar tabelas:", error)
      setSetupStatus("error")
      setErrorMessage(error.message)
      toast.error("Erro ao configurar tabelas financeiras")
    } finally {
      // Clear any remaining timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
      setIsLoading(false)
    }
  }

  const fixTransactionsTable = async () => {
    try {
      setIsLoading(true)
      setFixStatus("idle")
      setFixErrorMessage(null)
      setManualSetupInfo({ required: false })
      
      // Set a timeout to reset loading state after 15 seconds
      const timeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false)
          setFixStatus("error")
          setFixErrorMessage("A operação demorou muito tempo. Tente novamente ou use a configuração manual.")
          toast.error("Tempo esgotado. Tente a configuração manual.")
          setManualSetupInfo({ required: true })
        }
      }, 15000)
      setTimeoutId(timeout)
      
      const response = await fetch('/api/fix-transactions-table')
      const data = await response.json()
      
      // Clear the timeout as we got a response
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
      
      if (!response.ok) {
        if (data.manualSetupRequired) {
          setManualSetupInfo({
            required: true,
            sqlToRun: data.sqlToRun
          })
        }
        throw new Error(data.error || 'Falha ao corrigir tabela de transações')
      }
      
      setFixStatus("success")
      toast.success("Tabela de transações corrigida com sucesso!")
    } catch (error: any) {
      console.error("Erro ao corrigir tabela:", error)
      setFixStatus("error")
      setFixErrorMessage(error.message)
      toast.error("Erro ao corrigir tabela de transações")
    } finally {
      // Clear any remaining timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
      setIsLoading(false)
    }
  }
  
  const setupStoredProcedure = async () => {
    try {
      setIsLoading(true)
      setProcStatus("idle")
      setProcErrorMessage(null)
      setManualSetupInfo({ required: false })
      
      // Set a timeout to reset loading state after 15 seconds
      const timeout = setTimeout(() => {
        if (isLoading) {
          setIsLoading(false)
          setProcStatus("error")
          setProcErrorMessage("A operação demorou muito tempo. Tente novamente ou use a configuração manual.")
          toast.error("Tempo esgotado. Tente a configuração manual.")
          setManualSetupInfo({ required: true })
        }
      }, 15000)
      setTimeoutId(timeout)
      
      const response = await fetch('/api/setup-stored-procedure')
      const data = await response.json()
      
      // Clear the timeout as we got a response
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
      
      if (!response.ok) {
        if (data.manualSetupRequired) {
          setManualSetupInfo({
            required: true,
            scriptContent: data.scriptContent
          })
        }
        throw new Error(data.error || 'Falha ao configurar procedimento armazenado')
      }
      
      setProcStatus("success")
      toast.success("Procedimento armazenado configurado com sucesso!")
    } catch (error: any) {
      console.error("Erro ao configurar procedimento:", error)
      setProcStatus("error")
      setProcErrorMessage(error.message)
      toast.error("Erro ao configurar procedimento armazenado")
    } finally {
      // Clear any remaining timeout
      if (timeoutId) {
        clearTimeout(timeoutId)
        setTimeoutId(null)
      }
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Procedimento Armazenado</h3>
            <p className="text-sm text-muted-foreground">
              Configura o procedimento armazenado necessário para executar comandos SQL
            </p>
          </div>
          <Button 
            onClick={setupStoredProcedure} 
            disabled={isLoading}
            variant={procStatus === "success" ? "outline" : "default"}
          >
            {isLoading && procStatus !== "success" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {procStatus === "success" && <Check className="mr-2 h-4 w-4 text-green-500" />}
            {procStatus === "success" ? "Configurado" : "Configurar"}
          </Button>
        </div>
        
        {procStatus === "error" && procErrorMessage && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4" />
              Erro:
            </div>
            <p className="mt-1">{procErrorMessage}</p>
            
            {manualSetupInfo.required && (
              <div className="mt-3">
                <p className="font-semibold">Configuração manual necessária:</p>
                <p className="mt-1">Clique abaixo para ver as instruções de configuração manual.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowManual(!showManual)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {showManual ? "Ocultar Instruções Manuais" : "Ver Instruções Manuais"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="rounded-md border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Tabelas Financeiras</h3>
            <p className="text-sm text-muted-foreground">
              Configura as tabelas necessárias para o módulo financeiro
            </p>
          </div>
          <Button 
            onClick={setupFinancialTables} 
            disabled={isLoading}
            variant={setupStatus === "success" ? "outline" : "default"}
          >
            {isLoading && setupStatus !== "success" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {setupStatus === "success" && <Check className="mr-2 h-4 w-4 text-green-500" />}
            {setupStatus === "success" ? "Configurado" : "Configurar"}
          </Button>
        </div>
        
        {setupStatus === "error" && errorMessage && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4" />
              Erro:
            </div>
            <p className="mt-1">{errorMessage}</p>
            
            {manualSetupInfo.required && (
              <div className="mt-3">
                <p className="font-semibold">Configuração manual necessária:</p>
                <p className="mt-1">Clique abaixo para ver as instruções de configuração manual.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowManual(!showManual)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {showManual ? "Ocultar Instruções Manuais" : "Ver Instruções Manuais"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="rounded-md border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Corrigir Tabela de Transações</h3>
            <p className="text-sm text-muted-foreground">
              Adiciona a coluna 'notes' à tabela de transações (corrige o erro "Could not find the 'notes' column")
            </p>
          </div>
          <Button 
            onClick={fixTransactionsTable} 
            disabled={isLoading}
            variant={fixStatus === "success" ? "outline" : "default"}
          >
            {isLoading && fixStatus !== "success" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {fixStatus === "success" && <Check className="mr-2 h-4 w-4 text-green-500" />}
            {fixStatus === "success" ? "Corrigido" : "Corrigir"}
          </Button>
        </div>
        
        {fixStatus === "error" && fixErrorMessage && (
          <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-800">
            <div className="flex items-center gap-2 font-semibold">
              <AlertCircle className="h-4 w-4" />
              Erro:
            </div>
            <p className="mt-1">{fixErrorMessage}</p>
            
            {manualSetupInfo.required && (
              <div className="mt-3">
                <p className="font-semibold">Configuração manual necessária:</p>
                <p className="mt-1">Clique abaixo para ver as instruções de configuração manual.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowManual(!showManual)}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {showManual ? "Ocultar Instruções Manuais" : "Ver Instruções Manuais"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {(setupStatus === "error" || procStatus === "error" || fixStatus === "error") && (
        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Configuração Manual Recomendada</AlertTitle>
          <AlertDescription>
            Devido a erros na configuração automática, recomendamos usar a configuração manual.
            Clique no botão "Ver Instruções Manuais" acima para ver as instruções detalhadas.
          </AlertDescription>
        </Alert>
      )}
      
      {showManual && (
        <div className="mt-6 space-y-6 rounded-md border p-6">
          <h3 className="text-lg font-medium">Configuração Manual</h3>
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">1. Configurar Procedimento Armazenado</h4>
            <p className="text-sm text-muted-foreground">
              Acesse o painel do Supabase, vá para a seção "SQL Editor" e execute o seguinte comando:
            </p>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">
                {`-- Create stored procedure to execute SQL commands
-- This is needed for the setup API to work
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void AS $$
BEGIN
  EXECUTE sql;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`}
              </pre>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Configurar Tabelas Financeiras</h4>
            <p className="text-sm text-muted-foreground">
              Execute o seguinte comando para criar as tabelas financeiras:
            </p>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">
                {`-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL CHECK (category IN ('service', 'product', 'rent', 'utilities', 'salary', 'supplies', 'marketing', 'other')),
  amount NUMERIC(10, 2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT NOT NULL,
  related_appointment_id UUID,
  related_client_id UUID,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily_summaries table
CREATE TABLE IF NOT EXISTS daily_summaries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  total_income NUMERIC(10, 2) NOT NULL,
  total_expenses NUMERIC(10, 2) NOT NULL,
  profit NUMERIC(10, 2) NOT NULL,
  completed_appointments INTEGER NOT NULL,
  total_work_hours NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);`}
              </pre>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Corrigir Tabela de Transações</h4>
            <p className="text-sm text-muted-foreground">
              Se estiver com o erro "Could not find the 'notes' column", execute o seguinte comando:
            </p>
            <div className="bg-muted p-4 rounded-md overflow-x-auto">
              <pre className="text-sm">
                {`ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS notes TEXT;`}
              </pre>
            </div>
          </div>
        </div>
      )}
      
      <p className="text-xs text-muted-foreground mt-4">
        Nota: A configuração das tabelas é necessária apenas uma vez.
      </p>
    </div>
  )
} 