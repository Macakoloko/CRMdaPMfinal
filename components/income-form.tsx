"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Pencil, Trash } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

// Define the form schema
const formSchema = z.object({
  data: z.date({
    required_error: "A data é obrigatória.",
  }),
  valor: z.string().min(1, { message: "O valor é obrigatório." }),
  categoria: z.string().min(1, { message: "A categoria é obrigatória." }),
  cliente: z.string().optional(),
  metodo: z.string().min(1, { message: "O método de pagamento é obrigatório." }),
  descricao: z.string().optional(),
})

type IncomeFormValues = z.infer<typeof formSchema>

// Income record interface
interface IncomeRecord {
  id: string
  data: Date
  valor: string
  categoria: string
  cliente?: string
  metodo: string
  descricao?: string
}

// Map form categories to database categories
const categoryMapping: Record<string, string> = {
  "Serviço": "service",
  "Produto": "product",
  "Pacote": "service",
  "Assinatura": "service",
  "Outro": "other"
}

const paymentMethods = [
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de débito",
  "Mbway"
]

const incomeCategories = [
  "Serviço",
  "Produto",
  "Pacote",
  "Assinatura",
  "Outro"
]

export function IncomeForm() {
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingRecord, setEditingRecord] = useState<IncomeRecord | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)

  // Initialize the form
  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: new Date(),
      valor: "",
      categoria: "",
      cliente: "",
      metodo: "",
      descricao: "",
    },
  })

  // Load income records from the database
  useEffect(() => {
    async function loadIncomeRecords() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/financial/transactions?type=income')
        
        if (!response.ok) {
          throw new Error('Falha ao carregar recebimentos')
        }
        
        const data = await response.json()
        
        // Transform API data to IncomeRecord format
        const records: IncomeRecord[] = data.data.map((item: any) => ({
          id: item.id,
          data: new Date(item.date),
          valor: item.amount.toString(),
          categoria: mapCategoryFromDB(item.category),
          cliente: item.related_client_id || "",
          metodo: item.payment_method || "",
          descricao: item.description
        }))
        
        setIncomeRecords(records)
      } catch (error) {
        console.error('Erro ao carregar recebimentos:', error)
        toast.error('Não foi possível carregar os recebimentos')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadIncomeRecords()
  }, [])
  
  // Map database category to display category
  function mapCategoryFromDB(dbCategory: string): string {
    const mapping: Record<string, string> = {
      "service": "Serviço",
      "product": "Produto",
      "other": "Outro"
    }
    
    return mapping[dbCategory] || "Outro"
  }

  // Handle form submission
  async function onSubmit(values: IncomeFormValues) {
    setIsSubmitting(true)
    
    try {
      const transactionData = {
        type: 'income',
        category: categoryMapping[values.categoria] || 'other',
        amount: parseFloat(values.valor),
        date: values.data.toISOString(),
        description: values.descricao || values.categoria,
        payment_method: values.metodo,
        related_client_id: values.cliente || undefined,
        notes: values.descricao || undefined
      }
      
      if (editingRecord) {
        // Update existing record
        const response = await fetch(`/api/financial/transactions/${editingRecord.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        })
        
        if (!response.ok) {
          throw new Error('Falha ao atualizar recebimento')
        }
        
        const updatedData = await response.json()
        
        // Update local state
        const updatedRecord: IncomeRecord = {
          id: updatedData.data.id,
          data: new Date(updatedData.data.date),
          valor: updatedData.data.amount.toString(),
          categoria: mapCategoryFromDB(updatedData.data.category),
          cliente: updatedData.data.related_client_id || "",
          metodo: updatedData.data.payment_method || "",
          descricao: updatedData.data.description
        }
        
        setIncomeRecords(prev => 
          prev.map(record => record.id === updatedRecord.id ? updatedRecord : record)
        )
        
        toast.success("Recebimento atualizado com sucesso!")
        setEditingRecord(null)
      } else {
        // Add new record
        const response = await fetch('/api/financial/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(transactionData),
        })
        
        if (!response.ok) {
          throw new Error('Falha ao adicionar recebimento')
        }
        
        const newData = await response.json()
        
        // Add to local state
        const newRecord: IncomeRecord = {
          id: newData.data.id,
          data: new Date(newData.data.date),
          valor: newData.data.amount.toString(),
          categoria: mapCategoryFromDB(newData.data.category),
          cliente: newData.data.related_client_id || "",
          metodo: newData.data.payment_method || "",
          descricao: newData.data.description
        }
        
        setIncomeRecords(prev => [newRecord, ...prev])
        toast.success("Recebimento registrado com sucesso!")
      }
      
      // Reset form
      form.reset({
        data: new Date(),
        valor: "",
        categoria: "",
        cliente: "",
        metodo: "",
        descricao: "",
      })
    } catch (error) {
      console.error('Erro ao processar recebimento:', error)
      toast.error('Ocorreu um erro ao processar o recebimento')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit record
  function handleEditRecord(record: IncomeRecord) {
    setEditingRecord(record)
    form.reset({
      data: record.data,
      valor: record.valor,
      categoria: record.categoria,
      cliente: record.cliente || "",
      metodo: record.metodo,
      descricao: record.descricao || "",
    })
  }

  // Handle delete record
  function handleDeleteRecord(id: string) {
    setRecordToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete record
  async function confirmDeleteRecord() {
    if (recordToDelete) {
      try {
        const response = await fetch(`/api/financial/transactions/${recordToDelete}`, {
          method: 'DELETE',
        })
        
        if (!response.ok) {
          throw new Error('Falha ao excluir recebimento')
        }
        
        // Update local state
        setIncomeRecords(prev => prev.filter(record => record.id !== recordToDelete))
        toast.success("Recebimento excluído com sucesso!")
      } catch (error) {
        console.error('Erro ao excluir recebimento:', error)
        toast.error('Ocorreu um erro ao excluir o recebimento')
      } finally {
        setIsDeleteDialogOpen(false)
        setRecordToDelete(null)
      }
    }
  }

  // Cancel editing
  function cancelEdit() {
    setEditingRecord(null)
    form.reset({
      data: new Date(),
      valor: "",
      categoria: "",
      cliente: "",
      metodo: "",
      descricao: "",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingRecord ? "Editar Recebimento" : "Novo Recebimento"}</CardTitle>
          <CardDescription>
            {editingRecord 
              ? "Atualize os detalhes do recebimento abaixo." 
              : "Registre um novo recebimento no sistema."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="data"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="valor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor (€)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="0.00" 
                          {...field} 
                          type="number" 
                          step="0.01"
                          min="0"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoria"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {incomeCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cliente"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do cliente (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metodo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Método de Pagamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um método" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Detalhes adicionais (opcional)" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-2">
                {editingRecord && (
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancelar
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingRecord ? "Atualizar" : "Registrar"} Recebimento
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Recebimentos</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os recebimentos registrados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="hidden md:table-cell">Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Método</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      Nenhum recebimento registrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  incomeRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(record.data, "dd/MM/yyyy")}</TableCell>
                      <TableCell>€ {parseFloat(record.valor).toFixed(2)}</TableCell>
                      <TableCell>{record.categoria}</TableCell>
                      <TableCell className="hidden md:table-cell">{record.cliente || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">{record.metodo}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleEditRecord(record)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive" 
                            onClick={() => handleDeleteRecord(record.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este recebimento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDeleteRecord}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

