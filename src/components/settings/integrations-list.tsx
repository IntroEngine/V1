"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

export function IntegrationsList() {
    const { success, info } = useToast()
    const [connecting, setConnecting] = useState<string | null>(null)

    // Mock State
    const [hubspotConnected, setHubspotConnected] = useState(false)
    const [linkedinConnected, setLinkedinConnected] = useState(true)

    const handleConnectHubSpot = async () => {
        setConnecting('hubspot')
        // Simulate OAuth Redirect
        setTimeout(() => {
            setHubspotConnected(true)
            setConnecting(null)
            success("HubSpot Conectado", "Se han sincronizado 12 empresas y 45 contactos.")
        }, 2000)
    }

    return (
        <Card className="border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle>Integraciones</CardTitle>
                <CardDescription>
                    Conecta tus fuentes de datos para enriquecer tu red.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* HubSpot */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-[#ff7a59] rounded flex items-center justify-center text-white font-bold text-xs">
                            HubSpot
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">HubSpot CRM</h4>
                                {hubspotConnected ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Activo
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-gray-500 text-xs">
                                        No conectado
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">Sincroniza contactos y empresas automáticamente.</p>
                        </div>
                    </div>
                    <div>
                        {hubspotConnected ? (
                            <Button variant="outline" size="sm" className="text-gray-600">
                                Configurar
                            </Button>
                        ) : (
                            <Button size="sm" onClick={handleConnectHubSpot} disabled={!!connecting}>
                                {connecting === 'hubspot' ? "Conectando..." : "Conectar"}
                            </Button>
                        )}
                    </div>
                </div>

                {/* LinkedIn */}
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-[#0077b5] rounded flex items-center justify-center text-white font-bold text-2xl">
                            in
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">LinkedIn</h4>
                                {linkedinConnected ? (
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs gap-1">
                                        <CheckCircle2 className="h-3 w-3" /> Activo
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="text-gray-500 text-xs">
                                        No conectado
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">Importación de conexiones y enriquecimiento de perfiles.</p>
                        </div>
                    </div>
                    <div>
                        {linkedinConnected ? (
                            <Button variant="outline" size="sm" className="text-gray-600">
                                Sincronizar Ahora
                            </Button>
                        ) : (
                            <Button size="sm">Conectar</Button>
                        )}
                    </div>
                </div>

                {/* Gmail / Calendar (Future) */}
                <div className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-red-500 rounded flex items-center justify-center text-white font-bold text-xs">
                            Gmail
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-semibold text-gray-900">Google Workspace</h4>
                                <Badge variant="secondary" className="text-xs">Próximamente</Badge>
                            </div>
                            <p className="text-sm text-gray-500">Analiza interacciones de email y calendario.</p>
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    )
}
