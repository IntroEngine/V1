"use client"

import * as React from "react"
import { cn } from "@/components/ui/button"

interface SliderProps extends Omit<React.ComponentPropsWithoutRef<"input">, "value" | "onChange"> {
    value?: number[]
    onValueChange?: (value: number[]) => void
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, value, onValueChange, ...props }, ref) => {

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (onValueChange) {
                onValueChange([Number(e.target.value)])
            }
        }

        return (
            <div className="relative flex w-full touch-none select-none items-center">
                <input
                    type="range"
                    className={cn(
                        "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF5A00]",
                        className
                    )}
                    ref={ref}
                    value={value?.[0] || 0}
                    onChange={handleChange}
                    {...props}
                />
            </div>
        )
    }
)
Slider.displayName = "Slider"

export { Slider }
