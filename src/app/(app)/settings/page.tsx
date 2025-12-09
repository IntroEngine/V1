"use client"

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, User, Lock, CreditCard } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Configuración</h2>
                <p className="text-gray-600 mt-1">
                    Administra las preferencias de tu cuenta y aplicación.
                </p>
            </div>

            {/* Settings Sections */}
            <div className="grid gap-6 md:grid-cols-2">

                {/* Profile Settings */}
                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#FF5A00]/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-[#FF5A00]" />
                            </div>
                            <div>
                                <CardTitle className="text-gray-900">Perfil</CardTitle>
                                <p className="text-sm text-gray-600 mt-1">Información personal y contacto</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-900">Nombre</label>
                                <p className="text-sm text-gray-600">Usuario Demo</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-900">Email</label>
                                <p className="text-sm text-gray-600">demo@introengine.com</p>
                            </div>
                            <Button variant="outline" size="sm" className="mt-2">Editar Perfil</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Notifications */}
                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#FF5A00]/10 flex items-center justify-center">
                                <Bell className="h-5 w-5 text-[#FF5A00]" />
                            </div>
                            <div>
                                <CardTitle className="text-gray-900">Notificaciones</CardTitle>
                                <p className="text-sm text-gray-600 mt-1">Gestiona alertas y emails</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">Nuevas intros</span>
                                <input type="checkbox" defaultChecked className="accent-[#FF5A00]" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">Resumen semanal</span>
                                <input type="checkbox" defaultChecked className="accent-[#FF5A00]" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-900">Actualizaciones</span>
                                <input type="checkbox" className="accent-[#FF5A00]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Security */}
                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#FF5A00]/10 flex items-center justify-center">
                                <Lock className="h-5 w-5 text-[#FF5A00]" />
                            </div>
                            <div>
                                <CardTitle className="text-gray-900">Seguridad</CardTitle>
                                <p className="text-sm text-gray-600 mt-1">Contraseña y autenticación</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <Button variant="outline" size="sm" className="w-full">Cambiar Contraseña</Button>
                            <Button variant="outline" size="sm" className="w-full">Configurar 2FA</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Billing */}
                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-[#FF5A00]/10 flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-[#FF5A00]" />
                            </div>
                            <div>
                                <CardTitle className="text-gray-900">Facturación</CardTitle>
                                <p className="text-sm text-gray-600 mt-1">Plan y métodos de pago</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-900">Plan Actual</label>
                                <p className="text-sm text-gray-600">Professional</p>
                            </div>
                            <Button size="sm" className="mt-2">Gestionar Suscripción</Button>
                        </div>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
