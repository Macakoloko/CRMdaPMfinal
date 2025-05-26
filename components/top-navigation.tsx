"use client"

import { Bell, ExternalLink, Calendar, Package, Users, DollarSign, CalendarPlus, CalendarSearch, ShoppingCart, Receipt, FileText, UserPlus, Plus, PackagePlus, Edit, ListChecks, Scissors, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DailyClosing } from "@/components/daily-closing"
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
  href
}: { 
  icon: React.ElementType; 
  label: string; 
  color: string;
  onClick?: () => void;
  href?: string;
}) {
  if (href) {
    return (
      <Link href={href}>
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center h-20 w-full gap-2 p-2 hover:border-primary hover:bg-primary/5"
        >
          <Icon className={`h-6 w-6 ${color}`} />
          <span className="text-xs text-center">{label}</span>
        </Button>
      </Link>
    );
  }

  return (
    <Button 
      variant="outline" 
      className="flex flex-col items-center justify-center h-20 w-full gap-2 p-2 hover:border-primary hover:bg-primary/5"
      onClick={onClick}
    >
      <Icon className={`h-6 w-6 ${color}`} />
      <span className="text-xs text-center">{label}</span>
    </Button>
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
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {children}
      </div>
    </div>
  );
}

export function TopNavigation() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [isQuickAccessOpen, setIsQuickAccessOpen] = useState(false)
  const [isNewAppointmentDialogOpen, setIsNewAppointmentDialogOpen] = useState(false)
  const [isNewSaleDialogOpen, setIsNewSaleDialogOpen] = useState(false)
  const [isNewExpenseDialogOpen, setIsNewExpenseDialogOpen] = useState(false)
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false)
  const [isNewServiceDialogOpen, setIsNewServiceDialogOpen] = useState(false)
  const { user, signOut } = useAuth()
  
  // Obter as iniciais do nome do usuário
  const getUserInitials = () => {
    if (!user?.user_metadata?.name) return "U";
    const nameParts = user.user_metadata.name.split(' ');
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <>
      <div className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-xl font-semibold md:hidden">CRM Salão</h2>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="outline" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">3</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notificações</DialogTitle>
                  <DialogDescription>
                    Suas notificações recentes
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/20 p-2">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Novo agendamento</h4>
                      <p className="text-sm text-muted-foreground">Maria Silva agendou um corte para hoje às 15:00</p>
                      <p className="text-xs text-muted-foreground mt-1">Há 30 minutos</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/20 p-2">
                      <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Estoque baixo</h4>
                      <p className="text-sm text-muted-foreground">Shampoo XYZ está com estoque abaixo do mínimo</p>
                      <p className="text-xs text-muted-foreground mt-1">Há 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="rounded-full bg-primary/20 p-2">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">Novo cliente</h4>
                      <p className="text-sm text-muted-foreground">João Costa foi cadastrado no sistema</p>
                      <p className="text-xs text-muted-foreground mt-1">Há 1 dia</p>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <DailyClosing />
            <Dialog open={isQuickAccessOpen} onOpenChange={setIsQuickAccessOpen}>
              <DialogTrigger asChild>
                <Button>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Acesso Rápido
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Acesso Rápido</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <QuickAccessSection title="Agendamentos" icon={Calendar}>
                    <QuickAccessButton 
                      icon={CalendarPlus} 
                      label="Novo Agendamento" 
                      color="text-purple-500"
                      onClick={() => {
                        setIsQuickAccessOpen(false);
                        setIsNewAppointmentDialogOpen(true);
                      }}
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
                      onClick={() => {
                        setIsQuickAccessOpen(false);
                        setIsNewSaleDialogOpen(true);
                      }}
                    />
                    <QuickAccessButton 
                      icon={Receipt} 
                      label="Nova Despesa" 
                      color="text-red-500"
                      onClick={() => {
                        setIsQuickAccessOpen(false);
                        setIsNewExpenseDialogOpen(true);
                      }}
                    />
                    <QuickAccessButton 
                      icon={FileText} 
                      label="Ver Relatório" 
                      color="text-blue-500"
                      href="/financeiro"
                    />
                  </QuickAccessSection>

                  <QuickAccessSection title="Clientes" icon={Users}>
                    <QuickAccessButton 
                      icon={UserPlus} 
                      label="Novo Cliente" 
                      color="text-blue-500"
                      onClick={() => {
                        setIsQuickAccessOpen(false);
                        setIsNewClientDialogOpen(true);
                      }}
                    />
                    <QuickAccessButton 
                      icon={Users} 
                      label="Ver Clientes" 
                      color="text-blue-500"
                      href="/clientes"
                    />
                  </QuickAccessSection>

                  <QuickAccessSection title="Serviços" icon={Scissors}>
                    <QuickAccessButton 
                      icon={Plus} 
                      label="Adicionar Serviço" 
                      color="text-pink-500"
                      onClick={() => {
                        setIsQuickAccessOpen(false);
                        setIsNewServiceDialogOpen(true);
                      }}
                    />
                    <QuickAccessButton 
                      icon={ListChecks} 
                      label="Lista de Serviços" 
                      color="text-pink-500"
                      href="/servicos"
                    />
                    <QuickAccessButton 
                      icon={Edit} 
                      label="Editar Serviços" 
                      color="text-pink-500"
                      href="/servicos"
                    />
                  </QuickAccessSection>
                </div>
              </DialogContent>
            </Dialog>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Avatar>
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Perfil</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      {/* New Appointment Dialog */}
      <NewAppointmentDialog 
        open={isNewAppointmentDialogOpen}
        onOpenChange={setIsNewAppointmentDialogOpen}
      />
      
      {/* New Sale Dialog */}
      <NewSaleDialog 
        open={isNewSaleDialogOpen}
        onOpenChange={setIsNewSaleDialogOpen}
      />
      
      {/* New Client Dialog */}
      <NewClientDialog 
        open={isNewClientDialogOpen}
        onOpenChange={setIsNewClientDialogOpen}
      />
      
      {/* New Service Dialog */}
      <NewServiceDialog 
        open={isNewServiceDialogOpen}
        onOpenChange={setIsNewServiceDialogOpen}
      />

      {/* New Expense Dialog */}
      <NewExpenseDialog 
        open={isNewExpenseDialogOpen}
        onOpenChange={setIsNewExpenseDialogOpen}
      />
    </>
  )
} 