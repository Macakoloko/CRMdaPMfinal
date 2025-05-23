"use client"

import { AppointmentForm } from "@/components/appointment-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface NewAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewAppointmentDialog({ open, onOpenChange }: NewAppointmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <AppointmentForm onSuccess={() => onOpenChange(false)} />
        </div>
      </DialogContent>
    </Dialog>
  )
} 