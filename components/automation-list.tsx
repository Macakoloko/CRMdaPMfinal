"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Search, Trash2, Play, Pause } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

const automations = [
  {
    id: 1,
    name: "Lembrete de Agendamento",
    type: "reminder",
    trigger: "before_appointment",
    timeValue: "1",
    timeUnit: "days",
    active: true,
    lastRun: "2023-07-20T10:30:00",
    sentCount: 156,
  },
  {
    id: 2,
    name: "Agradecimento Pós-Atendimento",
    type: "message",
    trigger: "after_appointment",
    timeValue: "2",
    timeUnit: "hours",
    active: true,
    lastRun: "2023-07-22T15:45:00",
    sentCount: 243,
  },
  {
    id: 3,
    name: "Feliz Aniversário",
    type: "message",
    trigger: "birthday",
    timeValue: "0",
    timeUnit: "days",
    active: true,
    lastRun: "2023-07-22T08:00:00",
    sentCount: 87,
  },
  {
    id: 4,
    name: "Promoção de Produtos",
    type: "promotion",
    trigger: "inactivity",
    timeValue: "30",
    timeUnit: "days",
    active: false,
    lastRun: "2023-06-15T09:00:00",
    sentCount: 45,
  },
  {
    id: 5,
    name: "Alerta de Estoque Baixo",
    type: "message",
    trigger: "low_stock",
    timeValue: "1",
    timeUnit: "hours",
    active: true,
    lastRun: "2023-07-21T16:20:00",
    sentCount: 12,
  },
  {
    id: 6,
    name: "Recuperação de Não Comparecimento",
    type: "followup",
    trigger: "no_show",
    timeValue: "1",
    timeUnit: "days",
    active: true,
    lastRun: "2023-07-19T11:15:00",
    sentCount: 28,
  },
]

export function AutomationList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [automationState, setAutomationState] = useState(
    automations.reduce((acc, automation) => {
      acc[automation.id] = automation.active
      return acc
    }, {}),
  )

  const filteredAutomations = automations.filter(
    (automation) =>
      automation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automation.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      automation.trigger.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleToggleActive = (id: number) => {
    setAutomationState((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getTypeLabel = (type: string) => {
    const types = {
      message: "Mensagem",
      reminder: "Lembrete",
      promotion: "Promoção",
      followup: "Acompanhamento",
    }
    return types[type] || type
  }

  const getTriggerLabel = (trigger: string) => {
    const triggers = {
      after_appointment: "Após Atendimento",
      before_appointment: "Antes do Atendimento",
      no_show: "Não Comparecimento",
      birthday: "Aniversário",
      inactivity: "Inatividade",
      low_stock: "Estoque Baixo",
    }
    return triggers[trigger] || trigger
  }

  const getTimeUnitLabel = (unit: string) => {
    const units = {
      minutes: "minutos",
      hours: "horas",
      days: "dias",
      weeks: "semanas",
      months: "meses",
    }
    return units[unit] || unit
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("pt-BR")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle>Automações Ativas</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar automação..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="hidden md:table-cell">Gatilho</TableHead>
                <TableHead className="hidden md:table-cell">Tempo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAutomations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhuma automação encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredAutomations.map((automation) => (
                  <TableRow key={automation.id}>
                    <TableCell className="font-medium">{automation.name}</TableCell>
                    <TableCell>{getTypeLabel(automation.type)}</TableCell>
                    <TableCell className="hidden md:table-cell">{getTriggerLabel(automation.trigger)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {automation.timeValue} {getTimeUnitLabel(automation.timeUnit)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={automationState[automation.id]}
                          onCheckedChange={() => handleToggleActive(automation.id)}
                        />
                        <Badge variant={automationState[automation.id] ? "default" : "outline"}>
                          {automationState[automation.id] ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          {automationState[automation.id] ? (
                            <DropdownMenuItem onClick={() => handleToggleActive(automation.id)}>
                              <Pause className="mr-2 h-4 w-4" />
                              <span>Pausar</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleToggleActive(automation.id)}>
                              <Play className="mr-2 h-4 w-4" />
                              <span>Ativar</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

