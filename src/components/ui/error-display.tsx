import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './button'

type ErrorDisplayProps = {
    message: string
    details?: string
    onRetry?: () => void
}

export function ErrorDisplay({ message, details, onRetry }: ErrorDisplayProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="rounded-full bg-red-50 p-6 mb-4">
                <AlertCircle className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-sm text-gray-600 text-center max-w-md mb-4">{message}</p>
            {details && (
                <details className="text-xs text-gray-500 mb-6 max-w-md">
                    <summary className="cursor-pointer hover:text-gray-700">Ver detalles</summary>
                    <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto">{details}</pre>
                </details>
            )}
            {onRetry && (
                <Button onClick={onRetry} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar
                </Button>
            )}
        </div>
    )
}
