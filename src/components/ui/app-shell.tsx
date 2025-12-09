import { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

interface AppShellProps {
    children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-white via-gray-50/30 to-white">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
