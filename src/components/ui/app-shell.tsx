"use client"

import { ReactNode, useState } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"

interface AppShellProps {
    children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    return (
        <div className="flex h-screen w-full bg-gradient-to-br from-white via-gray-50/30 to-white">
            <Sidebar isCollapsed={isSidebarCollapsed} onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
            <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-7xl h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
