"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/components/ui/button" // Re-using cn utility

const Dialog = ({ open, onOpenChange, children }: any) => {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in"
                onClick={() => onOpenChange(false)}
            />
            {/* Content Container - handled by DialogContent */}
            {children}
        </div>
    )
}

const DialogContent = ({ children, className }: any) => {
    return (
        <div className={cn(
            "relative z-50 grid w-full max-w-lg gap-4 border bg-white p-6 shadow-lg duration-200 sm:rounded-lg animate-in fade-in zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%]",
            className
        )}>
            {children}
        </div>
    )
}

const DialogHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props}>
        {children}
    </div>
)

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)

const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
)

const DialogDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className={cn("text-sm text-gray-500", className)} {...props} />
)

export {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}
