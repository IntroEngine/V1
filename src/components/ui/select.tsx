"use client"

import * as React from "react"
import { cn } from "@/components/ui/button"
import { ChevronDown, Check } from "lucide-react"

// Simple Select implementation without Radix

const SelectContext = React.createContext<{
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
} | null>(null);

const Select = ({ children, value, onValueChange }: any) => {
    const [open, setOpen] = React.useState(false)
    // Handle outside click roughly or simply
    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
            <div className="relative inline-block w-full">{children}</div>
        </SelectContext.Provider>
    )
}

const SelectTrigger = ({ children, className }: any) => {
    const context = React.useContext(SelectContext)
    return (
        <button
            type="button"
            className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)}
            onClick={() => context?.setOpen(!context.open)}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    )
}

const SelectValue = ({ placeholder }: any) => {
    const context = React.useContext(SelectContext)
    // In a real SelectValue, we'd need to map value to label. 
    // For this MVP, we might display the value directly if we don't have the children map.
    // Or we let the consumer pass the label if they manage state.
    // Simpler: Just display context.value or placeholder
    return <span>{context?.value || placeholder}</span>
}

const SelectContent = ({ children }: any) => {
    const context = React.useContext(SelectContext)
    if (!context?.open) return null

    return (
        <div className="absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white text-popover-foreground shadow-md animate-in fade-in-80 w-full mt-1">
            <div className="p-1">{children}</div>
        </div>
    )
}

const SelectItem = ({ value, children }: any) => {
    const context = React.useContext(SelectContext)
    const isSelected = context?.value === value

    return (
        <div
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-gray-100 cursor-pointer",
                isSelected ? "bg-gray-100" : ""
            )}
            onClick={() => {
                context?.onValueChange(value)
                context?.setOpen(false)
            }}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {isSelected && <Check className="h-4 w-4" />}
            </span>
            {children}
        </div>
    )
}

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
