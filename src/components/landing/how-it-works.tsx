import { Share2, Zap, BarChart } from "lucide-react"

export function LandingHowItWorks() {
    const steps = [
        {
            icon: Share2,
            title: "1. Conecta tu Red",
            desc: "Sube tus contactos o conecta LinkedIn. IntroEngine mapea tu grafo social y lo cruza con tus cuentas objetivo."
        },
        {
            icon: Zap,
            title: "2. Motor de Inteligencia",
            desc: "Nuestra IA analiza señales de compra y rutas de conexión para detectar quién te puede presentar al decisor."
        },
        {
            icon: BarChart,
            title: "3. Ejecuta y Sincroniza",
            desc: "Genera mensajes de intro u outbound personalizados y sincroniza cada interacción con HubSpot automáticamente."
        }
    ]

    return (
        <section className="py-24 bg-white dark:bg-slate-950 px-6">
            <div className="mx-auto max-w-7xl text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Cómo funciona</h2>
                <p className="text-slate-500 max-w-2xl mx-auto mb-16">
                    Tres pasos simples para dejar de prospectar en frío y empezar a usar tu capital relacional.
                </p>

                <div className="grid md:grid-cols-3 gap-12">
                    {steps.map((step, idx) => (
                        <div key={idx} className="relative flex flex-col items-center">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                                <step.icon className="h-8 w-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                {step.desc}
                            </p>

                            {/* Connector Line (Desktop) */}
                            {idx !== steps.length - 1 && (
                                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
