"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false)

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)

        setTimeout(() => {
            // TODO: Connect to Supabase Auth here
            // const { error } = await supabase.auth.signInWithPassword({ ... })
            console.log("Login attempted (mock)")
            setIsLoading(false)
            // redirect('/')
        }, 1000)
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
            </Link>

            <div className="w-full max-w-md space-y-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold font-sans">
                        IE
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Bienvenido a IntroEngine
                    </h1>
                    <p className="text-sm text-slate-500">
                        Ingresa a tu cuenta para gestionar tus intros
                    </p>
                </div>

                <Card className="border-none shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-lg">Iniciar Sesión</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="email">
                                    Email
                                </label>
                                <Input
                                    id="email"
                                    placeholder="nombre@empresa.com"
                                    type="email"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect="off"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
                                        Contraseña
                                    </label>
                                    <Link href="#" className="text-xs text-primary hover:underline">
                                        ¿Olvidaste tu contraseña?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 p-3 rounded-md text-xs border border-amber-100 dark:border-amber-800/30">
                                <strong>Nota:</strong> Actualmente solo soportamos cuentas invitadas. Si no tienes acceso, contacta a soporte.
                            </div>

                            <Button className="w-full" disabled={isLoading}>
                                {isLoading && (
                                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                )}
                                Entrar
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <p className="px-8 text-center text-sm text-muted-foreground">
                    ¿No tienes una cuenta?{" "}
                    <Link href="/signup" className="underline underline-offset-4 hover:text-primary">
                        Solicitar acceso
                    </Link>
                </p>
            </div>
        </div>
    )
}
