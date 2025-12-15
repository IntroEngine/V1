"use client"
import * as React from "react"
import { cn } from "@/components/ui/button" // Reuse cn from button or create utils. Using button's for now as utils.ts missing.

const Label = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
    ({ className, ...props }, ref) => (
        <label
            ref={ref}
            className={cn(
                "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                className
            )}
            {...props}
        />
    )
)
Label.displayName = "Label"

export { Label }
