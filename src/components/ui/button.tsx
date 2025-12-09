import * as React from "react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-all duration-300 focus-visible:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background font-sans";

        const variants = {
            primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:scale-[1.02]",
            secondary: "bg-secondary/50 backdrop-blur-md border border-black/5 text-secondary-foreground hover:bg-secondary/70 shadow-sm hover:shadow-md hover:scale-[1.01]",
            ghost: "hover:bg-accent hover:text-accent-foreground hover:scale-[1.01]",
            outline: "border border-input hover:bg-accent hover:text-accent-foreground hover:scale-[1.01] hover:border-primary/30",
            danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md hover:shadow-lg hover:scale-[1.02]"
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 py-2 px-4",
            lg: "h-11 px-8 rounded-md"
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"
