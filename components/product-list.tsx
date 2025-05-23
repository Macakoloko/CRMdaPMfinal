"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Search, Trash2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const products = [
  {
    id: 1,
    name: "Shampoo Hidratante",
    price: 45.9,
    cost: 22.5,
    stock: 15,
    minStock: 5,
    category: "shampoo",
    brand: "L'Oréal",
  },
  {
    id: 2,
    name: "Condicionador Reparador",
    price: 49.9,
    cost: 24.8,
    stock: 12,
    minStock: 5,
    category: "conditioner",
    brand: "L'Oréal",
  },
  {
    id: 3,
    name: "Máscara de Tratamento Intensivo",
    price: 69.9,
    cost: 35.0,
    stock: 8,
    minStock: 3,
    category: "treatment",
    brand: "Kérastase",
  },
  {
    id: 4,
    name: "Óleo de Argan",
    price: 89.9,
    cost: 45.0,
    stock: 6,
    minStock: 2,
    category: "styling",
    brand: "Wella",
  },
  {
    id: 5,
    name: "Coloração 7.0 Louro Médio",
    price: 29.9,
    cost: 15.0,
    stock: 20,
    minStock: 5,
    category: "coloring",
    brand: "Wella",
  },
  {
    id: 6,
    name: "Escova Profissional",
    price: 129.9,
    cost: 65.0,
    stock: 4,
    minStock: 2,
    category: "accessories",
    brand: "Schwarzkopf",
  },
  {
    id: 7,
    name: "Sérum Anti-Frizz",
    price: 59.9,
    cost: 30.0,
    stock: 3,
    minStock: 5,
    category: "styling",
    brand: "Redken",
  },
]

export function ProductList() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCategoryName = (category: string) => {
    const categories = {
      shampoo: "Shampoo",
      conditioner: "Condicionador",
      treatment: "Tratamento",
      styling: "Finalização",
      coloring: "Coloração",
      accessories: "Acessórios",
      other: "Outros",
    }
    return categories[category] || category
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle>Lista de Produtos</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar produto..."
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
                <TableHead>Preço</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead className="hidden md:table-cell">Marca</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum produto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>€ {product.price.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">{getCategoryName(product.category)}</TableCell>
                    <TableCell className="hidden md:table-cell">{product.brand}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Badge
                          variant={
                            product.stock <= 0
                              ? "destructive"
                              : product.stock < product.minStock
                                ? "outline"
                                : "default"
                          }
                        >
                          {product.stock}
                        </Badge>
                        {product.stock < product.minStock && <AlertTriangle className="ml-2 h-4 w-4 text-amber-500" />}
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

