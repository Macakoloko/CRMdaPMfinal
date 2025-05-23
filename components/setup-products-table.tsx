"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Check, AlertCircle, ExternalLink, Database } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useSupabase } from "@/context/SupabaseContext"

export function SetupProductsTable() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupStatus, setSetupStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showScript, setShowScript] = useState(false)
  const { supabase } = useSupabase()

  const createProductsTable = async () => {
    try {
      setIsLoading(true)
      setSetupStatus("idle")
      setErrorMessage(null)
      
      // SQL para criar a tabela de produtos
      const sql = `
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          nome TEXT NOT NULL,
          descricao TEXT,
          preco TEXT NOT NULL,
          custo TEXT NOT NULL,
          estoque TEXT NOT NULL,
          estoqueMinimo TEXT NOT NULL DEFAULT '5',
          categoria TEXT NOT NULL,
          fornecedor TEXT,
          codigoBarras TEXT,
          dataAtualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          vendas INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Função para obter o estoque mínimo
        CREATE OR REPLACE FUNCTION get_estoque_minimo()
        RETURNS TEXT AS $$
        BEGIN
          RETURN '5';
        END;
        $$ LANGUAGE plpgsql;
        
        -- Trigger para atualizar o timestamp de updated_at
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        -- Aplicar o trigger à tabela products
        DROP TRIGGER IF EXISTS update_products_updated_at ON products;
        CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `
      
      // Executar o SQL no Supabase
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
      
      if (error) {
        console.error('Erro ao criar tabela de produtos:', error)
        setSetupStatus("error")
        setErrorMessage(`Erro ao criar tabela de produtos: ${error.message}`)
        toast.error("Erro ao configurar tabela de produtos")
        return
      }
      
      setSetupStatus("success")
      toast.success("Tabela de produtos configurada com sucesso!")
    } catch (error: any) {
      console.error("Erro ao configurar tabela:", error)
      setSetupStatus("error")
      setErrorMessage(`Erro: ${error.message}`)
      toast.error("Erro ao configurar tabela de produtos")
    } finally {
      setIsLoading(false)
    }
  }

  const fixProductsTable = async () => {
    try {
      setIsLoading(true)
      setSetupStatus("idle")
      setErrorMessage(null)
      
      // SQL para corrigir possíveis problemas na tabela de produtos
      const sql = `
        -- Verificar e adicionar colunas faltantes
        DO $$
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'products' AND column_name = 'descricao') THEN
            ALTER TABLE products ADD COLUMN descricao TEXT;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'products' AND column_name = 'fornecedor') THEN
            ALTER TABLE products ADD COLUMN fornecedor TEXT;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'products' AND column_name = 'codigoBarras') THEN
            ALTER TABLE products ADD COLUMN codigoBarras TEXT;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'products' AND column_name = 'vendas') THEN
            ALTER TABLE products ADD COLUMN vendas INTEGER DEFAULT 0;
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'products' AND column_name = 'created_at') THEN
            ALTER TABLE products ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                        WHERE table_name = 'products' AND column_name = 'updated_at') THEN
            ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
          END IF;
        END $$;
        
        -- Recria a função get_estoque_minimo caso não exista
        CREATE OR REPLACE FUNCTION get_estoque_minimo()
        RETURNS TEXT AS $$
        BEGIN
          RETURN '5';
        END;
        $$ LANGUAGE plpgsql;
        
        -- Recria o trigger de atualização
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
        
        DROP TRIGGER IF EXISTS update_products_updated_at ON products;
        CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `
      
      // Executar o SQL no Supabase
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql })
      
      if (error) {
        console.error('Erro ao corrigir tabela de produtos:', error)
        setSetupStatus("error")
        setErrorMessage(`Erro ao corrigir tabela de produtos: ${error.message}`)
        toast.error("Erro ao corrigir tabela de produtos")
        return
      }
      
      setSetupStatus("success")
      toast.success("Tabela de produtos corrigida com sucesso!")
    } catch (error: any) {
      console.error("Erro ao corrigir tabela:", error)
      setSetupStatus("error")
      setErrorMessage(`Erro: ${error.message}`)
      toast.error("Erro ao corrigir tabela de produtos")
    } finally {
      setIsLoading(false)
    }
  }

  const sqlScript = `
-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco TEXT NOT NULL,
  custo TEXT NOT NULL,
  estoque TEXT NOT NULL,
  estoqueMinimo TEXT NOT NULL DEFAULT '5',
  categoria TEXT NOT NULL,
  fornecedor TEXT,
  codigoBarras TEXT,
  dataAtualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  vendas INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função para obter o estoque mínimo
CREATE OR REPLACE FUNCTION get_estoque_minimo()
RETURNS TEXT AS $$
BEGIN
  RETURN '5';
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar o timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar o trigger à tabela products
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
  `

  return (
    <div className="space-y-6">
      <div className="rounded-md border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Tabela de Produtos</h3>
            <p className="text-sm text-muted-foreground">
              Cria ou atualiza a tabela de produtos no banco de dados
            </p>
          </div>
          <Button 
            onClick={createProductsTable} 
            disabled={isLoading}
            variant={setupStatus === "success" ? "outline" : "default"}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
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
            
            <div className="mt-3">
              <p className="font-semibold">Configuração manual necessária:</p>
              <p className="mt-1">Execute o seguinte script SQL no painel do Supabase:</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setShowScript(!showScript)}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                {showScript ? "Ocultar Script SQL" : "Ver Script SQL"}
              </Button>
            </div>
            
            {showScript && (
              <div className="mt-3 overflow-auto rounded bg-slate-900 p-2 text-xs text-slate-50">
                <pre>{sqlScript}</pre>
              </div>
            )}
          </div>
        )}
        
        {setupStatus === "success" && (
          <div className="mt-3 rounded-md bg-green-50 p-3 text-sm text-green-800">
            <div className="flex items-center gap-2 font-semibold">
              <Check className="h-4 w-4" />
              Tabela de produtos configurada com sucesso!
            </div>
          </div>
        )}
      </div>
      
      <div className="rounded-md border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Corrigir Tabela de Produtos</h3>
            <p className="text-sm text-muted-foreground">
              Corrige problemas na estrutura da tabela de produtos
            </p>
          </div>
          <Button 
            onClick={fixProductsTable} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Corrigir Tabela
          </Button>
        </div>
      </div>
    </div>
  )
} 