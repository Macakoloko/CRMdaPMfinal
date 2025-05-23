"use client"

import { ServiceForm } from "@/components/service-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NewServiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewServiceDialog({ open, onOpenChange }: NewServiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Serviço</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ServiceForm onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
} 