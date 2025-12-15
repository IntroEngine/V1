"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Copy, Check, Clock, User, Building, MessageSquare } from "lucide-react"

// --- Types ---
type SuggestedAction = {
    id: string
    title: string
    description: string
    priority: 'High' | 'Medium'
    // Mapping properties to match previous mock structure if needed, or adapting UI
    // The DashboardService returns { id, title, description, priority }
    // We need to adapt the UI to display this simpler Action type, 
    // OR update the Service to return rich data. 
    // For now, let's adapt the UI to handle the simpler 'Action' type from DashboardService 
    // but the UI expects 'SuggestedAction' with context, message_preview etc.
    // Since 'remove mocks' is the goal, we should probably stick to what the API returns.
}

export default function ActionsPage() {
    const [actions, setActions] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchActions = async () => {
            setIsLoading(true)
            try {
                const res = await fetch('/api/actions')
                if (res.ok) {
                    const data = await res.json()
                    setActions(data)
                }
            } catch (e) {
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchActions()
    }, [])

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700 max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                        Acciones Sugeridas
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Follow-ups y activaciones recomendadas por el motor de IA para hoy.
                    </p>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">Cargando acciones...</div>
                ) : actions.length === 0 ? (
                    <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <Check className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">¡Todo al día!</h3>
                            <p className="text-gray-600 mt-2 max-w-sm">
                                No hay acciones pendientes por ahora. El motor de IA te notificará cuando detecte nuevas oportunidades.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    actions.map((action) => (
                        <ActionItem key={action.id} action={action} />
                    ))
                )}
            </div>

        </div>
    )
}

function ActionItem({ action }: { action: any }) {
    const [copied, setCopied] = useState(false)

    // Fallback or mapped values
    const type = action.priority === 'High' ? 'Alta Prioridad' : 'Acción';
    const description = action.description || '';
    const message = action.message_preview || '';

    const handleCopy = () => {
        if (!message) return;
        navigator.clipboard.writeText(message)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(255,90,0,0.08)] transition-all duration-300">
            <CardContent className="p-5 flex flex-col md:flex-row gap-5">

                {/* Icon & Status Column */}
                <div className="flex flex-col items-center gap-2 min-w-[80px] pt-1">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center ${action.priority === 'High' ? 'bg-[#FF5A00]/10 text-[#FF5A00]' : 'bg-blue-50 text-blue-600'}`}>
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <Badge variant={action.priority === 'High' ? 'default' : 'secondary'} className={`text-[10px] uppercase font-bold text-center ${action.priority === 'High' ? 'bg-[#FF5A00] hover:bg-[#FF5A00]/90' : ''}`}>
                        {type}
                    </Badge>
                </div>

                {/* Content Column */}
                <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                {action.title}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1 leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>

                    {/* Message Preview Box - Only if exists */}
                    {message && (
                        <div className="bg-white/50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700 font-mono relative group shadow-sm">
                            "{message}"
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="sm" variant="ghost" className="h-7 px-2 text-xs bg-white border border-gray-200 shadow-sm" onClick={handleCopy}>
                                    {copied ? <Check className="h-3 w-3 mr-1 text-green-600" /> : <Copy className="h-3 w-3 mr-1" />}
                                    {copied ? 'Copiado' : 'Copiar'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions Column */}
                <div className="flex flex-row md:flex-col justify-end gap-2 min-w-[140px] border-l border-gray-100 md:pl-5 md:ml-2">
                    {message && (
                        <Button className="w-full whitespace-nowrap bg-gray-900 hover:bg-gray-800 text-white" size="sm" onClick={handleCopy}>
                            <Copy className="mr-2 h-4 w-4" /> Copiar Tech
                        </Button>
                    )}
                    <Link href={`/opportunities`} className="w-full">
                        <Button variant="outline" className="w-full whitespace-nowrap border-gray-200 hover:bg-[#FF5A00]/5 hover:text-[#FF5A00] hover:border-[#FF5A00]/20" size="sm">
                            Ver Detalles <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
