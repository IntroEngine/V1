"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Building2, Users, Lightbulb, CheckSquare, BarChart3, UserCircle, Settings, Network } from "lucide-react"

import { cn } from "@/utils/cn"

// Inline cn for safety if util is missing in this context
function classNames(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(' ')
}

const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Mi Red", href: "/my-network", icon: Network },
    { name: "Empresas", href: "/companies", icon: Building2 },
    { name: "Contactos", href: "/contacts", icon: Users },
    { name: "Oportunidades", href: "/opportunities", icon: Lightbulb },
    { name: "Acciones", href: "/actions", icon: CheckSquare },
    { name: "Resumen Semanal", href: "/reports", icon: BarChart3 },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full w-64 flex-col border-r border-gray-200 bg-gray-50">
            <div className="flex h-16 items-center border-b border-gray-200 px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-gray-900">
                    <div className="h-8 w-8 rounded-lg bg-[#FF5A00] text-white flex items-center justify-center font-bold">IE</div>
                    <span>IntroEngine</span>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={classNames(
                                isActive
                                    ? "bg-[#FF5A00]/10 text-[#FF5A00] font-medium border-l-2 border-[#FF5A00]"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                                "group flex items-center rounded-md px-3 py-2 text-sm transition-colors"
                            )}
                        >
                            <item.icon className={classNames(
                                isActive ? "text-[#FF5A00]" : "text-gray-500 group-hover:text-gray-900",
                                "mr-3 h-5 w-5 flex-shrink-0"
                            )} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            <div className="border-t border-gray-200 p-4">
                <Link href="/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                    <Settings className="h-5 w-5" />
                    Settings
                </Link>
                <div className="mt-4 flex items-center gap-3 px-3">
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                        <UserCircle className="h-6 w-6 text-gray-500" />
                    </div>
                    <div className="text-sm">
                        <p className="font-medium text-gray-900">Usuario Demo</p>
                        <p className="text-xs text-gray-600">demo@introengine.com</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
