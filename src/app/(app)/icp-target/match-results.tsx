"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, PlayCircle } from "lucide-react"
import { runNetworkAnalysis, seedNetworkData } from "@/app/actions/network-actions"
import { useToast } from "@/components/ui/use-toast"

type MatchResult = {
    companyName: string
    matchScore: number
    matchType: "ICP Match" | "ICP Parcial" | "No ICP"
    matchingCriteria: string[]
    missingCriteria: string[]
    connectionStrength?: number
}

export function MatchResults() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [matches, setMatches] = useState<MatchResult[]>([])
    const [hasRun, setHasRun] = useState(false)

    const handleSeedAndRun = async () => {
        setLoading(true)
        try {
            // 1. Seed Data
            await seedNetworkData()

            // 2. Run Analysis
            const result = await runNetworkAnalysis()
            if (result.error) {
                toast({ title: "Error", description: result.error, variant: "destructive" })
            } else {
                setMatches(result.matches || [])
                setHasRun(true)
                toast({ title: "Análisis Completado", description: `Se encontraron ${result.matches.length} empresas en tu red.` })
            }
        } catch (e) {
            toast({ title: "Error", description: "Fallo al analizar la red.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="h-full border-blue-200 bg-blue-50/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-950">Capa 2: Tu Red</CardTitle>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700">No IA</Badge>
                </div>
                <CardDescription>
                    Empresas en tu red que coinciden con tu ICP.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!hasRun && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-4 rounded-full bg-blue-100 p-3">
                            <PlayCircle className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="mb-2 font-semibold text-gray-900">¿Listo para analizar?</h3>
                        <p className="mb-6 text-sm text-gray-500 max-w-[240px]">
                            Simularemos la carga de tu red de LinkedIn y detectaremos matches automáticamente.
                        </p>
                        <Button onClick={handleSeedAndRun} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? "Analizando..." : "Cargar Datos & Analizar"}
                        </Button>
                    </div>
                )}

                {hasRun && matches.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No se encontraron matches con tu ICP actual.
                    </div>
                )}

                {hasRun && matches.map((match, idx) => (
                    <div key={idx} className={`rounded-md bg-white p-4 shadow-sm border ${match.matchType === 'ICP Match' ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100 opacity-80'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{match.companyName}</span>
                            <Badge className={
                                match.matchType === 'ICP Match' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                    match.matchType === 'ICP Parcial' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500'
                            }>
                                {match.matchType}
                            </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">
                            {match.matchingCriteria.length > 0 ? `Criteria: ${match.matchingCriteria.join(", ")}` : "Sin criteria clara"}
                        </p>
                        {match.connectionStrength && (
                            <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
                                <span>Fuerza de Intro:</span>
                                <div className="flex gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className={`h-1.5 w-1.5 rounded-full ${i < match.connectionStrength! ? 'bg-blue-500' : 'bg-gray-200'}`} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {hasRun && (
                    <div className="pt-4">
                        <Button variant="outline" size="sm" onClick={handleSeedAndRun} disabled={loading} className="w-full gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Re-analizar
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
