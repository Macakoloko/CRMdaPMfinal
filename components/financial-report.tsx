"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts"
import { TooltipProps } from 'recharts'
import { Loader2 } from "lucide-react"

interface FinancialDataPoint {
  name: string
  receitas: number
  despesas: number
  lucro: number
  numeroTransacoes?: number
  ticketMedio?: number
  crescimentoMensal?: number
}

interface FinancialSummary {
  receitas: number
  despesas: number
  lucro: number
  margemLucro: number
  numeroTransacoes: number
  ticketMedio: number
  crescimentoMensal?: number
  principaisDespesas: { categoria: string; valor: number }[]
  principaisReceitas: { categoria: string; valor: number }[]
}

// Tooltip customizado
const CustomTooltip = ({ active, payload, label }: TooltipProps<any, any>) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded border bg-white p-2 shadow text-xs text-gray-800">
        <div className="font-semibold mb-1">Mês: {label}</div>
        {payload.map((entry: any, idx: number) => (
          <div key={idx} style={{ color: entry.color }}>
            <span className="font-medium">{entry.name}:</span> € {Number(entry.value).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
          </div>
        ))}
      </div>
    )
  }
  return null;
};

export function FinancialReport() {
  const [year, setYear] = useState(new Date().getFullYear().toString())
  const [monthlyData, setMonthlyData] = useState<FinancialDataPoint[]>([])
  const [currentMonthSummary, setCurrentMonthSummary] = useState<FinancialSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState("")
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(["receitas", "despesas", "lucro"])
  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar")
  const [dateRange, setDateRange] = useState<"month" | "quarter" | "year">("month")
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true)
        
        // Calculate current month name
        const currentDate = new Date()
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
                            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"]
        setCurrentMonth(monthNames[currentDate.getMonth()])
        
        // Fetch yearly data for chart
        const yearStart = `${year}-01-01`
        const yearEnd = `${year}-12-31`
        
        const yearlyResponse = await fetch(`/api/financial/summary?startDate=${yearStart}&endDate=${yearEnd}&period=year`)
        
        if (!yearlyResponse.ok) {
          throw new Error('Falha ao carregar dados financeiros anuais')
        }
        
        const yearlyData = await yearlyResponse.json()
        
        if (yearlyData.summary.monthlyData) {
          // Transform API data to chart format
          const chartData: FinancialDataPoint[] = yearlyData.summary.monthlyData.map((item: any) => ({
            name: item.month,
            receitas: item.income,
            despesas: item.expense,
            lucro: item.profit
          }))
          
          setMonthlyData(chartData)
        }
        
        // Fetch current month summary
        const today = new Date()
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString()
        const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString()
        
        const monthResponse = await fetch(`/api/financial/summary?startDate=${currentMonthStart}&endDate=${currentMonthEnd}`)
        
        if (!monthResponse.ok) {
          throw new Error('Falha ao carregar resumo do mês atual')
        }
        
        const monthData = await monthResponse.json()
        
        // Calculate ticket médio
        const ticketMedio = monthData.summary.transactionCount > 0 
          ? monthData.summary.income / monthData.summary.transactionCount 
          : 0
        
        // Format summary data
        const summary: FinancialSummary = {
          receitas: monthData.summary.income,
          despesas: monthData.summary.expense,
          lucro: monthData.summary.profit,
          margemLucro: monthData.summary.profitMargin,
          numeroTransacoes: monthData.summary.transactionCount,
          ticketMedio: ticketMedio,
          principaisDespesas: monthData.summary.expenseCategories.map((item: any) => ({
            categoria: mapCategoryFromDB(item.category),
            valor: item.amount
          })),
          principaisReceitas: monthData.summary.incomeCategories.map((item: any) => ({
            categoria: mapCategoryFromDB(item.category),
            valor: item.amount
          }))
        }
        
        setCurrentMonthSummary(summary)
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error)
        // Use empty data if there's an error
        setMonthlyData([])
        setCurrentMonthSummary({
          receitas: 0,
          despesas: 0,
          lucro: 0,
          margemLucro: 0,
          numeroTransacoes: 0,
          ticketMedio: 0,
          principaisDespesas: [],
          principaisReceitas: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchFinancialData()
  }, [year, dateRange])
  
  // Map database category to display category
  function mapCategoryFromDB(dbCategory: string): string {
    const mapping: Record<string, string> = {
      "service": "Serviços",
      "product": "Produtos",
      "rent": "Aluguel",
      "salary": "Salários",
      "supplies": "Insumos",
      "marketing": "Marketing",
      "utilities": "Utilities",
      "other": "Outros"
    }
    
    return mapping[dbCategory] || "Outros"
  }

  const renderMetricCard = (title: string, value: number | string, color: string = "black", subtitle?: string) => (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
      <div className={`mt-1 text-2xl font-bold`} style={{ color }}>
        {typeof value === 'number' ? 
          `€ ${value.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}` : 
          value}
      </div>
      {subtitle && <div className="text-xs text-muted-foreground mt-1">{subtitle}</div>}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex h-40 w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2022">2022</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={dateRange} onValueChange={(value: "month" | "quarter" | "year") => setDateRange(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mensal</SelectItem>
              <SelectItem value="quarter">Trimestral</SelectItem>
              <SelectItem value="year">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {currentMonthSummary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {renderMetricCard("Receitas", currentMonthSummary.receitas, "#16a34a")}
          {renderMetricCard("Despesas", currentMonthSummary.despesas, "#dc2626")}
          {renderMetricCard("Lucro", currentMonthSummary.lucro, currentMonthSummary.lucro >= 0 ? "#2563eb" : "#dc2626")}
          {renderMetricCard("Margem de Lucro", `${currentMonthSummary.margemLucro.toFixed(1)}%`, 
            currentMonthSummary.margemLucro >= 0 ? "#16a34a" : "#dc2626")}
        </div>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle>Receitas vs. Despesas ({year})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="receitas" name="Receitas" fill="#16a34a" />
                <Bar dataKey="despesas" name="Despesas" fill="#dc2626" />
                {selectedMetrics.includes("lucro") && (
                  <Bar dataKey="lucro" name="Lucro" fill="#2563eb" />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {currentMonthSummary && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Principais Categorias de Receita</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentMonthSummary.principaisReceitas.length > 0 ? (
                    currentMonthSummary.principaisReceitas.map((item, index) => (
                      <div key={index} className="flex items-center justify-between rounded-md border p-2">
                        <span>{item.categoria}</span>
                        <span className="font-medium">
                          € {item.valor.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhuma receita registrada
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Principais Categorias de Despesa</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentMonthSummary.principaisDespesas.length > 0 ? (
                    currentMonthSummary.principaisDespesas.map((item, index) => (
                      <div key={index} className="flex items-center justify-between rounded-md border p-2">
                        <span>{item.categoria}</span>
                        <span className="font-medium">
                          € {item.valor.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Nenhuma despesa registrada
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {renderMetricCard("Transações", currentMonthSummary.numeroTransacoes, "black", "Total de transações no mês")}
            {renderMetricCard("Ticket Médio", currentMonthSummary.ticketMedio, "black", "Valor médio por transação")}
            {renderMetricCard("Mês Atual", currentMonth, "black", "Período de análise")}
          </div>
        </>
      )}
    </div>
  )
}

