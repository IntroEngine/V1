"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, X, Globe } from "lucide-react"
import { findLookalikes, saveProspect } from "@/services/ai/enrichment-service"
import { useToast } from "@/components/ui/use-toast"

export function ExpansionResults() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [prospects, setProspects] = useState<any[]>([])
    const [hasRun, setHasRun] = useState(false)

    const handleExpand = async () => {
        setLoading(true)
        try {
            const results = await findLookalikes()
            setProspects(results)
            setHasRun(true)
            toast({ title: "Búsqueda Completada", description: `La IA encontró ${results.length} empresas potenciales fuera de tu red.` })
        } catch (e) {
            toast({ title: "Error", description: "No se pudo completar la expansión.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (prospect: any) => {
        const res = await saveProspect(prospect)
        if (res.success) {
            toast({ title: "Prospecto Guardado", description: `${prospect.name} añadido a tus oportunidades.` })
            // Remove from list or mark as saved
            setProspects(prev => prev.filter(p => p.domain !== prospect.domain))
        } else {
            toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" })
        }
    }

    const handleReject = (domain: string) => {
        setProspects(prev => prev.filter(p => p.domain !== domain))
    }

    return (
        <Card className="h-full border-purple-200 bg-purple-50/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-950 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Capa 3: Expansión IA
                    </CardTitle>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">Outbound</Badge>
                </div>
                <CardDescription>
                    Encuentra "Lookalikes" fuera de tu red.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!hasRun && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-4 rounded-full bg-purple-100 p-3">
                            <Globe className="h-8 w-8 text-purple-600" />
                        </div>
                        <h3 className="mb-2 font-semibold text-gray-900">¿Expandir Búsqueda?</h3>
                        <p className="mb-6 text-sm text-gray-500 max-w-[240px]">
                            La IA buscará empresas similares a tu ICP que NO están en tu red.
                        </p>
                        <Button onClick={handleExpand} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                            {loading ? "Buscando..." : "Expandir con IA"}
                        </Button>
                    </div>
                )}

                {hasRun && prospects.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        No se encontraron nuevos prospectos.
                    </div>
                )}

                {hasRun && prospects.map((p) => (
                    <div key={p.domain} className="rounded-md bg-white p-4 shadow-sm border border-purple-100 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-gray-900">{p.name}</span>
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">{p.score}% ICP</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                            {p.topics.map((t: string) => (
                                <span key={t} className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-50 px-2 py-0.5 rounded">
                                    {t}
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => handleApprove(p)}>
                                <Check className="h-4 w-4 mr-1" /> Aprobar
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 text-gray-500 hover:text-red-600" onClick={() => handleReject(p.domain)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
