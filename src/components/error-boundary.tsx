"use client"

import { Component, ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'

type ErrorBoundaryProps = {
    children: ReactNode
    fallback?: ReactNode
}

type ErrorBoundaryState = {
    hasError: boolean
    error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log error to console (and optionally to error tracking service)
        console.error('Error Boundary caught an error:', error, errorInfo)

        // TODO: Send to error tracking service (e.g., Sentry)
        // Sentry.captureException(error, { extra: errorInfo })
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50/30 to-white p-6">
                    <Card className="max-w-md w-full border-gray-200 bg-white/40 backdrop-blur-sm shadow-lg">
                        <CardContent className="pt-6 text-center">
                            <div className="rounded-full bg-red-50 p-6 inline-flex mb-4">
                                <AlertCircle className="h-12 w-12 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                Algo salió mal
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Encontramos un error inesperado. Por favor, intenta de nuevo.
                            </p>

                            {this.state.error && (
                                <details className="text-left mb-6 text-xs text-gray-500">
                                    <summary className="cursor-pointer hover:text-gray-700 mb-2">
                                        Detalles técnicos
                                    </summary>
                                    <pre className="p-3 bg-gray-50 rounded overflow-auto max-h-40">
                                        {this.state.error.toString()}
                                        {this.state.error.stack}
                                    </pre>
                                </details>
                            )}

                            <div className="flex gap-3 justify-center">
                                <Button variant="outline" onClick={this.handleReset}>
                                    Intentar de nuevo
                                </Button>
                                <Button onClick={() => window.location.href = '/dashboard'}>
                                    Ir al Dashboard
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )
        }

        return this.props.children
    }
}
