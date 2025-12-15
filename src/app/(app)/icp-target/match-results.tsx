"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, PlayCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { runNetworkAnalysis, seedNetworkData, getSavedAnalysis } from "@/app/actions/network-actions"
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
    const [totalAnalyzed, setTotalAnalyzed] = useState(0)
    const [totalMatches, setTotalMatches] = useState(0)
    const [hasRun, setHasRun] = useState(false)
    const [page, setPage] = useState(1)
    const pageSize = 10

    // Load saved analysis on mount or page change
    useEffect(() => {
        const loadSaved = async () => {
            setLoading(true)
            try {
                const saved = await getSavedAnalysis(page, pageSize)
                if (saved && saved.matches.length > 0) {
                    setMatches(saved.matches)
                    setTotalAnalyzed(saved.totalAnalyzed)
                    setTotalMatches(saved.totalCount || 0)
                    setHasRun(true)
                } else if (page > 1) {
                    // Handle case where we go to a page with no results (shouldn't happen with correct math but safe fallback)
                    setMatches([])
                }
            } catch (e) {
                console.error("Failed to load saved analysis", e)
            } finally {
                setLoading(false)
            }
        }
        loadSaved()
    }, [page])

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
                setTotalAnalyzed(result.totalAnalyzed || 0)
                setTotalMatches(result.matches.length || 0)
                setHasRun(true)
                setPage(1) // Reset to page 1
                toast({
                    title: "Análisis Completado",
                    description: `Analizadas ${result.totalAnalyzed} empresas. Encontrados ${result.matches.length} matches.`
                })
            }
        } catch (e) {
            toast({ title: "Error", description: "Fallo al analizar la red.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const totalPages = Math.ceil(totalMatches / pageSize)

    return (
        <Card className="h-full border-blue-100 bg-blue-50/10 shadow-lg flex flex-col">
            <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent border-b border-blue-100 pb-4 shrink-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-950 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                        Capa 2: Tu Red
                    </CardTitle>
                    <Badge variant="secondary" className="bg-blue-100/50 text-blue-700 border-blue-200">AI Analysis</Badge>
                </div>
                <CardDescription>
                    Empresas en tu red que coinciden con tu ICP.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6 flex-1 flex flex-col min-h-0">
                {!hasRun && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-6 rounded-full bg-blue-50 p-6 ring-1 ring-blue-100">
                            <PlayCircle className="h-10 w-10 text-blue-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">¿Listo para analizar?</h3>
                        <p className="mb-8 text-sm text-muted-foreground max-w-[260px]">
                            Simularemos la carga de tu red de LinkedIn y detectaremos matches automáticamente.
                        </p>
                        <Button
                            onClick={handleSeedAndRun}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 w-full sm:w-auto"
                        >
                            {loading ? "Analizando..." : "Cargar Datos & Analizar"}
                        </Button>
                    </div>
                )}

                {hasRun && matches.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <RefreshCw className="h-8 w-8 mb-4 opacity-20" />
                        <p>No se encontraron matches con tu ICP actual.</p>
                    </div>
                )}

                {hasRun && (
                    <>
                        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                            {matches.map((match, idx) => (
                                <div key={idx} className={`group rounded-lg bg-white p-4 shadow-sm border transition-all hover:shadow-md ${match.matchType === 'ICP Match' ? 'border-green-200 ring-1 ring-green-100' : 'border-gray-100'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-gray-900">{match.companyName}</span>
                                        <Badge className={
                                            match.matchType === 'ICP Match' ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' :
                                                match.matchType === 'ICP Parcial' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-200'
                                        } variant="outline">
                                            {match.matchType}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                        {match.matchingCriteria.length > 0 ? `Criteria: ${match.matchingCriteria.join(", ")}` : "Sin criteria clara"}
                                    </p>
                                    {match.connectionStrength && (
                                        <div className="text-xs font-medium text-gray-700 flex items-center gap-2 pt-2 border-t border-gray-50">
                                            <span>Fuerza:</span>
                                            <div className="flex gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <div key={i} className={`h-1.5 w-1.5 rounded-full transition-colors ${i < match.connectionStrength! ? 'bg-blue-500' : 'bg-gray-200'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 shrink-0">
                            <div className="text-sm text-gray-500">
                                Página {page} de {totalPages || 1}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || loading}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || loading}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Button variant="ghost" size="sm" onClick={handleSeedAndRun} disabled={loading} className="w-full gap-2 text-muted-foreground hover:text-foreground">
                                <RefreshCw className="h-3.5 w-3.5" />
                                Re-analizar Red
                            </Button>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
