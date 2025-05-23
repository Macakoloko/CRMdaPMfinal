"use client"

import { useState, useEffect } from "react"
import { useFinancial, Transaction } from "@/context/FinancialContext"
import { useAppointments, Appointment } from "@/context/AppointmentContext"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import { Calendar, Clock, DollarSign, CreditCard, CheckCircle, XCircle, Loader2, ArrowUp, ArrowDown, Calculator } from "lucide-react"
import moment from "moment"
import "moment/locale/pt-br"

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

// Format date
const formatDate = (date: Date) => {
  return moment(date).format("DD/MM/YYYY")
}

// Format time
const formatTime = (date: Date) => {
  return moment(date).format("HH:mm")
}

export function DailyClosing() {
  const { appointments } = useAppointments()
  const { transactions, getTransactionsByDate, closeDailyOperations, dailySummaries } = useFinancial()
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [isClosingDay, setIsClosingDay] = useState(false)
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([])
  const [dayTransactions, setDayTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
    workHours: 0,
  })
  const [isDayAlreadyClosed, setIsDayAlreadyClosed] = useState(false)
  
  // Load day data when date changes
  useEffect(() => {
    loadDayData()
  }, [selectedDate, appointments, transactions, dailySummaries])
  
  const loadDayData = () => {
    const dateString = selectedDate.toDateString()
    
    // Get appointments for the day
    const filteredAppointments = appointments.filter(
      (app) => app.start.toDateString() === dateString
    )
    setDayAppointments(filteredAppointments)
    
    // Get transactions for the day
    const filteredTransactions = getTransactionsByDate(selectedDate)
    setDayTransactions(filteredTransactions)
    
    // Calculate summary
    const totalAppointments = filteredAppointments.length
    const completedAppointments = filteredAppointments.filter(
      (app) => app.status === "confirmed"
    ).length
    const pendingAppointments = filteredAppointments.filter(
      (app) => app.status === "pending"
    ).length
    const cancelledAppointments = filteredAppointments.filter(
      (app) => app.status === "cancelled"
    ).length
    
    // Calculate income, expenses and profit
    const totalIncome = filteredTransactions
      .filter((tx) => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0)
      
    const totalExpenses = filteredTransactions
      .filter((tx) => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0)
      
    const profit = totalIncome - totalExpenses
    
    // Calculate work hours
    let workMinutes = 0
    filteredAppointments
      .filter((app) => app.status === "confirmed")
      .forEach((app) => {
        const start = moment(app.start)
        const end = moment(app.end)
        workMinutes += end.diff(start, "minutes")
      })
    const workHours = Math.round((workMinutes / 60) * 10) / 10 // Round to 1 decimal
    
    setSummary({
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      cancelledAppointments,
      totalIncome,
      totalExpenses,
      profit,
      workHours,
    })
    
    // Check if day is already closed
    const isClosed = dailySummaries.some(
      (summary) => summary.date.toDateString() === dateString
    )
    setIsDayAlreadyClosed(isClosed)
  }
  
  const handleCloseDay = async () => {
    setIsClosingDay(true)
    try {
      await closeDailyOperations(selectedDate)
      toast({
        title: "Dia fechado com sucesso",
        description: `O fechamento do dia ${formatDate(selectedDate)} foi realizado com sucesso.`,
      })
      setIsDayAlreadyClosed(true)
    } catch (error) {
      console.error("Erro ao fechar o dia:", error)
      toast({
        title: "Erro",
        description: "Não foi possível fechar o dia. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsClosingDay(false)
    }
  }
  
  const handleDateChange = (date: string) => {
    setSelectedDate(new Date(date))
  }
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Calculator className="h-4 w-4" />
          Fechar Caixa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Fechamento de Caixa</DialogTitle>
          <DialogDescription>
            Visualize o resumo do dia e feche as operações diárias.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <input
                type="date"
                className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={moment(selectedDate).format("YYYY-MM-DD")}
                onChange={(e) => handleDateChange(e.target.value)}
                max={moment().format("YYYY-MM-DD")}
              />
            </div>
            <Badge variant={isDayAlreadyClosed ? "outline" : "default"}>
              {isDayAlreadyClosed ? "Dia Fechado" : "Dia Aberto"}
            </Badge>
          </div>
          
          <Tabs defaultValue="summary">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Resumo</TabsTrigger>
              <TabsTrigger value="appointments">Agendamentos</TabsTrigger>
              <TabsTrigger value="transactions">Transações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="summary" className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{summary.totalAppointments}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="flex items-center gap-1 text-green-500">
                          <CheckCircle className="h-3 w-3" />
                          <span className="text-sm">{summary.completedAppointments} concluídos</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Clock className="h-3 w-3" />
                          <span className="text-sm">{summary.pendingAppointments} pendentes</span>
                        </div>
                        <div className="flex items-center gap-1 text-red-500">
                          <XCircle className="h-3 w-3" />
                          <span className="text-sm">{summary.cancelledAppointments} cancelados</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Horas Trabalhadas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{summary.workHours}</p>
                        <p className="text-xs text-muted-foreground">Horas</p>
                      </div>
                      <Clock className="h-10 w-10 text-muted-foreground opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Resumo Financeiro</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-green-500">
                      <ArrowUp className="h-4 w-4" />
                      <span>Receitas</span>
                    </div>
                    <span className="font-medium">{formatCurrency(summary.totalIncome)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-500">
                      <ArrowDown className="h-4 w-4" />
                      <span>Despesas</span>
                    </div>
                    <span className="font-medium">{formatCurrency(summary.totalExpenses)}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-medium">
                      <Calculator className="h-4 w-4" />
                      <span>Lucro/Prejuízo</span>
                    </div>
                    <span 
                      className={`font-bold ${
                        summary.profit >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {formatCurrency(summary.profit)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="appointments">
              <ScrollArea className="h-[300px] pr-4">
                {dayAppointments.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {dayAppointments.map((appointment) => (
                      <Card key={appointment.id} className="overflow-hidden">
                        <div 
                          className="h-1" 
                          style={{ backgroundColor: appointment.color }}
                        />
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{appointment.client}</p>
                              <p className="text-sm text-muted-foreground">{appointment.service}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm">
                                {formatTime(appointment.start)} - {formatTime(appointment.end)}
                              </p>
                              <Badge 
                                variant={
                                  appointment.status === "confirmed"
                                    ? "default"
                                    : appointment.status === "pending"
                                      ? "outline"
                                      : "destructive"
                                }
                                className="mt-1"
                              >
                                {appointment.status === "confirmed"
                                  ? "Confirmado"
                                  : appointment.status === "pending"
                                    ? "Pendente"
                                    : "Cancelado"}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-muted-foreground">Nenhum agendamento para este dia.</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="transactions">
              <ScrollArea className="h-[300px] pr-4">
                {dayTransactions.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    {dayTransactions.map((transaction) => (
                      <Card key={transaction.id} className="overflow-hidden">
                        <div 
                          className="h-1" 
                          style={{ 
                            backgroundColor: transaction.type === "income" 
                              ? "var(--green-500)" 
                              : "var(--destructive)" 
                          }}
                        />
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{transaction.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {transaction.category} • {transaction.paymentMethod}
                              </p>
                            </div>
                            <div className="text-right">
                              <p 
                                className={`font-medium ${
                                  transaction.type === "income" 
                                    ? "text-green-500" 
                                    : "text-red-500"
                                }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(transaction.date)}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-muted-foreground">Nenhuma transação para este dia.</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleCloseDay} 
            disabled={isClosingDay || isDayAlreadyClosed}
            className="gap-2"
          >
            {isClosingDay ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : isDayAlreadyClosed ? (
              "Dia já fechado"
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Fechar o Dia
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 