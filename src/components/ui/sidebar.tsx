"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Building2, Users, Lightbulb, CheckSquare, BarChart3, UserCircle, Settings, Network, Target, LogOut, ChevronLeft, ChevronRight } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

import { cn } from "@/utils/cn"

// Inline cn for safety if util is missing in this context
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Objetivo ICP", href: "/icp-target", icon: Target },
    { name: "Mi Red", href: "/my-network", icon: Network },
    { name: "Empresas", href: "/companies", icon: Building2 },
    { name: "Contactos", href: "/contacts", icon: Users },
    { name: "Oportunidades", href: "/opportunities", icon: Lightbulb },
    { name: "Acciones", href: "/actions", icon: CheckSquare },
    { name: "Resumen Semanal", href: "/reports", icon: BarChart3 },
]

export function Sidebar({ isCollapsed, onToggle }: { isCollapsed: boolean; onToggle: () => void }) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push("/login")
        router.refresh()
    }

    return (
        <div className={cn(
            "flex h-full flex-col border-r border-gray-200 bg-gray-50 transition-all duration-300 relative",
            isCollapsed ? "w-16" : "w-64"
        )}>
            {/* Toggle Button - Floating on border */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-9 bg-white border border-gray-200 rounded-full p-1.5 shadow-md hover:bg-gray-50 text-gray-500 z-50 hover:text-[#FF5A00] transition-colors"
            >
                {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </button>
            <div className={cn(
                "flex h-16 items-center border-b border-gray-200 transition-all duration-300",
                isCollapsed ? "justify-center px-0" : "px-6 justify-between"
            )}>
                {!isCollapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-gray-900 overflow-hidden whitespace-nowrap">
                        <div className="h-8 w-8 rounded-lg bg-[#FF5A00] text-white flex items-center justify-center font-bold flex-shrink-0">IE</div>
                        <span>IntroEngine</span>
                    </Link>
                )}
                {isCollapsed && (
                    <div className="h-8 w-8 rounded-lg bg-[#FF5A00] text-white flex items-center justify-center font-bold flex-shrink-0">IE</div>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={classNames(
                                isActive
                                    ? "bg-[#FF5A00]/10 text-[#FF5A00] font-medium"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                                "group flex items-center rounded-md px-2 py-2 text-sm transition-colors",
                                isCollapsed ? "justify-center" : ""
                            )}
                            title={isCollapsed ? item.name : undefined}
                        >
                            <item.icon className={classNames(
                                isActive ? "text-[#FF5A00]" : "text-gray-500 group-hover:text-gray-900",
                                "h-5 w-5 flex-shrink-0",
                                isCollapsed ? "mr-0" : "mr-3"
                            )} />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    )
                })}
            </nav>

            <div className="relative border-t border-gray-200">
                {/* Toggle Button removed from here */}
                <div className="p-4">
                    {!isCollapsed && (
                        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                            <Settings className="h-5 w-5" />
                            Settings
                        </Link>
                    )}

                    <div className={cn("mt-4 flex items-center gap-3 px-3", isCollapsed ? "justify-center" : "")}>
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <UserCircle className="h-6 w-6 text-gray-500" />
                        </div>
                        {!isCollapsed && (
                            <div className="text-sm overflow-hidden whitespace-nowrap">
                                <p className="font-medium text-gray-900">Usuario Demo</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className={cn(
                            "mt-4 flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors",
                            isCollapsed ? "justify-center" : ""
                        )}
                        title="Cerrar Sesión"
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span>Cerrar Sesión</span>}
                    </button>
                </div>
            </div>
        </div>
    )
}
