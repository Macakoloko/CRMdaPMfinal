"use client"

import { useState, useEffect } from "react"
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend,
  Line,
  ComposedChart,
  Area
} from "recharts"
import { useFinancial } from "@/context/FinancialContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import moment from "moment"
import "moment/locale/pt-br"

// Data point interface
interface RevenueDataPoint {
  name: string
  revenue: number
  expenses: number
  profit: number
}

// Chart period type
type ChartPeriod = "daily" | "weekly" | "monthly" | "yearly"

export function EnhancedRevenueChart() {
  const { transactions, isLoading } = useFinancial()
  const [chartData, setChartData] = useState<RevenueDataPoint[]>([])
  const [period, setPeriod] = useState<ChartPeriod>("monthly")
  const [activeView, setActiveView] = useState<"bar" | "line" | "area" | "composed">("composed")
  const [year, setYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    if (!isLoading && transactions.length > 0) {
      generateChartData()
    }
  }, [isLoading, transactions, period, year])

  const generateChartData = () => {
    if (period === "monthly") {
      generateMonthlyData()
    } else if (period === "weekly") {
      generateWeeklyData()
    } else if (period === "daily") {
      generateDailyData()
    } else {
      generateYearlyData()
    }
  }

  const generateMonthlyData = () => {
    const months = [
      "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", 
      "Jul", "Ago", "Set", "Out", "Nov", "Dez"
    ]
    
    const monthlyData: RevenueDataPoint[] = months.map((name, index) => ({
      name,
      revenue: 0,
      expenses: 0,
      profit: 0
    }))
    
    // Filter transactions for the selected year
    const yearTransactions = transactions.filter(tx => {
      const txYear = tx.date.getFullYear()
      return txYear === year
    })
    
    // Aggregate by month
    yearTransactions.forEach(tx => {
      const month = tx.date.getMonth()
      if (tx.type === "income") {
        monthlyData[month].revenue += tx.amount
      } else {
        monthlyData[month].expenses += tx.amount
      }
    })
    
    // Calculate profit
    monthlyData.forEach(data => {
      data.profit = data.revenue - data.expenses
    })
    
    setChartData(monthlyData)
  }
  
  const generateWeeklyData = () => {
    // Get start and end of the year
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    
    // Create array for weeks (max 53 weeks in a year)
    const weeklyData: RevenueDataPoint[] = []
    
    // Filter transactions for the selected year
    const yearTransactions = transactions.filter(tx => {
      const txYear = tx.date.getFullYear()
      return txYear === year
    })
    
    // Group by week
    for (let week = 1; week <= 53; week++) {
      const weekStart = moment().year(year).isoWeek(week).startOf('isoWeek').toDate()
      const weekEnd = moment().year(year).isoWeek(week).endOf('isoWeek').toDate()
      
      // Skip weeks outside the year
      if (weekStart > endDate || weekEnd < startDate) continue
      
      const weekTransactions = yearTransactions.filter(tx => {
        const txDate = new Date(tx.date)
        return txDate >= weekStart && txDate <= weekEnd
      })
      
      const revenue = weekTransactions
        .filter(tx => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0)
        
      const expenses = weekTransactions
        .filter(tx => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0)
        
      weeklyData.push({
        name: `S${week}`,
        revenue,
        expenses,
        profit: revenue - expenses
      })
    }
    
    setChartData(weeklyData)
  }
  
  const generateDailyData = () => {
    // Get current month and year
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    // Use selected year and current month
    const month = year === currentYear ? currentMonth : 0
    
    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    // Create array for days
    const dailyData: RevenueDataPoint[] = []
    
    // Filter transactions for the selected month and year
    const monthTransactions = transactions.filter(tx => {
      const txYear = tx.date.getFullYear()
      const txMonth = tx.date.getMonth()
      return txYear === year && txMonth === month
    })
    
    // Group by day
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      
      const dayTransactions = monthTransactions.filter(tx => {
        const txDate = new Date(tx.date)
        return txDate.getDate() === day
      })
      
      const revenue = dayTransactions
        .filter(tx => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0)
        
      const expenses = dayTransactions
        .filter(tx => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0)
        
      dailyData.push({
        name: `${day}`,
        revenue,
        expenses,
        profit: revenue - expenses
      })
    }
    
    setChartData(dailyData)
  }
  
  const generateYearlyData = () => {
    // Create array for the last 5 years
    const yearlyData: RevenueDataPoint[] = []
    
    const currentYear = new Date().getFullYear()
    const startYear = currentYear - 4
    
    for (let yr = startYear; yr <= currentYear; yr++) {
      const yearTransactions = transactions.filter(tx => {
        const txYear = tx.date.getFullYear()
        return txYear === yr
      })
      
      const revenue = yearTransactions
        .filter(tx => tx.type === "income")
        .reduce((sum, tx) => sum + tx.amount, 0)
        
      const expenses = yearTransactions
        .filter(tx => tx.type === "expense")
        .reduce((sum, tx) => sum + tx.amount, 0)
        
      yearlyData.push({
        name: `${yr}`,
        revenue,
        expenses,
        profit: revenue - expenses
      })
    }
    
    setChartData(yearlyData)
  }

  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="flex h-[350px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Carregando dados...</span>
        </div>
      )
    }

    if (activeView === "bar") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`€ ${value.toLocaleString("pt-PT")}`, ""]}
              contentStyle={{ 
                backgroundColor: "var(--background)", 
                borderColor: "var(--border)",
                borderRadius: "8px"
              }}
              itemStyle={{ padding: "2px 0" }}
            />
            <Legend />
            <Bar 
              name="Receita" 
              dataKey="revenue" 
              fill="var(--primary)" 
              radius={[4, 4, 0, 0]} 
              className="fill-primary" 
            />
            <Bar 
              name="Despesas" 
              dataKey="expenses" 
              fill="var(--destructive)" 
              radius={[4, 4, 0, 0]} 
              className="fill-destructive" 
            />
            <Bar 
              name="Lucro" 
              dataKey="profit" 
              fill="var(--green-500)" 
              radius={[4, 4, 0, 0]} 
              className="fill-green-500" 
            />
          </BarChart>
        </ResponsiveContainer>
      )
    }
    
    if (activeView === "line") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`€ ${value.toLocaleString("pt-PT")}`, ""]}
              contentStyle={{ 
                backgroundColor: "var(--background)", 
                borderColor: "var(--border)",
                borderRadius: "8px"
              }}
              itemStyle={{ padding: "2px 0" }}
            />
            <Legend />
            <Line 
              name="Receita" 
              type="monotone" 
              dataKey="revenue" 
              stroke="var(--primary)" 
              strokeWidth={2} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              name="Despesas" 
              type="monotone" 
              dataKey="expenses" 
              stroke="var(--destructive)" 
              strokeWidth={2} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }} 
            />
            <Line 
              name="Lucro" 
              type="monotone" 
              dataKey="profit" 
              stroke="var(--green-500)" 
              strokeWidth={2} 
              dot={{ r: 4 }} 
              activeDot={{ r: 6 }} 
            />
          </BarChart>
        </ResponsiveContainer>
      )
    }
    
    if (activeView === "area") {
      return (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="name" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip
              formatter={(value: number) => [`€ ${value.toLocaleString("pt-PT")}`, ""]}
              contentStyle={{ 
                backgroundColor: "var(--background)", 
                borderColor: "var(--border)",
                borderRadius: "8px"
              }}
              itemStyle={{ padding: "2px 0" }}
            />
            <Legend />
            <Area 
              name="Receita" 
              type="monotone" 
              dataKey="revenue" 
              fill="var(--primary)" 
              stroke="var(--primary)" 
              fillOpacity={0.3} 
            />
            <Area 
              name="Despesas" 
              type="monotone" 
              dataKey="expenses" 
              fill="var(--destructive)" 
              stroke="var(--destructive)" 
              fillOpacity={0.3} 
            />
            <Area 
              name="Lucro" 
              type="monotone" 
              dataKey="profit" 
              fill="var(--green-500)" 
              stroke="var(--green-500)" 
              fillOpacity={0.3} 
            />
          </BarChart>
        </ResponsiveContainer>
      )
    }
    
    // Default: composed chart
    return (
      <ResponsiveContainer width="100%" height={350}>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            stroke="#888888" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `€${value}`}
          />
          <Tooltip
            formatter={(value: number) => [`€ ${value.toLocaleString("pt-PT")}`, ""]}
            contentStyle={{ 
              backgroundColor: "var(--background)", 
              borderColor: "var(--border)",
              borderRadius: "8px"
            }}
            itemStyle={{ padding: "2px 0" }}
          />
          <Legend />
          <Bar 
            name="Receita" 
            dataKey="revenue" 
            fill="var(--primary)" 
            radius={[4, 4, 0, 0]} 
            className="fill-primary" 
          />
          <Bar 
            name="Despesas" 
            dataKey="expenses" 
            fill="var(--destructive)" 
            radius={[4, 4, 0, 0]} 
            className="fill-destructive" 
          />
          <Line 
            name="Lucro" 
            type="monotone" 
            dataKey="profit" 
            stroke="var(--green-500)" 
            strokeWidth={2} 
            dot={{ r: 4 }} 
            activeDot={{ r: 6 }} 
          />
        </ComposedChart>
      </ResponsiveContainer>
    )
  }

  const years = []
  const currentYear = new Date().getFullYear()
  for (let i = currentYear - 4; i <= currentYear; i++) {
    years.push(i)
  }

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Análise Financeira</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(value) => setPeriod(value as ChartPeriod)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Diário</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="yearly">Anual</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((yr) => (
                  <SelectItem key={yr} value={yr.toString()}>
                    {yr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardDescription>
          Visualize sua receita, despesas e lucro ao longo do tempo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="composed" onValueChange={(value) => setActiveView(value as any)}>
          <TabsList className="mb-4 grid w-full grid-cols-4">
            <TabsTrigger value="composed">Combinado</TabsTrigger>
            <TabsTrigger value="bar">Barras</TabsTrigger>
            <TabsTrigger value="line">Linhas</TabsTrigger>
            <TabsTrigger value="area">Área</TabsTrigger>
          </TabsList>
          <TabsContent value="composed">{renderChart()}</TabsContent>
          <TabsContent value="bar">{renderChart()}</TabsContent>
          <TabsContent value="line">{renderChart()}</TabsContent>
          <TabsContent value="area">{renderChart()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 