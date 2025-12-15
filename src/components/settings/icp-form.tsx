"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Save } from "lucide-react"

import { useToast } from "@/hooks/use-toast"

export function ICPForm() {
    const { success, error } = useToast()
    const [loading, setLoading] = useState(false)

    // Form State
    const [targetIndustries, setTargetIndustries] = useState<string[]>(["SaaS", "Fintech"])
    const [newIndustry, setNewIndustry] = useState("")

    const [targetRoles, setTargetRoles] = useState<string[]>(["CTO", "VP Engineering"])
    const [newRole, setNewRole] = useState("")

    const [companySize, setCompanySize] = useState("50-200")
    const [location, setLocation] = useState("España")
    const [valueProp, setValueProp] = useState("Ayudamos a escalar equipos de ingeniería con talento remoto de alta calidad.")

    const handleAddIndustry = () => {
        if (newIndustry && !targetIndustries.includes(newIndustry)) {
            setTargetIndustries([...targetIndustries, newIndustry])
            setNewIndustry("")
        }
    }

    const handleAddRole = () => {
        if (newRole && !targetRoles.includes(newRole)) {
            setTargetRoles([...targetRoles, newRole])
            setNewRole("")
        }
    }

    const removeIndustry = (ind: string) => {
        setTargetIndustries(targetIndustries.filter(i => i !== ind))
    }

    const removeRole = (role: string) => {
        setTargetRoles(targetRoles.filter(r => r !== role))
    }

    const handleSave = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/settings/icp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetIndustries,
                    targetRoles,
                    companySize,
                    location,
                    valueProp
                })
            })

            if (!res.ok) throw new Error("Failed to save ICP")

            success("ICP Actualizado", "Tus preferencias de cliente ideal se han guardado.")
        } catch (err) {
            error("Error", "No se pudo guardar la configuración.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-gray-200 shadow-sm">
            <CardHeader>
                <CardTitle>Perfil de Cliente Ideal (ICP)</CardTitle>
                <CardDescription>
                    Define a quién quieres vender. Nuestra IA priorizará las intros que coincidan con estos criterios.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

                {/* Industries */}
                <div className="space-y-2">
                    <Label>Industrias Objetivo</Label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {targetIndustries.map(ind => (
                            <Badge key={ind} variant="secondary" className="px-3 py-1 text-sm flex gap-2 items-center">
                                {ind}
                                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeIndustry(ind)} />
                            </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ej. E-commerce"
                            value={newIndustry}
                            onChange={(e) => setNewIndustry(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleAddIndustry()}
                        />
                        <Button variant="outline" size="icon" onClick={handleAddIndustry} type="button">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Roles */}
                <div className="space-y-2">
                    <Label>Roles de Decisión (Buyer Persona)</Label>
                    <div className="flex gap-2 mb-2 flex-wrap">
                        {targetRoles.map(role => (
                            <Badge key={role} variant="secondary" className="px-3 py-1 text-sm flex gap-2 items-center">
                                {role}
                                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeRole(role)} />
                            </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ej. Head of Product"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleAddRole()}
                        />
                        <Button variant="outline" size="icon" onClick={handleAddRole} type="button">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Size */}
                    <div className="space-y-2">
                        <Label>Tamaño de Empresa</Label>
                        <Select value={companySize} onValueChange={setCompanySize}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecciona tamaño" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1-10">Startup (1-10)</SelectItem>
                                <SelectItem value="11-50">Pequeña (11-50)</SelectItem>
                                <SelectItem value="50-200">Mediana (50-200)</SelectItem>
                                <SelectItem value="200-1000">Scale-up (200-1000)</SelectItem>
                                <SelectItem value="1000+">Enterprise (1000+)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <Label>Ubicación Principal</Label>
                        <Input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Ej. Europa, LATAM..."
                        />
                    </div>
                </div>

                {/* Value Prop */}
                <div className="space-y-2">
                    <Label>Tu Propuesta de Valor (Pitch Corto)</Label>
                    <Textarea
                        value={valueProp}
                        onChange={(e) => setValueProp(e.target.value)}
                        placeholder="Describe brevemente qué resuelves para estos clientes..."
                        className="h-24"
                    />
                    <p className="text-xs text-gray-500">
                        La IA usará esto para redactar los mensajes de outbound.
                    </p>
                </div>

                <div className="pt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto">
                        {loading ? "Guardando..." : (
                            <>
                                <Save className="mr-2 h-4 w-4" /> Guardar Definición
                            </>
                        )}
                    </Button>
                </div>

            </CardContent>
        </Card>
    )
}
