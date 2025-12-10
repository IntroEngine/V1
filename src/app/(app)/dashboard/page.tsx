"use client"

import { useEffect, useState } from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Users, Send, CheckCircle2, Lightbulb } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoadingState, LoadingSpinner } from "@/components/ui/loading-spinner"
import { StatsSkeleton, TableSkeleton } from "@/components/ui/loading-skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { ErrorDisplay } from "@/components/ui/error-display"

// Types for dummy data
type DashboardStats = {
    introsSuggested: number;
    introsRequested: number;
    outboundSuggested: number;
    wonDeals: number;
}

type Opportunity = {
    id: string
    company: string
    type: 'Intro' | 'Outbound'
    score: number
    status: 'Suggested' | 'Requested' | 'In Progress' | 'Won'
}

type Action = {
    id: string
    title: string
    description: string
    priority: 'High' | 'Medium'
}

export default function DashboardPage() {
    const toast = useToast()

    // Simulated loading and error states
    const [isLoading, setIsLoading] = useState(false)
    const [hasError, setHasError] = useState(false)

    // State for real data
    const [stats, setStats] = useState<DashboardStats>({
        introsSuggested: 0,
        introsRequested: 0,
        outboundSuggested: 0,
        wonDeals: 0
    })
    const [recentOpps, setRecentOpps] = useState<Opportunity[]>([])
    const [actions, setActions] = useState<Action[]>([])

    // Fetch Data
    const fetchDashboardData = async () => {
        setIsLoading(true)
        setHasError(false)
        try {
            const res = await fetch('/api/dashboard/stats')
            if (!res.ok) throw new Error("Failed to fetch dashboard stats")
            const data = await res.json()

            setStats(data.stats)
            setRecentOpps(data.opportunities)
            setActions(data.actions)
        } catch (error) {
            console.error(error)
            setHasError(true)
            toast.error("Error al cargar datos del dashboard")
        } finally {
            setIsLoading(false)
        }
    }

    // Load on mount
    useEffect(() => {
        fetchDashboardData()
    }, [])

    const handleRefreshData = () => {
        fetchDashboardData()
        toast.success("Datos actualizados")
    }

    const handleExecuteAction = (actionTitle: string) => {
        toast.success(`Acción ejecutada: ${actionTitle} `)
    }

    const handleViewReports = () => {
        toast.warning("Los reportes estarán disponibles próximamente")
    }

    const handleRetry = () => {
        fetchDashboardData()
    }

    // Error State
    if (hasError) {
        return (
            <ErrorDisplay
                message="No se pudieron cargar los datos del dashboard"
                details="Error de conexión con el servidor. Por favor intenta de nuevo."
                onRetry={handleRetry}
            />
        )
    }

    // Loading State
    if (isLoading && stats.introsSuggested === 0) { // Only show skeleton on initial load if empty
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
                    </div>
                </div>
                <StatsSkeleton />
                <TableSkeleton rows={5} />
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Resumen general
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Vistazo rápido a la salud de tu pipeline esta semana.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={handleRefreshData}>
                        Actualizar datos
                    </Button>
                    <Button size="sm" onClick={handleViewReports}>
                        Ver reportes
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,90,0,0.08)] transition-all duration-300 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Intros Sugeridas</CardTitle>
                        <Users className="h-4 w-4 text-[#FF5A00]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.introsSuggested}</div>
                        <p className="text-xs text-gray-600 mt-1">Listas para revisar</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,90,0,0.08)] transition-all duration-300 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Intros Pedidas</CardTitle>
                        <Send className="h-4 w-4 text-[#FF5A00]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.introsRequested}</div>
                        <p className="text-xs text-gray-600 mt-1">En progreso</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,90,0,0.08)] transition-all duration-300 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Outbound Sugerido</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.outboundSuggested}</div>
                        <p className="text-xs text-gray-600 mt-1">Mensajes generados</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,90,0,0.08)] transition-all duration-300 rounded-2xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Deals Ganados</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-[#FF5A00]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.wonDeals}</div>
                        <p className="text-xs text-gray-600 mt-1">Este mes</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">

                {/* Top Opportunities Table */}
                <Card className="col-span-4 border-gray-200 bg-white/40 backdrop-blur-sm shadow-md rounded-2xl hover:shadow-[0_0_20px_rgba(255,90,0,0.08)] transition-all duration-300">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-gray-900">Oportunidades Destacadas</CardTitle>
                            <Button variant="ghost" size="sm" className="text-xs">Ver todas <ArrowRight className="ml-1 h-3 w-3" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentOpps.length === 0 ? (
                            <EmptyState
                                icon={Lightbulb}
                                title="No hay oportunidades"
                                description="La IA generará oportunidades a medida que analice tu red"
                                action={<Button size="sm" onClick={handleRefreshData}>Actualizar Análisis</Button>}
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-gray-900">Empresa</TableHead>
                                        <TableHead className="text-gray-900">Tipo</TableHead>
                                        <TableHead className="text-gray-900">Score</TableHead>
                                        <TableHead className="text-right text-gray-900">Estado</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentOpps.map((opp) => (
                                        <TableRow key={opp.id} className="hover:bg-white/60 transition-colors">
                                            <TableCell className="font-medium text-gray-900">{opp.company}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal border-gray-300">{opp.type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`font-bold ${opp.score > 90 ? 'text-[#FF5A00]' : 'text-gray-600'}`}>
                                                    {opp.score}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    variant={
                                                        opp.status === 'Suggested' ? 'secondary' :
                                                            opp.status === 'Won' ? 'success' :
                                                                opp.status === 'In Progress' ? 'outline' : 'default'
                                                    }
                                                    className={opp.status === 'Won' ? 'bg-[#FF5A00] text-white' : ''}
                                                >
                                                    {opp.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Recommended Actions List */}
                <Card className="col-span-3 border-gray-200 bg-white/40 backdrop-blur-sm shadow-md rounded-2xl hover:shadow-[0_0_20px_rgba(255,90,0,0.08)] transition-all duration-300">
                    <CardHeader>
                        <CardTitle className="text-gray-900">Acciones Recomendadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {actions.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">No hay acciones pendientes.</p>
                            ) : actions.map((action) => (
                                <div key={action.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white/60 p-4 hover:bg-white hover:scale-[1.01] transition-all duration-300">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-sm text-gray-900">{action.title}</span>
                                        {action.priority === 'High' && <span className="h-2 w-2 rounded-full bg-[#FF5A00]" title="Alta Prioridad" />}
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-2">
                                        {action.description}
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="w-full mt-1"
                                        onClick={() => handleExecuteAction(action.title)}
                                    >
                                        Ejecutar Acción
                                    </Button>
                                </div>
                            ))}

                            {actions.length > 0 && (
                                <div className="pt-2">
                                    <Button variant="ghost" className="w-full text-xs text-gray-600">
                                        Ver todas las sugerencias
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
