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
            const { prospects, error } = await findLookalikes()

            if (error) {
                toast({
                    title: "Error AI",
                    description: error,
                    variant: "destructive"
                })
                setProspects([])
            } else {
                setProspects(prospects)
                setHasRun(true)
                toast({
                    title: "Búsqueda Completada",
                    description: `La IA encontró ${prospects.length} empresas potenciales fuera de tu red.`
                })
            }
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
        <Card className="h-full border-purple-100 bg-purple-50/10 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50/50 to-transparent border-b border-purple-100 pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-950 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600 animate-pulse" />
                        Capa 3: Expansión IA
                    </CardTitle>
                    <Badge variant="secondary" className="bg-purple-100/50 text-purple-700 border-purple-200">Outbound</Badge>
                </div>
                <CardDescription>
                    Encuentra "Lookalikes" fuera de tu red.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                {!hasRun && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="mb-6 rounded-full bg-purple-50 p-6 ring-1 ring-purple-100">
                            <Globe className="h-10 w-10 text-purple-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">¿Expandir Búsqueda?</h3>
                        <p className="mb-8 text-sm text-muted-foreground max-w-[260px]">
                            La IA buscará empresas similares a tu ICP que NO están en tu red.
                        </p>
                        <Button
                            onClick={handleExpand}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 w-full sm:w-auto"
                        >
                            {loading ? (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                    Buscando...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="mr-2 h-4 w-4" />
                                    Expandir con IA
                                </>
                            )}
                        </Button>
                    </div>
                )}

                {hasRun && prospects.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <Globe className="h-8 w-8 mb-4 opacity-20" />
                        <p>No se encontraron nuevos prospectos.</p>
                    </div>
                )}

                {hasRun && prospects.map((p) => (
                    <div key={p.domain} className="group rounded-lg bg-white p-4 shadow-sm border border-purple-50 hover:border-purple-200 hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{p.name}</span>
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100">{p.score}% ICP</Badge>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {p.topics.slice(0, 3).map((t: string) => (
                                <span key={t} className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 font-medium">
                                    {t}
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-sm" onClick={() => handleApprove(p)}>
                                <Check className="h-4 w-4 mr-1.5" /> Aprobar
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 hover:border-red-200" onClick={() => handleReject(p.domain)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
