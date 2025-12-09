"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Copy, Check, Clock, User, Building, MessageSquare } from "lucide-react"

// --- Types ---
type SuggestedAction = {
    id: string
    type: 'bridge_followup' | 'prospect_followup' | 'outbound_intro'
    company: string
    contact: string
    days_inactive: number
    message_preview: string
    context?: string
}

// --- Mock Data ---
const MOCK_ACTIONS: SuggestedAction[] = [
    {
        id: '1',
        type: 'bridge_followup',
        company: 'Acme Corp',
        contact: 'Maria Gomez (Bridge)',
        days_inactive: 5,
        message_preview: "Hola Maria, ¿pudiste chequear el tema de la intro con Juan? Avísame si necesitas que te pase más info. ¡Gracias!",
        context: "Pediste intro hace 5 días sin respuesta."
    },
    {
        id: '2',
        type: 'prospect_followup',
        company: 'Globex Inc',
        contact: 'Carlos Ruiz (CEO)',
        days_inactive: 3,
        message_preview: "Hola Carlos, te comparto un caso de éxito similar a Globex que acabamos de publicar. Creo que aplica mucho a lo que hablamos.",
        context: "Demo realizada hace 3 días. Momento de aportar valor."
    },
    {
        id: '3',
        type: 'outbound_intro',
        company: 'Initech',
        contact: 'Bill Lumbergh (VP)',
        days_inactive: 0,
        message_preview: "Bill, vi que están escalando el equipo de ingeniería. En IntroEngine ayudamos a...",
        context: "Nuevo lead calificado detectado hoy."
    },
    {
        id: '4',
        type: 'bridge_followup',
        company: 'Soylent Corp',
        contact: 'Ana Friend (Bridge)',
        days_inactive: 7,
        message_preview: "Ana! ¿Cómo estás? Solo un bump amistoso sobre la intro con Mike. Sin presión, ¡abrazo!",
        context: "Intro pedida hace una semana."
    },
]

export default function ActionsPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">

            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Acciones Sugeridas</h2>
                <p className="text-muted-foreground mt-1">
                    Follow-ups y activaciones recomendadas por el motor de IA para hoy.
                </p>
            </div>

            {/* List */}
            <div className="space-y-4">
                {MOCK_ACTIONS.map((action) => (
                    <ActionItem key={action.id} action={action} />
                ))}
                {MOCK_ACTIONS.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                        ¡Todo al día! No hay acciones pendientes.
                    </div>
                )}
            </div>

        </div>
    )
}

function ActionItem({ action }: { action: SuggestedAction }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(action.message_preview)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className="hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <CardContent className="p-5 flex flex-col md:flex-row gap-5">

                {/* Icon & Status Column */}
                <div className="flex flex-col items-center gap-2 min-w-[80px] pt-1">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${action.type.includes('bridge') ? 'bg-green-100 text-green-700' :
                            action.type.includes('outbound') ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                        }`}>
                        <MessageSquare className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-center">
                        {action.type.replace('_', ' ')}
                    </Badge>
                </div>

                {/* Content Column */}
                <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                            <h3 className="font-semibold text-base flex items-center gap-2">
                                <Building className="h-4 w-4 text-slate-400" /> {action.company}
                                <span className="text-slate-300">|</span>
                                <User className="h-4 w-4 text-slate-400" /> {action.contact}
                            </h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" /> {action.days_inactive} días sin actividad • <span className="italic">{action.context}</span>
                            </p>
                        </div>
                    </div>

                    {/* Message Preview Box */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 border rounded p-3 text-sm text-slate-700 dark:text-slate-300 font-mono relative group">
                        "{action.message_preview}"
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="sm" variant="secondary" className="h-7 px-2 text-xs" onClick={handleCopy}>
                                {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                {copied ? 'Copiado' : 'Copiar'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Actions Column */}
                <div className="flex flex-row md:flex-col justify-end gap-2 min-w-[140px]">
                    <Button variant="default" className="w-full whitespace-nowrap" size="sm" onClick={handleCopy}>
                        <Copy className="mr-2 h-4 w-4" /> Copiar Msg
                    </Button>
                    <Link href={`/opportunities/${action.id}`} className="w-full">
                        <Button variant="outline" className="w-full whitespace-nowrap" size="sm">
                            Ver Oportunidad <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </CardContent>
        </Card>
    )
}
