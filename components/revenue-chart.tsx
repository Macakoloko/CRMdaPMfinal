"use client"

import { useEffect, useState } from "react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { collection, getDocs, query, where, orderBy, DocumentData, QueryDocumentSnapshot } from "firebase/firestore"
import { db } from "../services/firebase"

interface RevenueDataPoint {
  name: string
  total: number
}

interface Transaction {
  id: string
  tipo: string
  valor: string | number
  data: string
  [key: string]: any
}

// Mock data for fallback
const mockRevenueData: RevenueDataPoint[] = [
  { name: "Jan", total: 18000 },
  { name: "Fev", total: 23500 },
  { name: "Mar", total: 29000 },
  { name: "Abr", total: 32000 },
  { name: "Mai", total: 38000 },
  { name: "Jun", total: 42000 },
  { name: "Jul", total: 45231 },
  { name: "Ago", total: 41500 },
  { name: "Set", total: 39000 },
  { name: "Out", total: 42700 },
  { name: "Nov", total: 47800 },
  { name: "Dez", total: 51200 },
];

export function RevenueChart() {
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>(mockRevenueData)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setIsLoading(true)
        // Use mock data for now
        setRevenueData(mockRevenueData)
        /*
        // Uncomment this when Firebase is properly set up
        const currentYear = new Date().getFullYear()
        const startOfYear = new Date(currentYear, 0, 1)
        
        // Get all revenue transactions from the current year
        const q = query(
          collection(db, "financeiro"),
          where("tipo", "==", "receita"),
          where("data", ">=", startOfYear.toISOString().split('T')[0]),
          orderBy("data", "asc")
        )
        
        const querySnapshot = await getDocs(q)
        const transactions: Transaction[] = []
        
        querySnapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
          transactions.push({ id: doc.id, ...doc.data() } as Transaction)
        })
        
        // Group by month and sum revenues
        const monthlyData: RevenueDataPoint[] = [
          { name: "Jan", total: 0 },
          { name: "Fev", total: 0 },
          { name: "Mar", total: 0 },
          { name: "Abr", total: 0 },
          { name: "Mai", total: 0 },
          { name: "Jun", total: 0 },
          { name: "Jul", total: 0 },
          { name: "Ago", total: 0 },
          { name: "Set", total: 0 },
          { name: "Out", total: 0 },
          { name: "Nov", total: 0 },
          { name: "Dez", total: 0 },
        ]
        
        transactions.forEach((transaction) => {
          const date = new Date(transaction.data)
          const month = date.getMonth()
          monthlyData[month].total += parseFloat(transaction.valor as string) || 0
        })
        
        setRevenueData(monthlyData)
        */
      } catch (error) {
        console.error("Error fetching revenue data:", error)
        // Use mock data as fallback
        setRevenueData(mockRevenueData)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchRevenueData()
  }, [])

  if (isLoading) {
    return <div className="flex justify-center items-center h-[350px]">Carregando dados...</div>
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={revenueData}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `€${value / 1000}k`}
        />
        <Tooltip
          formatter={(value: number) => [`€ ${value.toLocaleString("pt-PT")}`, "Receita"]}
          labelFormatter={(label) => `Mês: ${label}`}
        />
        <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
      </BarChart>
    </ResponsiveContainer>
  )
}

