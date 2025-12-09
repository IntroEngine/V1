"use client"

import { useToastContext } from './toast-provider'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export function ToastContainer() {
    const { toasts, removeToast } = useToastContext()

    const getToastStyles = (type: string) => {
        switch (type) {
            case 'success':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-500',
                    icon: CheckCircle,
                    iconColor: 'text-green-600'
                }
            case 'error':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-500',
                    icon: XCircle,
                    iconColor: 'text-red-600'
                }
            case 'warning':
                return {
                    bg: 'bg-amber-50',
                    border: 'border-amber-500',
                    icon: AlertTriangle,
                    iconColor: 'text-amber-600'
                }
            case 'info':
            default:
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-500',
                    icon: Info,
                    iconColor: 'text-blue-600'
                }
        }
    }

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => {
                const styles = getToastStyles(toast.type)
                const Icon = styles.icon

                return (
                    <div
                        key={toast.id}
                        className={`${styles.bg} bg-white/90 backdrop-blur-md border-l-4 ${styles.border} rounded-lg shadow-lg p-4 min-w-[320px] max-w-md pointer-events-auto animate-in slide-in-from-right duration-300`}
                    >
                        <div className="flex items-start gap-3">
                            <Icon className={`h-5 w-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
                            <div className="flex-1 min-w-0">
                                {toast.title && (
                                    <p className="font-medium text-gray-900 mb-1">{toast.title}</p>
                                )}
                                <p className="text-sm text-gray-600">{toast.message}</p>
                            </div>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
