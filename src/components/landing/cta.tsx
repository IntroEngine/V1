"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input" // This assumes generic Input exists or simple HTML input
import { useState } from "react"

// Simple internal Input component if not in UI lib yet
function SimpleInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
    return (
        <input
            className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 \${className}`}
            {...props}
        />
    )
}

export function LandingCTA() {
    const [loading, setLoading] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            console.log("Form submitted")
            setLoading(false)
            alert("¡Gracias por tu interés! Te contactaremos pronto.")
        }, 1000)
    }

    return (
        <section className="py-24 bg-slate-900 text-white px-6">
            <div className="mx-auto max-w-3xl text-center space-y-8">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    ¿Listo para escalar tus intros?
                </h2>
                <p className="text-slate-400 text-lg">
                    Únete a la lista de espera y sé de los primeros en probar el motor inteligente que cambiará tu forma de vender.
                </p>

                <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 text-left bg-white/5 p-6 rounded-2xl border border-white/10">
                    <div>
                        <label className="text-sm font-medium ml-1">Nombre Completo</label>
                        <SimpleInput required placeholder="Ej: Nacho Lopez" className="mt-1 bg-slate-800 border-slate-700 text-white" />
                    </div>
                    <div>
                        <label className="text-sm font-medium ml-1">Email Profesional</label>
                        <SimpleInput required type="email" placeholder="nacho@empresa.com" className="mt-1 bg-slate-800 border-slate-700 text-white" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium ml-1">Empresa</label>
                            <SimpleInput required placeholder="Acme Inc" className="mt-1 bg-slate-800 border-slate-700 text-white" />
                        </div>
                        <div>
                            <label className="text-sm font-medium ml-1">Equipo (personas)</label>
                            <SimpleInput required placeholder="10-50" className="mt-1 bg-slate-800 border-slate-700 text-white" />
                        </div>
                    </div>

                    <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
                        {loading ? "Enviando..." : "Solicitar acceso anticipado"}
                    </Button>

                    <p className="text-xs text-center text-slate-500 mt-4">
                        Respetamos tu privacidad. Sin spam.
                    </p>
                </form>
            </div>
        </section>
    )
}
