"use client"

import { SaleForm } from "@/components/sale-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NewSaleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewSaleDialog({ open, onOpenChange }: NewSaleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Venda</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <SaleForm onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
} 