"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Users, Send, Target, Calendar } from "lucide-react"

export default function ReportsPage() {
    // Dummy weekly stats
    const weeklyStats = {
        introsGenerated: 45,
        introsAccepted: 12,
        meetingsBooked: 8,
        responseRate: 67,
        avgResponseTime: "2.3 días"
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Resumen Semanal</h2>
                    <p className="text-gray-600 mt-1">
                        Análisis de rendimiento de los últimos 7 días.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Cambiar Período
                    </Button>
                    <Button size="sm">Exportar PDF</Button>
                </div>
            </div>

            {/* Weekly Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Intros Generadas</CardTitle>
                        <Send className="h-4 w-4 text-[#FF5A00]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{weeklyStats.introsGenerated}</div>
                        <div className="flex items-center text-xs text-[#FF5A00] mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +12% vs semana anterior
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Intros Aceptadas</CardTitle>
                        <Users className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{weeklyStats.introsAccepted}</div>
                        <p className="text-xs text-gray-600 mt-1">26.7% tasa de aceptación</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Reuniones Agendadas</CardTitle>
                        <Target className="h-4 w-4 text-[#FF5A00]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{weeklyStats.meetingsBooked}</div>
                        <p className="text-xs text-gray-600 mt-1">66.7% conversión</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Tasa de Respuesta</CardTitle>
                        <TrendingUp className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{weeklyStats.responseRate}%</div>
                        <p className="text-xs text-gray-600 mt-1">{weeklyStats.avgResponseTime} promedio</p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Report */}
            <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-900">Análisis Detallado</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Top Performers */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Mejores Conexiones</h3>
                            <div className="space-y-2">
                                {[
                                    { name: "María González", intros: 8, meetings: 5 },
                                    { name: "Carlos Ruiz", intros: 6, meetings: 4 },
                                    { name: "Ana Martínez", intros: 5, meetings: 3 }
                                ].map((person, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/60 border border-gray-200">
                                        <div>
                                            <p className="font-medium text-gray-900">{person.name}</p>
                                            <p className="text-xs text-gray-600">{person.intros} intros generadas</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-[#FF5A00]">{person.meetings}</p>
                                            <p className="text-xs text-gray-600">reuniones</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Insights */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Insights Clave</h3>
                            <div className="space-y-2">
                                <div className="p-3 rounded-lg bg-[#FF5A00]/5 border border-[#FF5A00]/20">
                                    <p className="text-sm text-gray-900">🎯 Las intros enviadas los martes tienen un 23% más de respuesta</p>
                                </div>
                                <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                    <p className="text-sm text-gray-900">📈 Tu tasa de conversión ha mejorado un 15% este mes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
