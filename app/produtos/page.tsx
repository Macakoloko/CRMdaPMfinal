"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Pencil, Plus, Search, Trash, PackagePlus, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useProducts } from "@/context/ProductsContext"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define the product form schema
const productFormSchema = z.object({
  nome: z.string().min(1, { message: "O nome é obrigatório." }),
  descricao: z.string().optional(),
  preco: z.string().min(1, { message: "O preço é obrigatório." }),
  custo: z.string().min(1, { message: "O custo é obrigatório." }),
  estoque: z.string().min(1, { message: "A quantidade em estoque é obrigatória." }),
  estoqueMinimo: z.string().default("5"),
  categoria: z.string().min(1, { message: "A categoria é obrigatória." }),
  fornecedor: z.string().optional(),
  codigoBarras: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productFormSchema>

const productCategories = [
  "Cabelo",
  "Unhas",
  "Maquiagem",
  "Pele",
  "Finalizadores",
  "Tratamentos",
  "Acessórios",
  "Outros"
]

export default function ProductsPage() {
  const { 
    products, 
    isLoading, 
    error, 
    fetchProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateStock, 
    lowStockProducts 
  } = useProducts()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false)
  const [stockProduct, setStockProduct] = useState<any | null>(null)
  const [stockQuantity, setStockQuantity] = useState("")

  // Initialize the form
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      preco: "",
      custo: "",
      estoque: "",
      estoqueMinimo: "5",
      categoria: "",
      fornecedor: "",
      codigoBarras: "",
    },
  })

  // Refresh products when tab changes
  useEffect(() => {
    if (activeTab === "low") {
      fetchProducts({ lowStock: true })
    } else if (activeTab === "all") {
      fetchProducts()
    } else {
      fetchProducts({ category: activeTab })
    }
  }, [activeTab])

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.descricao?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.categoria.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.fornecedor?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  // Handle form submission
  async function onSubmit(values: ProductFormValues) {
    setIsSubmitting(true)
    
    try {
      if (editingProduct) {
        // Update existing product
        await updateProduct(editingProduct.id, values)
        toast.success("Produto atualizado com sucesso!")
      } else {
        // Add new product
        await addProduct(values)
        toast.success("Produto adicionado com sucesso!")
      }
      
      setIsProductDialogOpen(false)
      form.reset()
    } catch (error) {
      console.error("Error submitting product:", error)
      toast.error("Ocorreu um erro ao salvar o produto")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle edit product
  function handleEditProduct(product: any) {
    setEditingProduct(product)
    
    // Set form values
    form.reset({
      nome: product.nome,
      descricao: product.descricao || "",
      preco: product.preco,
      custo: product.custo,
      estoque: product.estoque,
      estoqueMinimo: product.estoqueMinimo,
      categoria: product.categoria,
      fornecedor: product.fornecedor || "",
      codigoBarras: product.codigoBarras || "",
    })
    
    setIsProductDialogOpen(true)
  }

  // Handle delete product
  function handleDeleteProduct(id: string) {
    setProductToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  // Confirm delete product
  async function confirmDeleteProduct() {
    if (!productToDelete) return
    
    try {
      setIsSubmitting(true)
      await deleteProduct(productToDelete)
      setIsDeleteDialogOpen(false)
      setProductToDelete(null)
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error("Ocorreu um erro ao excluir o produto")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle new product
  function handleNewProduct() {
    setEditingProduct(null)
    form.reset({
      nome: "",
      descricao: "",
      preco: "",
      custo: "",
      estoque: "",
      estoqueMinimo: "5",
      categoria: "",
      fornecedor: "",
      codigoBarras: "",
    })
    setIsProductDialogOpen(true)
  }

  // Handle update stock
  function handleUpdateStock(product: any) {
    setStockProduct(product)
    setStockQuantity("")
    setIsStockDialogOpen(true)
  }

  // Update stock
  async function updateProductStock() {
    if (!stockProduct || stockQuantity === "") return
    
    try {
      setIsSubmitting(true)
      await updateStock(stockProduct.id, parseInt(stockQuantity))
      setIsStockDialogOpen(false)
      setStockProduct(null)
      setStockQuantity("")
    } catch (error) {
      console.error("Error updating stock:", error)
      toast.error("Ocorreu um erro ao atualizar o estoque")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4 pb-20">
      <h1 className="mb-6 text-2xl font-bold">Produtos e Serviços</h1>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <Alert variant="default" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Produtos com estoque baixo</AlertTitle>
          <AlertDescription>
            Existem {lowStockProducts.length} produtos com estoque abaixo do mínimo.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list">Lista de Produtos e Serviços</TabsTrigger>
          <TabsTrigger value="new">Novo Produto/Serviço</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Produtos</h2>
              <p className="text-muted-foreground">Gerencie seu inventário de produtos e serviços</p>
            </div>
            <Button onClick={handleNewProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </div>

          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="low" className="flex items-center gap-1">
                Estoque Baixo
                {lowStockProducts.length > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {lowStockProducts.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="cabelo">Cabelo</TabsTrigger>
              <TabsTrigger value="unhas">Unhas</TabsTrigger>
            </TabsList>
          </Tabs>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <PackagePlus className="h-10 w-10 text-muted-foreground mb-2" />
                  <h3 className="text-lg font-medium">Nenhum produto encontrado</h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? "Tente uma busca diferente" : "Adicione seu primeiro produto"}
                  </p>
                  {!searchQuery && (
                    <Button onClick={handleNewProduct} className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Produto
                    </Button>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Custo</TableHead>
                      <TableHead className="text-center">Estoque</TableHead>
                      <TableHead>Atualizado</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          {product.nome}
                          {product.descricao && (
                            <p className="text-xs text-muted-foreground">{product.descricao}</p>
                          )}
                        </TableCell>
                        <TableCell>{product.categoria}</TableCell>
                        <TableCell className="text-right">€ {product.preco}</TableCell>
                        <TableCell className="text-right">€ {product.custo}</TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              "inline-block px-2 py-1 rounded-md text-xs font-medium",
                              parseInt(product.estoque) <= 0
                                ? "bg-red-100 text-red-800"
                                : parseInt(product.estoque) < parseInt(product.estoqueMinimo)
                                ? "bg-amber-100 text-amber-800"
                                : "bg-green-100 text-green-800"
                            )}
                          >
                            {product.estoque}
                          </span>
                        </TableCell>
                        <TableCell>
                          {product.dataAtualizacao && !isNaN(new Date(product.dataAtualizacao).getTime()) 
                            ? format(new Date(product.dataAtualizacao), "dd/MM/yyyy") 
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Product Form Dialog */}
          <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? "Atualize as informações do produto abaixo."
                    : "Preencha as informações do novo produto."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Produto</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do produto" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="preco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço de Venda (€)</FormLabel>
                          <FormControl>
                            <Input placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="custo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custo (€)</FormLabel>
                          <FormControl>
                            <Input placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="estoque"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estoque Atual</FormLabel>
                          <FormControl>
                            <Input placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="estoqueMinimo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estoque Mínimo</FormLabel>
                          <FormControl>
                            <Input placeholder="5" {...field} />
                          </FormControl>
                          <FormDescription>
                            Alerta quando o estoque estiver abaixo deste valor
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="categoria"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cabelo">Cabelo</SelectItem>
                              <SelectItem value="unhas">Unhas</SelectItem>
                              <SelectItem value="maquiagem">Maquiagem</SelectItem>
                              <SelectItem value="pele">Pele</SelectItem>
                              <SelectItem value="tratamentos">Tratamentos</SelectItem>
                              <SelectItem value="depilação">Depilação</SelectItem>
                              <SelectItem value="estética">Estética Facial</SelectItem>
                              <SelectItem value="massagem">Massagem</SelectItem>
                              <SelectItem value="serviço">Serviço</SelectItem>
                              <SelectItem value="produto">Produto</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
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
                          <FormLabel>Fornecedor (opcional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do fornecedor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição (opcional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descrição do produto"
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
                    name="codigoBarras"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código de Barras (opcional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Código de barras" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsProductDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingProduct ? "Atualizar" : "Cadastrar"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Confirmar Exclusão</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={confirmDeleteProduct}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Excluir
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Stock Update Dialog */}
          <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Atualizar Estoque</DialogTitle>
                <DialogDescription>
                  {stockProduct && (
                    <>
                      Atualize o estoque de <strong>{stockProduct.nome}</strong>.
                      Estoque atual: <strong>{stockProduct.estoque}</strong> unidades.
                    </>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="stockQuantity" className="text-sm font-medium">
                    Quantidade a adicionar/remover
                  </label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    placeholder="Use valores negativos para remover"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Use valores negativos para remover do estoque.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsStockDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={updateProductStock}
                  disabled={isSubmitting || stockQuantity === ""}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Atualizar Estoque
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="new" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Adicionar Novo Produto ou Serviço</CardTitle>
              <CardDescription>
                Preencha os detalhes do produto ou serviço abaixo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do produto" {...field} />
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
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione uma categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cabelo">Cabelo</SelectItem>
                              <SelectItem value="unhas">Unhas</SelectItem>
                              <SelectItem value="maquiagem">Maquiagem</SelectItem>
                              <SelectItem value="pele">Pele</SelectItem>
                              <SelectItem value="tratamentos">Tratamentos</SelectItem>
                              <SelectItem value="depilação">Depilação</SelectItem>
                              <SelectItem value="estética">Estética Facial</SelectItem>
                              <SelectItem value="massagem">Massagem</SelectItem>
                              <SelectItem value="serviço">Serviço</SelectItem>
                              <SelectItem value="produto">Produto</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="preco"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (€)</FormLabel>
                          <FormControl>
                            <Input placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="custo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custo (€)</FormLabel>
                          <FormControl>
                            <Input placeholder="0.00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estoque"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estoque</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estoqueMinimo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estoque Mínimo</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5" {...field} />
                          </FormControl>
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
                            <Input placeholder="Nome do fornecedor" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="codigoBarras"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código de Barras</FormLabel>
                          <FormControl>
                            <Input placeholder="Código de barras" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descrição do produto ou serviço" 
                            className="min-h-[100px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar Produto
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

