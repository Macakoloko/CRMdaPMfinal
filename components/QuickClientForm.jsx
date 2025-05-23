"use client"

import React, { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useClients } from '@/context/ClientContext';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const QuickClientForm = ({ open, onClose }) => {
  const { addClient } = useClients();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    birthDate: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addClient({
        name: formData.name,
        phone: formData.phone,
        birthDate: formData.birthDate || undefined,
      });
      
      toast({
        title: "Cliente adicionado",
        description: `${formData.name} foi adicionado com sucesso.`,
      });
      
      setFormData({
        name: '',
        phone: '',
        birthDate: '',
      });
      
      onClose();
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o cliente. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Cliente</DialogTitle>
          <DialogDescription>
            Preencha os dados básicos do cliente para um cadastro rápido.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome*</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome completo"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="phone">Telefone*</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Telefone"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="birthDate">Data de Aniversário</Label>
              <Input
                id="birthDate"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adicionando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuickClientForm; 