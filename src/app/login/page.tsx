"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Send } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const toast = useToast()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                throw error
            }

            toast.success("Has iniciado sesión correctamente")
            router.push("/dashboard")
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Error al iniciar sesión")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        {/* Logo placeholder or component */}
                        <Send className="h-10 w-10 text-[#FF5A00]" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                        Bienvenido de nuevo
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Ingresa a tu cuenta de IntroEngine
                    </p>
                </div>

                <Card className="border-gray-200 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-xl">Iniciar Sesión</CardTitle>
                        <CardDescription>Introduce tus credenciales para continuar</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-900">Email</label>
                                <Input
                                    type="email"
                                    placeholder="nombre@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium text-gray-900">Contraseña</label>
                                </div>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-[#FF5A00] hover:bg-[#E65100]"
                                disabled={isLoading}
                            >
                                {isLoading ? "Iniciando..." : "Ingresar"}
                            </Button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-600">
                            ¿No tienes cuenta?{" "}
                            <Link
                                href="/signup"
                                className="font-medium text-[#FF5A00] hover:text-[#E65100]"
                            >
                                Regístrate gratis
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
