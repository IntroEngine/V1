"use client"

import { Bell } from "lucide-react"
import { Button } from "./button"

export function Topbar() {
    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <div>
                {/* Dynamic breadcrumb or page title could go here */}
                <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-600 ring-2 ring-white" />
                </Button>
                <div className="h-8 w-[1px] bg-border" />
                {/* Account Switcher could go here */}
                <span className="text-sm font-medium text-muted-foreground">Acme Corp</span>
            </div>
        </header>
    )
}
