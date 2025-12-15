"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ICPForm } from "@/components/settings/icp-form"
import { IntegrationsList } from "@/components/settings/integrations-list"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Shield, Bell } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-500">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Configuración</h2>
                <p className="text-gray-600 mt-1">Administra tus preferencias, integraciones y perfil de cliente ideal.</p>
            </div>

            <Tabs defaultValue="icp" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                    <TabsTrigger value="icp">ICP & Objetivos</TabsTrigger>
                    <TabsTrigger value="integrations">Integraciones</TabsTrigger>
                    <TabsTrigger value="general">General</TabsTrigger>
                </TabsList>

                <TabsContent value="icp" className="mt-6">
                    <ICPForm />
                </TabsContent>

                <TabsContent value="integrations" className="mt-6">
                    <IntegrationsList />
                </TabsContent>

                <TabsContent value="general" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuración General</CardTitle>
                            <CardDescription>Preferencias de tu cuenta personal.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <User className="h-6 w-6 text-gray-500" />
                                <div>
                                    <p className="font-medium">Perfil de Usuario</p>
                                    <p className="text-sm text-gray-500">Actualiza tu foto y datos personales</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <Bell className="h-6 w-6 text-gray-500" />
                                <div>
                                    <p className="font-medium">Notificaciones</p>
                                    <p className="text-sm text-gray-500">Gestiona alertas de email y push</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <Shield className="h-6 w-6 text-gray-500" />
                                <div>
                                    <p className="font-medium">Seguridad</p>
                                    <p className="text-sm text-gray-500">Cambiar contraseña y 2FA</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
