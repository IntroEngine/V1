import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function SignupPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
            <Link
                href="/"
                className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
            </Link>

            <Card className="max-w-md text-center shadow-lg">
                <CardHeader>
                    <CardTitle>Solicitar Acceso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500">
                        IntroEngine está en beta privada. Actualmente estamos abriendo cupos de forma manual para asegurar la mejor experiencia.
                    </p>
                    <p className="text-sm text-slate-500">
                        Por favor, contáctanos directamente o agenda una demo para desbloquear tu cuenta.
                    </p>
                    <div className="pt-2">
                        <Link href="mailto:access@introengine.com">
                            <Button className="w-full">
                                Contactar Ventas
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <p className="mt-8 text-center text-sm text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="underline underline-offset-4 hover:text-primary">
                    Iniciar Sesión
                </Link>
            </p>
        </div>
    )
}
