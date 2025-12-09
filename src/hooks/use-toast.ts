import { useToastContext } from '@/components/ui/toast-provider'

export function useToast() {
    const { addToast } = useToastContext()

    return {
        success: (message: string, title?: string) => {
            addToast({ type: 'success', message, title })
        },
        error: (message: string, title?: string) => {
            addToast({ type: 'error', message, title })
        },
        warning: (message: string, title?: string) => {
            addToast({ type: 'warning', message, title })
        },
        info: (message: string, title?: string) => {
            addToast({ type: 'info', message, title })
        },
    }
}
