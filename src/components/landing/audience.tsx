import { Check } from "lucide-react"

export function LandingAudience() {
    const personas = [
        "CEOs y Fundadores B2B",
        "SDRs y Account Executives",
        "Agencias de Lead Gen",
        "Consultores de Negocio",
        "Equipos de Venture Capital",
        "Headhunters Ejecutivos",
    ]

    return (
        <section className="py-24 bg-white dark:bg-slate-950 px-6 border-b">
            <div className="mx-auto max-w-4xl text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-8">Para quién es IntroEngine</h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
                    {personas.map((p, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                            <div className="h-6 w-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                                <Check className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{p}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
