import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, CheckCircle2 } from "lucide-react"

export function LandingHero() {
    return (
        <section className="relative px-6 py-24 md:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border-b overflow-hidden">
            <div className="mx-auto max-w-7xl grid lg:grid-cols-2 gap-12 items-center">

                {/* Text Content */}
                <div className="space-y-8">
                    <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
                        Nuevo: Integración con HubSpot V3 🚀
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                        Convierte tu red en una <span className="text-primary">máquina de demos</span>
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                        IntroEngine es el agente de prospección inteligente que detecta intros calientes, prioriza empresas con señales de compra y automatiza tu outbound sin perder el toque personal.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" className="h-12 px-8 text-base">
                            Solicitar acceso
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                            Ver cómo funciona
                        </Button>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Sin tarjeta requerida</span>
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" /> Setup en 5 min</span>
                    </div>
                </div>

                {/* Mock Dashboard */}
                <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none">
                    <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full transform -translate-y-4" />
                    <Card className="relative shadow-2xl border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
                        <CardHeader className="border-b pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle>Oportunidades de la Semana</CardTitle>
                                <Badge variant="success" className="animate-pulse">3 Nuevas Intros</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y">
                                {[
                                    { company: "Acme Corp", contact: "Juan (CTO)", type: "Direct Intro", score: 98 },
                                    { company: "Globex Inc", contact: "Sarah (VP)", type: "2nd Degree", score: 85 },
                                    { company: "Soylent", contact: "Mike (CEO)", type: "Outbound", score: 72 },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                                                {item.company[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">{item.company}</p>
                                                <p className="text-xs text-slate-500">{item.contact}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant={item.scores > 90 ? 'default' : 'secondary'}>{item.type}</Badge>
                                            <p className="text-xs text-slate-400 mt-1">Score: {item.score}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-center text-xs text-slate-500">
                                Analizando +1,200 contactos de tu red...
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </section>
    )
}
