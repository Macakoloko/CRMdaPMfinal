import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TimeInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type="time"
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
      </div>
    )
  }
)
TimeInput.displayName = "TimeInput"

export { TimeInput } 