"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { collection, getDocs, query, where, orderBy, limit, DocumentData, QueryDocumentSnapshot } from "firebase/firestore"
import { db } from "../services/firebase"

interface Expense {
  id: string
  description: string
  amount: number
  date: string
  category: string
  icon: string
}

// Mock data for fallback
const mockExpenses: Expense[] = [
  {
    id: "1",
    description: "Produtos para cabelo",
    amount: 1250.00,
    date: "22/07/2023",
    category: "Estoque",
    icon: "P",
  },
  {
    id: "2",
    description: "Aluguel do espaço",
    amount: 3500.00,
    date: "20/07/2023",
    category: "Fixo",
    icon: "A",
  },
  {
    id: "3",
    description: "Conta de energia",
    amount: 450.00,
    date: "18/07/2023",
    category: "Utilidades",
    icon: "E",
  },
  {
    id: "4",
    description: "Material de limpeza",
    amount: 320.00,
    date: "15/07/2023",
    category: "Manutenção",
    icon: "M",
  },
  {
    id: "5",
    description: "Pagamento funcionários",
    amount: 6500.00,
    date: "10/07/2023",
    category: "Pessoal",
    icon: "F",
  },
];

export function RecentExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchRecentExpenses = async () => {
      try {
        setIsLoading(true)
        
        // Use mock data for now
        setExpenses(mockExpenses);
        
        /*
        // Uncomment this when Firebase is properly set up
        // Get recent expenses
        const q = query(
          collection(db, "financeiro"),
          where("tipo", "==", "despesa"),
          orderBy("data", "desc"),
          limit(5)
        )
        
        const querySnapshot = await getDocs(q)
        const expensesList: Expense[] = []
        
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          const data = doc.data()
          
          // Define icon based on category
          let icon = "D"
          if (data.categoria === "Estoque") icon = "P"
          else if (data.categoria === "Fixo") icon = "A"
          else if (data.categoria === "Utilidades") icon = "E"
          else if (data.categoria === "Manutenção") icon = "M"
          else if (data.categoria === "Pessoal") icon = "F"
          
          expensesList.push({
            id: doc.id,
            description: data.descricao || "Despesa",
            amount: parseFloat(data.valor) || 0,
            date: data.data || new Date().toISOString().split('T')[0],
            category: data.categoria || "Outros",
            icon: icon
          })
        })
        
        setExpenses(expensesList)
        */
      } catch (error) {
        console.error("Error fetching recent expenses:", error)
        // Use mock data as fallback
        setExpenses(mockExpenses);
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRecentExpenses()
  }, [])

  if (isLoading) {
    return <div className="flex justify-center items-center h-[200px]">Carregando dados...</div>
  }

  // If no expenses found, show placeholder
  if (expenses.length === 0) {
    return <div className="text-center text-muted-foreground">Nenhuma despesa recente encontrada</div>
  }

  return (
    <div className="space-y-8">
      {expenses.map((expense) => (
        <div key={expense.id} className="flex items-center">
          <Avatar className="h-9 w-9 bg-primary/10">
            <AvatarFallback className="text-primary">{expense.icon}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{expense.description}</p>
            <p className="text-sm text-muted-foreground">
              {expense.date} • {expense.category}
            </p>
          </div>
          <div className="ml-auto font-medium">
            € {expense.amount.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
          </div>
        </div>
      ))}
    </div>
  )
}

