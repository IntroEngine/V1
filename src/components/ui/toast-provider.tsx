"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

type Toast = {
    id: string
    type: ToastType
    title?: string
    message: string
    duration?: number
}

type ToastContextType = {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, [])

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newToast = { ...toast, id }

        setToasts((prev) => [...prev, newToast])

        // Auto-dismiss after duration (default 5s)
        const duration = toast.duration || 5000
        setTimeout(() => {
            removeToast(id)
        }, duration)
    }, [removeToast])

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    )
}

export function useToastContext() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToastContext must be used within ToastProvider')
    }
    return context
}
