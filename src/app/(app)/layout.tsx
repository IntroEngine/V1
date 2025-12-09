import { AppShell } from "@/components/ui/app-shell"
import { ErrorBoundary } from "@/components/error-boundary"
import { ToastProvider } from "@/components/ui/toast-provider"
import { ToastContainer } from "@/components/ui/toast"

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ErrorBoundary>
            <ToastProvider>
                <AppShell>
                    {children}
                </AppShell>
                <ToastContainer />
            </ToastProvider>
        </ErrorBoundary>
    )
}
