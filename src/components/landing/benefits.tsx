import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Clock, Target, TrendingUp } from "lucide-react"

export function LandingBenefits() {
    const benefits = [
        {
            icon: Target,
            title: "Foco total en ventas",
            desc: "Deja de perder tiempo en LinkedIn buscando quién conoce a quién. El motor te dice dónde poner la bala."
        },
        {
            icon: ShieldCheck,
            title: "Intros calientes > Cold Call",
            desc: "Las tasas de conversión de una intro son 5x superiores a un cold email. Prioriza siempre la calidez."
        },
        {
            icon: Clock,
            title: "Research automático",
            desc: "La IA investiga la empresa y el contacto por ti, dándote el contexto perfecto para romper el hielo."
        },
        {
            icon: TrendingUp,
            title: "Pipeline saludable",
            desc: "Mantén tu CRM limpio y lleno de oportunidades reales, no de leads basura que nunca responden."
        }
    ]

    return (
        <section className="py-24 bg-slate-50 dark:bg-slate-900/50 px-6">
            <div className="mx-auto max-w-7xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Por qué IntroEngine</h2>
                    <p className="text-slate-500">Diseñado para equipos que valoran la calidad sobre la cantidad.</p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {benefits.map((b, i) => (
                        <Card key={i} className="border-none shadow-md">
                            <CardHeader>
                                <b.icon className="h-10 w-10 text-primary mb-4" />
                                <CardTitle className="text-lg">{b.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    )
}
