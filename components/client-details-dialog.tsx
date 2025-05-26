"use client"

import { useState } from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Check, X, Calendar, Euro, Edit, Save, AlertCircle, Phone, Mail, MapPin, User, Clock } from "lucide-react"
import { toast } from "sonner"
import { useClients, Client, ClientService, ClientAttendance } from "@/context/ClientContext"

interface ClientDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  clientId: string | null
}

export function ClientDetailsDialog({ open, onOpenChange, clientId }: ClientDetailsDialogProps) {
  const { clients, getClient, clientServices, getClientServices, getClientAttendance, updateClient } = useClients()
  const [isEditing, setIsEditing] = useState(false)
  const [editedClient, setEditedClient] = useState<Partial<Client>>({})
  
  // Obter o cliente atual e seus dados relacionados
  const client = clientId ? getClient(clientId) : null
  const services = clientId ? getClientServices(clientId) : []
  const attendance = clientId ? getClientAttendance(clientId) : []
  
  // Calcular estatísticas do cliente
  const stats = {
    totalServices: services.length,
    totalSpent: services.reduce((sum, service) => sum + service.price, 0),
    totalAttendance: attendance.length,
    missedAttendance: attendance.filter(a => !a.attended).length,
    attendanceRate: attendance.length > 0 
      ? Math.round((attendance.filter(a => a.attended).length / attendance.length) * 100) 
      : 0
  }
  
  // Formatar valor monetário
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "EUR",
    }).format(value)
  }
  
  // Formatar data
  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: ptBR })
  }
  
  // Iniciar modo de edição
  const startEditing = () => {
    if (client) {
      setEditedClient({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        postalCode: client.postalCode,
        city: client.city,
        nif: client.nif,
        notes: client.notes
      })
      setIsEditing(true)
    }
  }
  
  // Salvar alterações
  const saveChanges = async () => {
    if (clientId && editedClient) {
      try {
        await updateClient(clientId, editedClient)
        setIsEditing(false)
        toast("Dados do cliente atualizados com sucesso")
      } catch (error) {
        toast("Erro ao atualizar dados do cliente")
        console.error("Erro ao atualizar cliente:", error)
      }
    }
  }
  
  // Cancelar edição
  const cancelEditing = () => {
    setIsEditing(false)
    setEditedClient({})
  }
  
  // Atualizar campo do cliente em edição
  const updateField = (field: keyof Client, value: string) => {
    setEditedClient(prev => ({
      ...prev,
      [field]: value
    }))
  }
  
  // Se não houver cliente, não renderizar conteúdo
  if (!client) return null
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {client.name}
            {!isEditing && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2" 
                onClick={startEditing}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </DialogTitle>
          <DialogDescription>
            Cliente desde {new Date().toLocaleDateString('pt-BR')}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="services">Histórico de Serviços</TabsTrigger>
            <TabsTrigger value="attendance">Comparecimento</TabsTrigger>
          </TabsList>
          
          {/* Aba de Informações do Cliente */}
          <TabsContent value="info">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total Gasto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalSpent)}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Taxa de Comparecimento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{stats.attendanceRate}%</p>
                  </CardContent>
                </Card>
              </div>
              
              {isEditing ? (
                // Formulário de edição
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input 
                        id="name" 
                        value={editedClient.name || ''} 
                        onChange={(e) => updateField('name', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={editedClient.email || ''} 
                        onChange={(e) => updateField('email', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        value={editedClient.phone || ''} 
                        onChange={(e) => updateField('phone', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nif">NIF</Label>
                      <Input 
                        id="nif" 
                        value={editedClient.nif || ''} 
                        onChange={(e) => updateField('nif', e.target.value)} 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input 
                        id="address" 
                        value={editedClient.address || ''} 
                        onChange={(e) => updateField('address', e.target.value)} 
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Código Postal</Label>
                        <Input 
                          id="postalCode" 
                          value={editedClient.postalCode || ''} 
                          onChange={(e) => updateField('postalCode', e.target.value)} 
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input 
                          id="city" 
                          value={editedClient.city || ''} 
                          onChange={(e) => updateField('city', e.target.value)} 
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="notes">Notas</Label>
                      <Textarea 
                        id="notes" 
                        rows={4} 
                        value={editedClient.notes || ''} 
                        onChange={(e) => updateField('notes', e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={cancelEditing}>
                      Cancelar
                    </Button>
                    <Button onClick={saveChanges}>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </Button>
                  </div>
                </div>
              ) : (
                // Exibição das informações do cliente
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Contato</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <p>{client.phone || "Não informado"}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <p>{client.email || "Não informado"}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Endereço</p>
                      <div className="flex items-start gap-2 mt-1">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p>{client.address || "Não informado"}</p>
                          {(client.postalCode || client.city) && (
                            <p>{client.postalCode} {client.city}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">NIF</p>
                      <p>{client.nif || "Não informado"}</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant={client.status === "active" ? "success" : "destructive"}>
                        {client.status === "active" ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                    
                    {client.notes && (
                      <div className="space-y-1 col-span-2">
                        <p className="text-sm text-muted-foreground">Notas</p>
                        <p className="text-sm bg-gray-50 p-3 rounded-md">{client.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Aba de Histórico de Serviços */}
          <TabsContent value="services">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Histórico de Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                {services.length === 0 ? (
                  <div className="flex items-center justify-center p-6 text-center text-muted-foreground">
                    <div>
                      <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                      <p>Este cliente ainda não realizou nenhum serviço</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Serviço</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Pagamento</TableHead>
                          <TableHead>Compareceu</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {services.sort((a, b) => b.serviceDate.getTime() - a.serviceDate.getTime()).map((service) => (
                          <TableRow key={service.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span>{formatDate(service.serviceDate)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {format(service.serviceDate, "HH:mm", { locale: ptBR })}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{service.serviceName}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Euro className="h-3 w-3 mr-1" />
                                {service.price.toFixed(2)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {service.paymentMethod === "cash" ? "Dinheiro" : 
                                 service.paymentMethod === "card" ? "Cartão" : 
                                 service.paymentMethod === "transfer" ? "Transferência" : "Outro"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {service.attended ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-red-600" />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Aba de Histórico de Comparecimento */}
          <TabsContent value="attendance">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Histórico de Comparecimento</CardTitle>
              </CardHeader>
              <CardContent>
                {attendance.length === 0 ? (
                  <div className="flex items-center justify-center p-6 text-center text-muted-foreground">
                    <div>
                      <Clock className="h-8 w-8 mx-auto mb-2" />
                      <p>Não há registros de comparecimento para este cliente</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Compareceu</TableHead>
                          <TableHead>Motivo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendance.sort((a, b) => b.date.getTime() - a.date.getTime()).map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {formatDate(record.date)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {record.attended ? (
                                <Badge variant="success" className="flex items-center gap-1 w-fit">
                                  <Check className="h-3 w-3" />
                                  Compareceu
                                </Badge>
                              ) : (
                                <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                  <X className="h-3 w-3" />
                                  Faltou
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {record.reason || (record.attended ? "N/A" : "Não informado")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 