"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  CreditCard, 
  DollarSign, 
  Users, 
  Calendar, 
  Scissors, 
  TrendingUp, 
  BarChart3, 
  Bell, 
  CalendarPlus, 
  CalendarSearch, 
  ShoppingCart, 
  Receipt, 
  FileText, 
  UserPlus, 
  Package, 
  PackagePlus, 
  Edit, 
  Plus,
  ListChecks
} from "lucide-react"
import { RecentExpenses } from "@/components/recent-expenses"
import { MonthlyBirthdays } from "@/components/monthly-birthdays"
import { PopularServices } from "@/components/popular-services"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DashboardStats } from "@/components/dashboard-stats"
import { EnhancedRevenueChart } from "@/components/enhanced-revenue-chart"
import { DailyClosing } from "@/components/daily-closing"
import { useState } from "react"
import { NewAppointmentDialog } from "@/components/new-appointment-dialog"
import { NewClientDialog } from "@/components/new-client-dialog"
import { NewSaleDialog } from "@/components/new-sale-dialog"
import { NewServiceDialog } from "@/components/new-service-dialog"
import { NewExpenseDialog } from "@/components/new-expense-dialog"
import { useAuth } from "@/context/AuthContext"

// Componente para o botão de acesso rápido
function QuickAccessButton({ 
  icon: Icon, 
  label, 
  color, 
  onClick, 
  dialogTitle, 
  dialogContent,
  href
}: { 
  icon: React.ElementType; 
  label: string; 
  color: string;
  onClick?: () => void;
  dialogTitle?: string;
  dialogContent?: React.ReactNode;
  href?: string;
}) {
  if (href) {
    return (
      <Link href={href}>
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24 w-full gap-2 p-2 hover:border-primary hover:bg-primary/5"
        >
          <Icon className={`h-8 w-8 ${color}`} />
          <span className="text-xs text-center">{label}</span>
        </Button>
      </Link>
    );
  }

  if (onClick) {
    return (
      <Button 
        variant="outline" 
        className="flex flex-col items-center justify-center h-24 w-full gap-2 p-2 hover:border-primary hover:bg-primary/5"
        onClick={onClick}
      >
        <Icon className={`h-8 w-8 ${color}`} />
        <span className="text-xs text-center">{label}</span>
      </Button>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-24 w-full gap-2 p-2 hover:border-primary hover:bg-primary/5"
        >
          <Icon className={`h-8 w-8 ${color}`} />
          <span className="text-xs text-center">{label}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        {dialogContent}
      </DialogContent>
    </Dialog>
  );
}

// Componente para a seção de acesso rápido
function QuickAccessSection({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="h-5 w-5 text-primary" />
        <h3 className="font-medium">{title}</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false)
  const [isNewSaleDialogOpen, setIsNewSaleDialogOpen] = useState(false)
  const [isNewExpenseDialogOpen, setIsNewExpenseDialogOpen] = useState(false)
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false)
  const [isEditStockDialogOpen, setIsEditStockDialogOpen] = useState(false)
  const [isNewProductDialogOpen, setIsNewProductDialogOpen] = useState(false)
  const [isNewServiceDialogOpen, setIsNewServiceDialogOpen] = useState(false)
  const { user } = useAuth()
  
  return (
    <div className="flex flex-col">      
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight">Painel de Controle</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Olá, {user?.user_metadata?.name || 'Usuário'}</span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.open('/manual_usuario.html', '_blank')}
            >
              Manual do Usuário
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="analytics">Análises</TabsTrigger>
            <TabsTrigger value="quick-access">Acesso Fácil</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-4">
            <DashboardStats />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardContent className="p-0">
                  <EnhancedRevenueChart />
                </CardContent>
              </Card>
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Serviços Mais Populares</CardTitle>
                </CardHeader>
                <CardContent>
                  <PopularServices />
                </CardContent>
              </Card>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Últimas Despesas</CardTitle>
                </CardHeader>
                <CardContent>
                  <RecentExpenses />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Aniversários do Mês</CardTitle>
                </CardHeader>
                <CardContent>
                  <MonthlyBirthdays />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="overflow-hidden border-l-4 border-l-emerald-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Taxa de Retorno</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">76%</div>
                  <p className="text-xs text-muted-foreground">+2% em relação ao mês anterior</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-l-4 border-l-pink-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Serviços por Cliente</CardTitle>
                  <Scissors className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.3</div>
                  <p className="text-xs text-muted-foreground">Média mensal por cliente</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden border-l-4 border-l-amber-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
                  <Activity className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€ 78,90</div>
                  <p className="text-xs text-muted-foreground">+5.2% em relação ao mês anterior</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="quick-access" className="space-y-6">
            <div className="grid gap-6">
              <QuickAccessSection title="Agendamentos" icon={Calendar}>
                <QuickAccessButton 
                  icon={CalendarPlus} 
                  label="Novo Agendamento" 
                  color="text-purple-500"
                  onClick={() => setIsNewAppointmentDialogOpen(true)}
                />
                <QuickAccessButton 
                  icon={CalendarSearch} 
                  label="Consultar Agendamentos" 
                  color="text-purple-500"
                  href="/agendamentos"
                />
              </QuickAccessSection>

              <QuickAccessSection title="Financeiro" icon={DollarSign}>
                <QuickAccessButton 
                  icon={ShoppingCart} 
                  label="Nova Venda" 
                  color="text-green-500"
                  onClick={() => setIsNewSaleDialogOpen(true)}
                />
                <QuickAccessButton 
                  icon={Receipt} 
                  label="Nova Despesa" 
                  color="text-red-500"
                  onClick={() => setIsNewExpenseDialogOpen(true)}
                />
                <QuickAccessButton 
                  icon={FileText} 
                  label="Relatórios" 
                  color="text-blue-500"
                  href="/financeiro/relatorios"
                />
                <QuickAccessButton 
                  icon={BarChart3} 
                  label="Visão Geral" 
                  color="text-amber-500"
                  href="/financeiro"
                />
              </QuickAccessSection>

              <QuickAccessSection title="Clientes" icon={Users}>
                <QuickAccessButton 
                  icon={UserPlus} 
                  label="Novo Cliente" 
                  color="text-indigo-500"
                  onClick={() => setIsNewClientDialogOpen(true)}
                />
                <QuickAccessButton 
                  icon={Users} 
                  label="Lista de Clientes" 
                  color="text-indigo-500"
                  href="/clientes"
                />
              </QuickAccessSection>

              <QuickAccessSection title="Estoque" icon={Package}>
                <QuickAccessButton 
                  icon={Edit} 
                  label="Editar Estoque" 
                  color="text-orange-500"
                  onClick={() => setIsEditStockDialogOpen(true)}
                />
                <QuickAccessButton 
                  icon={PackagePlus} 
                  label="Novo Produto" 
                  color="text-orange-500"
                  onClick={() => setIsNewProductDialogOpen(true)}
                />
                <QuickAccessButton 
                  icon={Package} 
                  label="Ver Estoque" 
                  color="text-orange-500"
                  href="/produtos"
                />
              </QuickAccessSection>

              <QuickAccessSection title="Serviços" icon={Scissors}>
                <QuickAccessButton 
                  icon={Plus} 
                  label="Novo Serviço" 
                  color="text-pink-500"
                  onClick={() => setIsNewServiceDialogOpen(true)}
                />
                <QuickAccessButton 
                  icon={Scissors} 
                  label="Lista de Serviços" 
                  color="text-pink-500"
                  href="/servicos"
                />
                <QuickAccessButton 
                  icon={ListChecks} 
                  label="Categorias" 
                  color="text-pink-500"
                  href="/servicos/categorias"
                />
              </QuickAccessSection>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Diálogos */}
      <NewAppointmentDialog
        open={isNewAppointmentDialogOpen}
        onOpenChange={setIsNewAppointmentDialogOpen}
      />
      <NewSaleDialog
        open={isNewSaleDialogOpen}
        onOpenChange={setIsNewSaleDialogOpen}
      />
      <NewExpenseDialog
        open={isNewExpenseDialogOpen}
        onOpenChange={setIsNewExpenseDialogOpen}
      />
      <NewClientDialog
        open={isNewClientDialogOpen}
        onOpenChange={setIsNewClientDialogOpen}
      />
      <NewServiceDialog
        open={isNewServiceDialogOpen}
        onOpenChange={setIsNewServiceDialogOpen}
      />
    </div>
  )
} 