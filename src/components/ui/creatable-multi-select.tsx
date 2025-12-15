"use client"

import * as React from "react"
import { X, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/components/ui/button"

export interface CreatableMultiSelectProps {
    options?: string[]
    value?: string[]
    onChange?: (value: string[]) => void
    placeholder?: string
    className?: string
}

export function CreatableMultiSelect({
    options = [],
    value = [],
    onChange,
    placeholder = "Select...",
    className
}: CreatableMultiSelectProps) {
    const [inputValue, setInputValue] = React.useState("")
    const [open, setOpen] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // Handle outside click to close dropdown
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault()
            addValue(inputValue.trim())
        } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
            removeValue(value[value.length - 1])
        }
    }

    const addValue = (newValue: string) => {
        if (!value.includes(newValue)) {
            onChange?.([...value, newValue])
        }
        setInputValue("")
        // Keep focus
        inputRef.current?.focus()
    }

    const removeValue = (valToRemove: string) => {
        onChange?.(value.filter(v => v !== valToRemove))
    }

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(opt)
    )

    const showCreateOption = inputValue.trim() && !options.some(opt => opt.toLowerCase() === inputValue.trim().toLowerCase()) && !value.includes(inputValue.trim())

    return (
        <div className={cn("relative", className)} ref={containerRef}>
            <div
                className="flex min-h-10 w-full flex-wrap gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background cursor-text focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
                onClick={() => {
                    inputRef.current?.focus()
                    setOpen(true)
                }}
            >
                {value.map((item) => (
                    <Badge key={item} variant="secondary" className="hover:bg-secondary/80">
                        {item}
                        <button
                            className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    removeValue(item);
                                }
                            }}
                            onMouseDown={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                            }}
                            onClick={() => removeValue(item)}
                        >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                    </Badge>
                ))}
                <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value)
                        setOpen(true)
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setOpen(true)}
                    placeholder={value.length === 0 ? placeholder : ""}
                    className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground min-w-[120px]"
                />
            </div>

            {open && (inputValue || filteredOptions.length > 0) && (
                <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 bg-white">
                    <div className="p-1">
                        {filteredOptions.length === 0 && !showCreateOption && (
                            <p className="p-2 text-sm text-muted-foreground">No matches found.</p>
                        )}

                        {filteredOptions.map((opt) => (
                            <div
                                key={opt}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                    addValue(opt)
                                    setInputValue("")
                                }}
                            >
                                {opt}
                            </div>
                        ))}

                        {showCreateOption && (
                            <div
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 cursor-pointer text-blue-600 font-medium"
                                onClick={() => {
                                    addValue(inputValue.trim())
                                }}
                            >
                                Create "{inputValue}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
