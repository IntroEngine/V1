"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Check, Copy, User, Building2, TrendingUp, Share2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

// Mock Data Detail
const MOCK_DETAIL = {
    id: '1',
    company: 'Acme Corp',
    type: 'intro',
    status: 'suggested',
    scores: {
        lead_potential: 95,
        industry_fit: 98,
        buying_signals: 85,
        intro_strength: 90
    },
    target_contact: { name: 'Juan Perez', role: 'CTO' },
    bridge_contact: { name: 'Maria Gomez', role: 'Ex-Colleague' },
    suggested_message: "Hola Maria, vi que estás conectada con Juan Perez en Acme Corp. Estamos intentando acercarnos a ellos porque encajan perfecto con nuestra nueva funcionalidad de IA. ¿Crees que tendría sentido una intro rápida para validar si esto les sirve? ¡Abrazo!"
}

export default function OpportunityDetailPage({ params }: { params: { id: string } }) {
    // const { id } = params // In real app use ID to fetch
    const opp = MOCK_DETAIL
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(opp.suggested_message)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleStatusChange = (newStatus: string) => {
        console.log(`Changing status to ${newStatus}...`)
        // TODO: API Call
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">

            {/* Navbar / Breadcrumb */}
            <div className="flex items-center gap-4">
                <Link href="/opportunities">
                    <Button variant="ghost" size="sm"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Button>
                </Link>
            </div>

            {/* Main Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded bg-slate-100 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-slate-500" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{opp.company}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="default" className="text-sm">Intro Opportunity</Badge>
                                <span className="text-muted-foreground text-sm flex items-center gap-1">
                                    Via: {opp.bridge_contact.name}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-500">Estado:</span>
                        <select
                            className="h-9 rounded-md border text-sm px-2 bg-background"
                            defaultValue={opp.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                        >
                            <option value="suggested">Sugerido</option>
                            <option value="intro_requested">Intro Pedida</option>
                            <option value="in_progress">En Curso</option>
                            <option value="won">Ganado</option>
                            <option value="lost">Perdido</option>
                        </select>
                    </div>
                    <Button onClick={() => handleStatusChange('intro_requested')}>
                        <Share2 className="mr-2 h-4 w-4" /> Marcar Intro Pedida
                    </Button>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

                {/* Left Column: Context & Message */}
                <div className="md:col-span-2 space-y-6">

                    {/* Score Analysis */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" /> Análisis de la IA
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                <ScoreMetric label="Lead Potential" value={opp.scores.lead_potential} color="text-primary" />
                                <ScoreMetric label="Industry Fit" value={opp.scores.industry_fit} />
                                <ScoreMetric label="Buying Signals" value={opp.scores.buying_signals} />
                                <ScoreMetric label="Intro Strength" value={opp.scores.intro_strength} />
                            </div>
                            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900 rounded-md text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                <strong>Insight:</strong> Acme Corp coincide un 98% con tu perfil ideal (Retail + Tamaño 50-200). Detectamos señales de contratación recientes en su equipo de tecnología, lo que indica presupuesto activo. La relación con Maria es fuerte, aumentando drásticamente la probabilidad de éxito.
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actionable Message */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span>Mensaje Sugerido</span>
                                <Button variant="ghost" size="sm" onClick={handleCopy}>
                                    {copied ? <Check className="h-4 w-4 text-green-600 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                                    {copied ? "Copiado" : "Copiar"}
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-slate-50 dark:bg-slate-900 border rounded-md p-4 text-sm font-mono whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                                {opp.suggested_message}
                            </div>
                            <p className="text-xs text-muted-foreground mt-3">
                                * Este mensaje está optimizado para ser enviado por WhatsApp o LinkedIn a tu contacto puente.
                            </p>
                        </CardContent>
                    </Card>

                </div>

                {/* Right Column: People */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Target (Prospecto)</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center">
                                <User className="h-5 w-5 text-slate-500" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{opp.target_contact.name}</p>
                                <p className="text-xs text-muted-foreground">{opp.target_contact.role}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {opp.type === 'intro' && (
                        <Card className="border-green-100 bg-green-50/20 dark:border-green-900 dark:bg-green-900/10">
                            <CardHeader>
                                <CardTitle className="text-base text-green-700 dark:text-green-400">Bridge (Conector)</CardTitle>
                            </CardHeader>
                            <CardContent className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-green-200 flex items-center justify-center">
                                    <User className="h-5 w-5 text-green-700" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">{opp.bridge_contact.name}</p>
                                    <p className="text-xs text-muted-foreground">{opp.bridge_contact.role}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <div className="text-center">
                        <Button variant="outline" className="w-full text-xs">
                            Ver en HubSpot
                        </Button>
                    </div>
                </div>
            </div>

        </div>
    )
}

function ScoreMetric({ label, value, color }: { label: string, value: number, color?: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className={`relative flex items-center justify-center h-16 w-16 rounded-full border-4 ${value > 80 ? 'border-primary/20' : 'border-slate-100'} mb-2`}>
                <span className={`text-xl font-bold ${color || 'text-slate-700 dark:text-slate-200'}`}>{value}</span>
            </div>
            <span className="text-xs font-medium text-slate-500">{label}</span>
        </div>
    )
}
