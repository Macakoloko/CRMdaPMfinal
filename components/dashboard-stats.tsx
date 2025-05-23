"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFinancial } from "@/context/FinancialContext"
import { useAppointments } from "@/context/AppointmentContext"
import { motion } from "framer-motion"
import { Activity, CreditCard, DollarSign, Users, Calendar, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

// Format currency
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value)
}

// Format percentage
const formatPercentage = (value: number) => {
  return `${value.toFixed(1)}%`
}

// Calculate percentage change
const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return 100
  return ((current - previous) / previous) * 100
}

// Animated counter component
const AnimatedCounter = ({ 
  value, 
  prefix = "", 
  suffix = "",
  duration = 1.5,
  decimals = 0
}: { 
  value: number
  prefix?: string
  suffix?: string
  duration?: number
  decimals?: number
}) => {
  const [displayValue, setDisplayValue] = useState(0)
  
  useEffect(() => {
    let startTime: number
    let animationFrameId: number
    
    const updateValue = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      
      setDisplayValue(Math.floor(progress * value))
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateValue)
      } else {
        setDisplayValue(value)
      }
    }
    
    animationFrameId = requestAnimationFrame(updateValue)
    
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [value, duration])
  
  return (
    <div className="text-2xl font-bold">
      {prefix}
      {decimals > 0 
        ? (displayValue / Math.pow(10, decimals)).toFixed(decimals) 
        : displayValue}
      {suffix}
    </div>
  )
}

// Stat card component
interface StatCardProps {
  title: string
  value: number
  previousValue: number
  icon: React.ElementType
  iconColor: string
  borderColor: string
  prefix?: string
  suffix?: string
  decimals?: number
  link?: string
  isLoading?: boolean
}

const StatCard = ({
  title,
  value,
  previousValue,
  icon: Icon,
  iconColor,
  borderColor,
  prefix = "",
  suffix = "",
  decimals = 0,
  link,
  isLoading = false
}: StatCardProps) => {
  const percentChange = calculateChange(value, previousValue)
  const isPositive = percentChange >= 0
  
  return (
    <Card className={`overflow-hidden border-l-4 ${borderColor}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <AnimatedCounter 
            value={value} 
            prefix={prefix} 
            suffix={suffix} 
            decimals={decimals}
          />
        )}
        
        <div className="mt-1 flex items-center gap-1">
          <span 
            className={`text-xs ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatPercentage(percentChange)}
          </span>
          <span className="text-xs text-muted-foreground">
            em relação ao mês anterior
          </span>
        </div>
        
        {link && (
          <div className="mt-2">
            <Link href={link}>
              <Button variant="outline" size="sm" className="w-full">
                Ver detalhes
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Goal progress component
interface GoalProgressProps {
  title: string
  current: number
  target: number
  icon: React.ElementType
  iconColor: string
  prefix?: string
  suffix?: string
  isLoading?: boolean
}

const GoalProgress = ({
  title,
  current,
  target,
  icon: Icon,
  iconColor,
  prefix = "",
  suffix = "",
  isLoading = false
}: GoalProgressProps) => {
  const percentage = Math.min(Math.round((current / target) * 100), 100)
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-6 w-24" />
          </>
        ) : (
          <>
            <Progress value={percentage} className="h-2" />
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>
                {prefix}
                {current}
                {suffix}
              </span>
              <span className="text-muted-foreground">
                Meta: {prefix}
                {target}
                {suffix}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardStats() {
  const { transactions, isLoading: isLoadingFinancial } = useFinancial()
  const { appointments, isLoading: isLoadingAppointments } = useAppointments()
  const [stats, setStats] = useState({
    revenue: 0,
    previousRevenue: 0,
    expenses: 0,
    previousExpenses: 0,
    clients: 0,
    previousClients: 0,
    appointments: 0,
    previousAppointments: 0,
    returnRate: 0,
    previousReturnRate: 0,
    averageTicket: 0,
    previousAverageTicket: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    if (!isLoadingFinancial && !isLoadingAppointments) {
      calculateStats()
    }
  }, [isLoadingFinancial, isLoadingAppointments, transactions, appointments])
  
  const calculateStats = () => {
    // Get current date info
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Get previous month info
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
    
    // Filter transactions by month
    const currentMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date)
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear
    })
    
    const previousMonthTransactions = transactions.filter(tx => {
      const txDate = new Date(tx.date)
      return txDate.getMonth() === previousMonth && txDate.getFullYear() === previousMonthYear
    })
    
    // Calculate revenue
    const revenue = currentMonthTransactions
      .filter(tx => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0)
      
    const previousRevenue = previousMonthTransactions
      .filter(tx => tx.type === "income")
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    // Calculate expenses
    const expenses = currentMonthTransactions
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0)
      
    const previousExpenses = previousMonthTransactions
      .filter(tx => tx.type === "expense")
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    // Filter appointments by month
    const currentMonthAppointments = appointments.filter(app => {
      const appDate = new Date(app.start)
      return appDate.getMonth() === currentMonth && appDate.getFullYear() === currentYear
    })
    
    const previousMonthAppointments = appointments.filter(app => {
      const appDate = new Date(app.start)
      return appDate.getMonth() === previousMonth && appDate.getFullYear() === previousMonthYear
    })
    
    // Count appointments
    const appointmentsCount = currentMonthAppointments.length
    const previousAppointmentsCount = previousMonthAppointments.length
    
    // Get unique clients
    const uniqueClients = new Set(currentMonthAppointments.map(app => app.clientId)).size
    const previousUniqueClients = new Set(previousMonthAppointments.map(app => app.clientId)).size
    
    // Calculate return rate (clients with more than one appointment)
    const clientAppointmentCounts = new Map<string, number>()
    currentMonthAppointments.forEach(app => {
      const count = clientAppointmentCounts.get(app.clientId) || 0
      clientAppointmentCounts.set(app.clientId, count + 1)
    })
    
    const returningClients = Array.from(clientAppointmentCounts.values()).filter(count => count > 1).length
    const returnRate = uniqueClients > 0 ? (returningClients / uniqueClients) * 100 : 0
    
    const previousClientAppointmentCounts = new Map<string, number>()
    previousMonthAppointments.forEach(app => {
      const count = previousClientAppointmentCounts.get(app.clientId) || 0
      previousClientAppointmentCounts.set(app.clientId, count + 1)
    })
    
    const previousReturningClients = Array.from(previousClientAppointmentCounts.values()).filter(count => count > 1).length
    const previousReturnRate = previousUniqueClients > 0 ? (previousReturningClients / previousUniqueClients) * 100 : 0
    
    // Calculate average ticket
    const averageTicket = appointmentsCount > 0 ? revenue / appointmentsCount : 0
    const previousAverageTicket = previousAppointmentsCount > 0 ? previousRevenue / previousAppointmentsCount : 0
    
    setStats({
      revenue,
      previousRevenue,
      expenses,
      previousExpenses,
      clients: uniqueClients,
      previousClients: previousUniqueClients,
      appointments: appointmentsCount,
      previousAppointments: previousAppointmentsCount,
      returnRate,
      previousReturnRate,
      averageTicket,
      previousAverageTicket
    })
    
    setIsLoading(false)
  }
  
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Receita Total"
        value={stats.revenue}
        previousValue={stats.previousRevenue}
        icon={DollarSign}
        iconColor="text-green-500"
        borderColor="border-l-green-500"
        prefix="€ "
        decimals={2}
        link="/financeiro"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Clientes"
        value={stats.clients}
        previousValue={stats.previousClients}
        icon={Users}
        iconColor="text-blue-500"
        borderColor="border-l-blue-500"
        prefix="+"
        link="/clientes"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Despesas"
        value={stats.expenses}
        previousValue={stats.previousExpenses}
        icon={CreditCard}
        iconColor="text-red-500"
        borderColor="border-l-red-500"
        prefix="€ "
        decimals={2}
        link="/financeiro"
        isLoading={isLoading}
      />
      
      <StatCard
        title="Agendamentos"
        value={stats.appointments}
        previousValue={stats.previousAppointments}
        icon={Calendar}
        iconColor="text-purple-500"
        borderColor="border-l-purple-500"
        prefix="+"
        link="/agendamentos"
        isLoading={isLoading}
      />
      
      <GoalProgress
        title="Taxa de Retorno"
        current={Math.round(stats.returnRate)}
        target={80}
        icon={TrendingUp}
        iconColor="text-emerald-500"
        suffix="%"
        isLoading={isLoading}
      />
      
      <GoalProgress
        title="Ticket Médio"
        current={Math.round(stats.averageTicket)}
        target={100}
        icon={Activity}
        iconColor="text-amber-500"
        prefix="€ "
        isLoading={isLoading}
      />
    </div>
  )
} 