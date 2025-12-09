import { cn } from '@/components/ui/button'

type LoadingSpinnerProps = {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4 border-2',
        md: 'h-8 w-8 border-4',
        lg: 'h-12 w-12 border-4'
    }

    return (
        <div
            className={cn(
                'animate-spin rounded-full border-gray-200 border-t-[#FF5A00]',
                sizeClasses[size],
                className
            )}
        />
    )
}

type LoadingStateProps = {
    message?: string
}

export function LoadingState({ message = 'Cargando...' }: LoadingStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-sm text-gray-600">{message}</p>
        </div>
    )
}
