"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Search, Trash2, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const services = [
  {
    id: 1,
    name: "Corte de Cabelo Feminino",
    price: 80.0,
    duration: 60,
    category: "hair",
    commission: 30,
  },
  {
    id: 2,
    name: "Corte de Cabelo Masculino",
    price: 50.0,
    duration: 30,
    category: "hair",
    commission: 30,
  },
  {
    id: 3,
    name: "Coloração",
    price: 150.0,
    duration: 120,
    category: "hair",
    commission: 25,
  },
  {
    id: 4,
    name: "Manicure",
    price: 45.0,
    duration: 45,
    category: "nails",
    commission: 40,
  },
  {
    id: 5,
    name: "Pedicure",
    price: 55.0,
    duration: 60,
    category: "nails",
    commission: 40,
  },
  {
    id: 6,
    name: "Maquiagem para Eventos",
    price: 120.0,
    duration: 90,
    category: "makeup",
    commission: 35,
  },
  {
    id: 7,
    name: "Limpeza de Pele",
    price: 90.0,
    duration: 60,
    category: "facial",
    commission: 30,
  },
]

export function ServiceList() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCategoryName = (category: string) => {
    const categories = {
      hair: "Cabelo",
      nails: "Unhas",
      makeup: "Maquiagem",
      facial: "Facial",
      body: "Corporal",
      other: "Outro",
    }
    return categories[category] || category
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (remainingMinutes === 0) {
      return `${hours}h`
    }

    return `${hours}h ${remainingMinutes}min`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <CardTitle>Lista de Serviços</CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar serviço..."
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
                <TableHead>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>Duração</span>
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell">Comissão</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum serviço encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>€ {service.price.toFixed(2)}</TableCell>
                    <TableCell className="hidden md:table-cell">{getCategoryName(service.category)}</TableCell>
                    <TableCell>{formatDuration(service.duration)}</TableCell>
                    <TableCell className="hidden md:table-cell">{service.commission}%</TableCell>
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

