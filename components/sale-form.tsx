"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for clients and products
const mockClients = [
  { id: "1", name: "Maria Silva" },
  { id: "2", name: "João Costa" },
  { id: "3", name: "Ana Pereira" },
]

const mockProducts = [
  { id: "1", name: "Shampoo Premium", price: 25.90, stock: 10 },
  { id: "2", name: "Condicionador Premium", price: 27.90, stock: 8 },
  { id: "3", name: "Máscara Hidratante", price: 45.50, stock: 5 },
]

const mockServices = [
  { id: "1", name: "Corte de Cabelo", price: 50.00 },
  { id: "2", name: "Coloração", price: 120.00 },
  { id: "3", name: "Escova", price: 70.00 },
]

const paymentMethods = [
  "Dinheiro",
  "Cartão de Crédito",
  "Cartão de débito",
  "Mbway"
]

// Define form schema
const formSchema = z.object({
  client: z.string().min(1, { message: "Cliente é obrigatório" }),
  paymentMethod: z.string().min(1, { message: "Método de pagamento é obrigatório" }),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      type: z.enum(["product", "service"]),
      name: z.string(),
      price: z.number(),
      quantity: z.number().min(1),
    })
  ).optional().default([]),
})

interface SaleFormProps {
  onSuccess: () => void
  initialData?: z.infer<typeof formSchema>
}

export function SaleForm({ onSuccess, initialData }: SaleFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [items, setItems] = useState<Array<{
    id: string;
    type: "product" | "service";
    name: string;
    price: number;
    quantity: number;
  }>>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      client: "",
      paymentMethod: "",
      discount: 0,
      notes: "",
      items: [],
    },
  })

  // Calculate total
  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = form.getValues("discount") || 0
    return subtotal - discount
  }

  // Add product to sale
  const addProduct = () => {
    if (!selectedProduct) return

    const product = mockProducts.find(p => p.id === selectedProduct)
    if (!product) return

    const existingItem = items.find(item => item.id === product.id && item.type === "product")
    
    if (existingItem) {
      setItems(items.map(item => 
        item.id === product.id && item.type === "product"
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ))
    } else {
      setItems([...items, {
        id: product.id,
        type: "product",
        name: product.name,
        price: product.price,
        quantity: quantity
      }])
    }

    setSelectedProduct("")
    setQuantity(1)
  }

  // Add service to sale
  const addService = () => {
    if (!selectedService) return

    const service = mockServices.find(s => s.id === selectedService)
    if (!service) return

    const existingItem = items.find(item => item.id === service.id && item.type === "service")
    
    if (existingItem) {
      setItems(items.map(item => 
        item.id === service.id && item.type === "service"
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setItems([...items, {
        id: service.id,
        type: "service",
        name: service.name,
        price: service.price,
        quantity: 1
      }])
    }

    setSelectedService("")
  }

  // Remove item from sale
  const removeItem = (id: string, type: "product" | "service") => {
    setItems(items.filter(item => !(item.id === id && item.type === type)))
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      // Prepare sale data with items
      const saleData = {
        ...values,
        items: items,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
        date: new Date(),
      }
      
      // Here you would normally save to database
      console.log("Sale data:", saleData)
      
      toast({
        title: "Venda realizada com sucesso",
        description: `Venda no valor de €${saleData.total.toFixed(2)} registrada.`,
      })
      
      onSuccess()
    } catch (error) {
      console.error("Error saving sale:", error)
      toast({
        title: "Erro ao registrar venda",
        description: "Ocorreu um erro ao registrar a venda. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="client"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cliente*</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {mockClients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
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
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Método de Pagamento*</FormLabel>
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
        </div>
        
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-4">Adicionar Produtos</h3>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-grow">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {mockProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - €{product.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-24">
              <Input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)} 
                placeholder="Qtd"
              />
            </div>
            <Button type="button" onClick={addProduct}>Adicionar</Button>
          </div>
          
          <h3 className="font-medium mb-4 mt-6">Adicionar Serviços</h3>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-grow">
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {mockServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - €{service.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="button" onClick={addService}>Adicionar</Button>
          </div>
          
          {items.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium mb-2">Itens da Venda</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={`${item.type}-${item.id}`}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.type === "product" ? "Produto" : "Serviço"}</TableCell>
                      <TableCell className="text-right">€{item.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">€{(item.price * item.quantity).toFixed(2)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeItem(item.id, item.type)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={4} className="text-right font-medium">Subtotal:</TableCell>
                    <TableCell className="text-right font-medium">€{calculateSubtotal().toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="discount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Desconto (€)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    {...field} 
                    onChange={(e) => {
                      field.onChange(parseFloat(e.target.value) || 0)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-end">
            <div className="bg-muted p-3 rounded-md w-full">
              <div className="text-sm">Total:</div>
              <div className="text-2xl font-bold">€{calculateTotal().toFixed(2)}</div>
            </div>
          </div>
          
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Observações (opcional)" 
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
          <Button type="submit" disabled={isSubmitting || items.length === 0}>
            {isSubmitting ? "Processando..." : "Finalizar Venda"}
          </Button>
        </div>
      </form>
    </Form>
  )
} 