"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, ArrowRight } from "lucide-react"

interface WeeklyAdvisorResult {
    metrics: {
        introsGenerated: number
        introsRequested: number
        responses: number
        pendingOutbound: number
        won: number
        lost: number
    }
    insights: string[]
    recommendedActions: string[]
}

const DUMMY_DATA: WeeklyAdvisorResult = {
    metrics: {
        introsGenerated: 12,
        introsRequested: 8,
        responses: 5,
        pendingOutbound: 4,
        won: 1,
        lost: 2
    },
    insights: [
        "El sector 'Fintech' está respondiendo un 20% mejor que la media.",
        "Los miércoles por la mañana son el momento más efectivo para tus intros.",
        "Necesitas aumentar el volumen de intros generadas para alcanzar tu meta mensual."
    ],
    recommendedActions: [
        "Revisar y aprobar las 4 intros pendientes de envío.",
        "Contactar de nuevo a los 3 leads que abrieron el correo pero no respondieron.",
        "Explorar nuevas oportunidades en el sector salud (alta afinidad detectada)."
    ]
}

export default function WeeklySummaryPage() {
    return (
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resumen semanal</h1>
                <Button variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Regenerar resumen
                </Button>
            </div>

            {/* Numeric Summary Block */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                <MetricCard title="Intros generadas" value={DUMMY_DATA.metrics.introsGenerated} />
                <MetricCard title="Intros pedidas" value={DUMMY_DATA.metrics.introsRequested} />
                <MetricCard title="Respuestas" value={DUMMY_DATA.metrics.responses} />
                <MetricCard title="Outbound pdte." value={DUMMY_DATA.metrics.pendingOutbound} />
                <MetricCard title="Ganadas" value={DUMMY_DATA.metrics.won} className="text-green-600" />
                <MetricCard title="Perdidas" value={DUMMY_DATA.metrics.lost} className="text-red-600" />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Insights Block */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Insights clave</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {DUMMY_DATA.insights.map((insight, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                                        i
                                    </span>
                                    <span className="text-sm text-slate-600">{insight}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>

                {/* Recommended Actions Block */}
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Acciones recomendadas</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col h-full justify-between gap-6">
                        <ol className="space-y-4 list-decimal list-inside text-sm text-slate-600">
                            {DUMMY_DATA.recommendedActions.map((action, index) => (
                                <li key={index} className="pl-2 marker:font-medium marker:text-slate-900">
                                    <span className="-ml-1">{action}</span>
                                </li>
                            ))}
                        </ol>
                        <div className="pt-2">
                            <Button variant="ghost" size="sm" className="gap-2 -ml-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                                Ver oportunidades relacionadas
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function MetricCard({ title, value, className }: { title: string, value: number, className?: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4">
                <CardTitle className="text-sm font-medium text-slate-500">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className={`text-2xl font-bold ${className}`}>{value}</div>
            </CardContent>
        </Card>
    )
}
