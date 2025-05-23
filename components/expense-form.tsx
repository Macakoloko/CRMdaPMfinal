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
  fornecedor: z.string().optional(),
  metodo: z.string().min(1, { message: "O método de pagamento é obrigatório." }),
  descricao: z.string().optional(),
  recorrente: z.boolean().default(false),
})

type ExpenseFormValues = z.infer<typeof formSchema>

// Expense record interface
interface ExpenseRecord {
  id: string
  data: Date
  valor: string
  categoria: string
  fornecedor?: string
  metodo: string
  descricao?: string
  recorrente: boolean
}

// Map form categories to database categories
const categoryMapping: Record<string, string> = {
  "Aluguel": "rent",
  "Salários": "salary",
  "Insumos": "supplies",
  "Equipamentos": "supplies",
  "Marketing": "marketing",
  "Utilities": "utilities",
  "Impostos": "other",
  "Manutenção": "other",
  "Outro": "other"
}

const paymentMethods = [
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de débito",
  "Mbway"
]

const expenseCategories = [
  "Aluguel",
  "Salários",
  "Insumos",
  "Equipamentos",
  "Marketing",
  "Utilities",
  "Impostos",
  "Manutenção",
  "Outro"
]

interface ExpenseFormProps {
  onSuccess?: () => void
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [editingRecord, setEditingRecord] = useState<ExpenseRecord | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null)

  // Initialize the form
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      data: new Date(),
      valor: "",
      categoria: "",
      fornecedor: "",
      metodo: "",
      descricao: "",
      recorrente: false,
    },
  })

  // Load expense records from the database
  useEffect(() => {
    async function loadExpenseRecords() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/financial/transactions?type=expense')
        
        if (!response.ok) {
          throw new Error('Falha ao carregar despesas')
        }
        
        const data = await response.json()
        
        // Transform API data to ExpenseRecord format
        const records: ExpenseRecord[] = data.data.map((item: any) => ({
          id: item.id,
          data: new Date(item.date),
          valor: item.amount.toString(),
          categoria: mapCategoryFromDB(item.category),
          fornecedor: item.notes || "",
          metodo: item.payment_method || "",
          descricao: item.description,
          recorrente: item.notes?.includes('recorrente') || false
        }))
        
        setExpenseRecords(records)
      } catch (error) {
        console.error('Erro ao carregar despesas:', error)
        toast.error('Não foi possível carregar as despesas')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadExpenseRecords()
  }, [])
  
  // Map database category to display category
  function mapCategoryFromDB(dbCategory: string): string {
    const mapping: Record<string, string> = {
      "rent": "Aluguel",
      "salary": "Salários",
      "supplies": "Insumos",
      "marketing": "Marketing",
      "utilities": "Utilities",
      "other": "Outro"
    }
    
    return mapping[dbCategory] || "Outro"
  }

  // Handle form submission
  async function onSubmit(values: ExpenseFormValues) {
    setIsSubmitting(true)
    
    try {
      const transactionData = {
        type: 'expense',
        category: categoryMapping[values.categoria] || 'other',
        amount: parseFloat(values.valor),
        date: values.data.toISOString(),
        description: values.descricao || values.categoria,
        payment_method: values.metodo,
        notes: `${values.fornecedor || ''}${values.recorrente ? ' (recorrente)' : ''}`
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
          throw new Error('Falha ao atualizar despesa')
        }
        
        const updatedData = await response.json()
        
        // Update local state
        const updatedRecord: ExpenseRecord = {
          id: updatedData.data.id,
          data: new Date(updatedData.data.date),
          valor: updatedData.data.amount.toString(),
          categoria: mapCategoryFromDB(updatedData.data.category),
          fornecedor: updatedData.data.notes?.replace(' (recorrente)', '') || "",
          metodo: updatedData.data.payment_method || "",
          descricao: updatedData.data.description,
          recorrente: updatedData.data.notes?.includes('recorrente') || false
        }
        
        setExpenseRecords(prev => 
          prev.map(record => record.id === updatedRecord.id ? updatedRecord : record)
        )
        
        toast.success("Despesa atualizada com sucesso!")
        setEditingRecord(null)
        if (onSuccess) onSuccess();
        return;
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
          throw new Error('Falha ao adicionar despesa')
        }
        
        const newData = await response.json()
        
        // Add to local state
        const newRecord: ExpenseRecord = {
          id: newData.data.id,
          data: new Date(newData.data.date),
          valor: newData.data.amount.toString(),
          categoria: mapCategoryFromDB(newData.data.category),
          fornecedor: newData.data.notes?.replace(' (recorrente)', '') || "",
          metodo: newData.data.payment_method || "",
          descricao: newData.data.description,
          recorrente: newData.data.notes?.includes('recorrente') || false
        }
        
        setExpenseRecords(prev => [newRecord, ...prev])
        toast.success("Despesa registrada com sucesso!")
        if (onSuccess) onSuccess();
      }
      
      // Reset form
      form.reset({
        data: new Date(),
        valor: "",
        categoria: "",
        fornecedor: "",
        metodo: "",
        descricao: "",
        recorrente: false,
      })
    } catch (error) {
      console.error('Erro ao processar despesa:', error)
      toast.error('Ocorreu um erro ao processar a despesa')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit record
  function handleEditRecord(record: ExpenseRecord) {
    setEditingRecord(record)
    form.reset({
      data: record.data,
      valor: record.valor,
      categoria: record.categoria,
      fornecedor: record.fornecedor || "",
      metodo: record.metodo,
      descricao: record.descricao || "",
      recorrente: record.recorrente,
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
          throw new Error('Falha ao excluir despesa')
        }
        
        // Update local state
        setExpenseRecords(prev => prev.filter(record => record.id !== recordToDelete))
        toast.success("Despesa excluída com sucesso!")
      } catch (error) {
        console.error('Erro ao excluir despesa:', error)
        toast.error('Ocorreu um erro ao excluir a despesa')
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
      fornecedor: "",
      metodo: "",
      descricao: "",
      recorrente: false,
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingRecord ? "Editar Despesa" : "Nova Despesa"}</CardTitle>
          <CardDescription>
            {editingRecord 
              ? "Atualize os detalhes da despesa abaixo." 
              : "Registre uma nova despesa no sistema."}
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
                          {expenseCategories.map((category) => (
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
                  name="fornecedor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do fornecedor (opcional)" {...field} />
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

                <FormField
                  control={form.control}
                  name="recorrente"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Despesa Recorrente</FormLabel>
                        <FormDescription>
                          Marque esta opção se esta despesa se repete mensalmente.
                        </FormDescription>
                      </div>
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
                  {editingRecord ? "Atualizar" : "Registrar"} Despesa
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Despesas</CardTitle>
          <CardDescription>
            Visualize e gerencie todas as despesas registradas.
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
                  <TableHead className="hidden md:table-cell">Fornecedor</TableHead>
                  <TableHead className="hidden md:table-cell">Método</TableHead>
                  <TableHead className="hidden md:table-cell">Recorrente</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                      Nenhuma despesa registrada.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenseRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{format(record.data, "dd/MM/yyyy")}</TableCell>
                      <TableCell>€ {parseFloat(record.valor).toFixed(2)}</TableCell>
                      <TableCell>{record.categoria}</TableCell>
                      <TableCell className="hidden md:table-cell">{record.fornecedor || "-"}</TableCell>
                      <TableCell className="hidden md:table-cell">{record.metodo}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {record.recorrente ? "Sim" : "Não"}
                      </TableCell>
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
              Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
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

