import * as React from "react"
import { cn } from "@/lib/utils"

export type CalendarProps = {
  mode?: "single"
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  initialFocus?: boolean
  className?: string
}

// Simplified calendar component - in production you'd use a proper calendar library
export function Calendar({
  className,
  selected,
  onSelect,
  ...props
}: CalendarProps) {
  return (
    <div className={cn("p-3", className)}>
      <input
        type="date"
        value={selected?.toISOString().split('T')[0] || ''}
        onChange={(e) => {
          const date = e.target.value ? new Date(e.target.value) : undefined
          onSelect?.(date)
        }}
        className="w-full p-2 border rounded"
      />
    </div>
  )
}