"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { toast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import moment from "moment"
import { useSupabase } from "./SupabaseContext"

// Transaction types
export type TransactionType = "income" | "expense"

// Transaction category
export type TransactionCategory = 
  | "service" // For service income
  | "product" // For product sales
  | "rent" // For rent expenses
  | "utilities" // For utilities expenses
  | "salary" // For salary expenses
  | "supplies" // For supplies expenses
  | "marketing" // For marketing expenses
  | "other" // For other expenses or income

// Transaction interface
export interface Transaction {
  id: string
  type: TransactionType
  category: TransactionCategory
  amount: number
  date: Date
  description: string
  relatedAppointmentId?: string
  relatedClientId?: string
  paymentMethod?: string
  notes?: string
}

// Daily summary interface
export interface DailySummary {
  id: string
  date: Date
  totalIncome: number
  totalExpense: number
  netBalance: number
  transactionCount: number
}

// Financial context type
interface FinancialContextType {
  transactions: Transaction[]
  isLoading: boolean
  dailySummaries: DailySummary[]
  currentDaySummary: DailySummary | null
  addTransaction: (transactionData: Omit<Transaction, "id">) => Promise<string>
  updateTransaction: (id: string, transactionData: Partial<Transaction>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  getTransactionsByDate: (date: Date) => Transaction[]
  getDailySummary: (date: Date) => DailySummary | null
  closeDailyOperations: (date: Date) => Promise<DailySummary>
}

// Create the context
const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

// Hook to use the financial context
export const useFinancial = () => {
  const context = useContext(FinancialContext)
  if (!context) {
    throw new Error("useFinancial must be used within a FinancialProvider")
  }
  return context
}

// Financial provider component
export function FinancialProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([])
  const [currentDaySummary, setCurrentDaySummary] = useState<DailySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { supabase } = useSupabase()

  // Load financial data from Supabase on start
  useEffect(() => {
    const loadFinancialData = async () => {
      try {
        console.log("Iniciando carregamento de dados financeiros...")
        
        // Check if Supabase is available
        if (!supabase) {
          throw new Error("Cliente Supabase não está disponível")
        }

        // Usar dados de exemplo por padrão
        const exampleTransactions = generateExampleTransactions()
        
        try {
          // Verificar se a tabela transactions existe
          console.log("Verificando se a tabela transactions existe...")
          const { error: checkError } = await supabase
            .from('transactions')
            .select('id')
            .limit(1)
          
          if (checkError) {
            console.error("Erro ao verificar tabela transactions:", checkError)
            throw checkError
          }
          
          console.log("Tabela transactions verificada com sucesso")
          
          // Fetch transactions
          console.log("Buscando transações...")
          const { data: transactionsData, error: transactionsError } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false })
          
          if (transactionsError) {
            console.error("Erro ao buscar transações:", transactionsError)
            throw transactionsError
          }
          
          console.log(`Encontradas ${transactionsData?.length || 0} transações`)
          
          if (transactionsData && transactionsData.length > 0) {
            // Convert date strings to Date objects
            const formattedTransactions = transactionsData.map((transaction: any) => ({
              id: transaction.id,
              description: transaction.description,
              amount: transaction.amount,
              type: transaction.type,
              category: transaction.category,
              date: new Date(transaction.date),
              paymentMethod: transaction.payment_method,
              notes: transaction.notes
            }))
            
            setTransactions(formattedTransactions)
            
            toast({
              title: "Dados carregados",
              description: `${formattedTransactions.length} transações carregadas do Supabase.`,
              variant: "default",
            })
          } else {
            console.log("Nenhuma transação encontrada, usando dados de exemplo...")
            setTransactions(exampleTransactions)
            
            toast({
              title: "Dados de exemplo",
              description: "Nenhuma transação encontrada. Usando dados de exemplo.",
              variant: "default",
            })
          }
        } catch (error) {
          console.error("Erro ao acessar tabela transactions:", error)
          setTransactions(exampleTransactions)
          
          toast({
            title: "Usando dados locais",
            description: "Não foi possível acessar a tabela de transações. Usando dados de exemplo locais.",
            variant: "destructive",
          })
        }
        
        try {
          // Buscar resumos diários
          console.log("Buscando resumos diários...")
          const { data: summaryData, error: summaryError } = await supabase
            .from('daily_summary')
            .select('*')
            .order('date', { ascending: false })
            .limit(30)
          
          if (summaryError) {
            console.error("Erro ao buscar resumos diários:", summaryError)
            throw summaryError
          }
          
          console.log(`Encontrados ${summaryData?.length || 0} resumos diários`)
          
          if (summaryData && summaryData.length > 0) {
            // Converter strings de data para objetos Date
            const formattedSummaries = summaryData.map((summary: any) => ({
              id: summary.id,
              date: new Date(summary.date),
              totalIncome: summary.total_income,
              totalExpense: summary.total_expense,
              netBalance: summary.net_balance,
              transactionCount: summary.transaction_count
            }))
            
            setDailySummaries(formattedSummaries)
          } else {
            // Se não houver resumos, usar dados vazios
            setDailySummaries([])
          }
        } catch (summaryError) {
          console.error("Erro ao carregar resumos diários:", summaryError)
          // Continuar mesmo com erro nos resumos
          setDailySummaries([])
        }
        
      } catch (error) {
        console.error("Erro ao carregar dados financeiros:", error)
        
        // Em caso de erro, usar dados de exemplo locais
        const exampleTransactions = generateExampleTransactions()
        setTransactions(exampleTransactions)
        
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados financeiros. Usando dados locais.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        console.log("Carregamento de dados financeiros concluído com sucesso")
      }
    }

    loadFinancialData()
  }, [supabase])

  // Add a new transaction
  const addTransaction = async (transactionData: Omit<Transaction, "id">) => {
    try {
      const newTransaction: Transaction = {
        ...transactionData,
        id: crypto.randomUUID()
      }
      
      // Adicionar ao estado local primeiro para feedback imediato
      setTransactions(prev => [newTransaction, ...prev])
      
      if (supabase) {
        try {
          // Adicionar ao Supabase
          const { error } = await supabase.from('transactions').insert({
            id: newTransaction.id,
            description: newTransaction.description,
            amount: newTransaction.amount,
            type: newTransaction.type,
            category: newTransaction.category,
            date: newTransaction.date.toISOString(),
            payment_method: newTransaction.paymentMethod,
            notes: newTransaction.notes
          })
          
          if (error) {
            console.error("Erro ao adicionar transação ao Supabase:", error)
            // Não revertemos o estado local para manter a experiência do usuário
          }
        } catch (error) {
          console.error("Erro ao adicionar transação ao Supabase:", error)
        }
      }
      
      return newTransaction.id
    } catch (error) {
      console.error("Erro ao adicionar transação:", error)
      throw error
    }
  }

  // Update an existing transaction
  const updateTransaction = async (id: string, transactionData: Partial<Transaction>) => {
    try {
      // Atualizar no estado local primeiro para feedback imediato
      setTransactions(prev => 
        prev.map(transaction => 
          transaction.id === id 
            ? { ...transaction, ...transactionData } 
            : transaction
        )
      )
      
      if (supabase) {
        try {
          // Preparar dados para o Supabase
          const supabaseData: any = {}
          
          if (transactionData.description) supabaseData.description = transactionData.description
          if (transactionData.amount) supabaseData.amount = transactionData.amount
          if (transactionData.type) supabaseData.type = transactionData.type
          if (transactionData.category) supabaseData.category = transactionData.category
          if (transactionData.date) supabaseData.date = transactionData.date.toISOString()
          if (transactionData.paymentMethod) supabaseData.payment_method = transactionData.paymentMethod
          if (transactionData.notes) supabaseData.notes = transactionData.notes
          
          // Atualizar no Supabase
          const { error } = await supabase
            .from('transactions')
            .update(supabaseData)
            .eq('id', id)
          
          if (error) {
            console.error("Erro ao atualizar transação no Supabase:", error)
          }
        } catch (error) {
          console.error("Erro ao atualizar transação no Supabase:", error)
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar transação:", error)
      throw error
    }
  }

  // Delete a transaction
  const deleteTransaction = async (id: string) => {
    try {
      // Remover do estado local primeiro para feedback imediato
      setTransactions(prev => prev.filter(transaction => transaction.id !== id))
      
      if (supabase) {
        try {
          // Remover do Supabase
          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id)
          
          if (error) {
            console.error("Erro ao excluir transação do Supabase:", error)
          }
        } catch (error) {
          console.error("Erro ao excluir transação do Supabase:", error)
        }
      }
    } catch (error) {
      console.error("Erro ao excluir transação:", error)
      throw error
    }
  }

  // Get transactions by date
  const getTransactionsByDate = (date: Date) => {
    const dateString = date.toDateString()
    return transactions.filter((tx) => tx.date.toDateString() === dateString)
  }

  // Get daily summary by date
  const getDailySummary = (date: Date) => {
    const dateString = date.toDateString()
    return dailySummaries.find((summary) => summary.date.toDateString() === dateString) || null
  }

  // Close daily operations and generate summary
  const closeDailyOperations = async (date: Date): Promise<DailySummary> => {
    try {
      // Get transactions for the specified date
      const dayTransactions = getTransactionsByDate(date)
      
      // Calculate totals
      let totalIncome = 0
      let totalExpense = 0
      
      dayTransactions.forEach(tx => {
        if (tx.type === 'income') {
          totalIncome += tx.amount
        } else {
          totalExpense += tx.amount
        }
      })
      
      const netBalance = totalIncome - totalExpense
      
      // Create or update daily summary
      const summaryDate = new Date(date)
      summaryDate.setHours(0, 0, 0, 0)
      
      // Check if summary already exists for this date
      const existingSummary = dailySummaries.find(
        s => s.date.toDateString() === summaryDate.toDateString()
      )
      
      let summary: DailySummary
      
      if (existingSummary) {
        // Update existing summary
        summary = {
          ...existingSummary,
          totalIncome,
          totalExpense,
          netBalance,
          transactionCount: dayTransactions.length,
        }
        
        // Update state
        setDailySummaries(prev => 
          prev.map(s => s.id === existingSummary.id ? summary : s)
        )
        
        // Update in Supabase
        if (supabase) {
          try {
            const { error } = await supabase
              .from('daily_summary')
              .update({
                total_income: summary.totalIncome,
                total_expense: summary.totalExpense,
                net_balance: summary.netBalance,
                transaction_count: summary.transactionCount
              })
              .eq('id', existingSummary.id)
            
            if (error) {
              console.error("Erro ao atualizar resumo diário:", error)
            }
          } catch (error) {
            console.error("Erro ao atualizar resumo diário no Supabase:", error)
          }
        }
      } else {
        // Create new summary
        summary = {
          id: crypto.randomUUID(),
          date: summaryDate,
          totalIncome,
          totalExpense,
          netBalance,
          transactionCount: dayTransactions.length
        }
        
        // Update state
        setDailySummaries(prev => [summary, ...prev])
        
        // Save to Supabase
        if (supabase) {
          try {
            const { error } = await supabase
              .from('daily_summary')
              .insert({
                id: summary.id,
                date: summary.date.toISOString().split('T')[0],
                total_income: summary.totalIncome,
                total_expense: summary.totalExpense,
                net_balance: summary.netBalance,
                transaction_count: summary.transactionCount
              })
              .select()
            
            if (error) {
              console.error("Erro ao criar resumo diário:", error)
            }
          } catch (error) {
            console.error("Erro ao criar resumo diário no Supabase:", error)
          }
        }
      }
      
      // Update current day summary if it's today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (summaryDate.toDateString() === today.toDateString()) {
        setCurrentDaySummary(summary)
      }
      
      return summary
    } catch (error) {
      console.error("Erro ao fechar operações diárias:", error)
      throw error
    }
  }

  // Context value
  const value = {
    transactions,
    isLoading,
    dailySummaries,
    currentDaySummary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionsByDate,
    getDailySummary,
    closeDailyOperations,
  }

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>
}

// Generate example transactions
function generateExampleTransactions(): Transaction[] {
  const today = new Date()
  const transactions: Transaction[] = []
  
  // Categories
  const incomeCategories: TransactionCategory[] = ["service", "product"]
  const expenseCategories: TransactionCategory[] = ["rent", "utilities", "salary", "supplies", "marketing", "other"]
  
  // Generate transactions for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    date.setHours(Math.floor(Math.random() * 10) + 8, 0, 0, 0) // Between 8am and 6pm
    
    // Generate 2-5 transactions per day
    const numTransactions = Math.floor(Math.random() * 4) + 2
    
    for (let j = 0; j < numTransactions; j++) {
      // 70% chance of income, 30% chance of expense
      const type: TransactionType = Math.random() < 0.7 ? "income" : "expense"
      
      // Select appropriate category
      const category = type === "income"
        ? incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
        : expenseCategories[Math.floor(Math.random() * expenseCategories.length)]
      
      // Generate random amount (income: €20-200, expense: €5-100)
      const amount = type === "income"
        ? Math.round((Math.random() * 180 + 20) * 100) / 100
        : Math.round((Math.random() * 95 + 5) * 100) / 100
      
      // Generate description
      let description = ""
      if (type === "income") {
        if (category === "service") {
          const services = ["Corte de Cabelo", "Coloração", "Manicure", "Pedicure", "Barba", "Tratamento Capilar"]
          description = services[Math.floor(Math.random() * services.length)]
        } else {
          const products = ["Shampoo", "Condicionador", "Máscara", "Gel", "Creme de Pentear", "Tintura"]
          description = `Venda de ${products[Math.floor(Math.random() * products.length)]}`
        }
      } else {
        if (category === "rent") {
          description = "Aluguel do espaço"
        } else if (category === "utilities") {
          const utilities = ["Água", "Luz", "Internet", "Telefone"]
          description = `Conta de ${utilities[Math.floor(Math.random() * utilities.length)]}`
        } else if (category === "salary") {
          description = "Pagamento de funcionário"
        } else if (category === "supplies") {
          description = "Compra de suprimentos"
        } else if (category === "marketing") {
          description = "Marketing e publicidade"
        } else {
          description = "Despesa diversa"
        }
      }
      
      // Create transaction
      const txDate = new Date(date)
      txDate.setMinutes(Math.floor(Math.random() * 60)) // Random minutes
      
      transactions.push({
        id: uuidv4(),
        type,
        category,
        amount,
        date: txDate,
        description,
        paymentMethod: type === "income" 
          ? ["Cartão", "Dinheiro", "Pix", "Transferência"][Math.floor(Math.random() * 4)]
          : ["Cartão", "Dinheiro", "Transferência"][Math.floor(Math.random() * 3)],
      })
    }
  }
  
  return transactions
} 