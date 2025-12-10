"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { saveICPDefinition, type ICPFormData } from "@/app/actions/icp-actions"
import { useToast } from "@/components/ui/use-toast"

export function ICPForm({ initialData }: { initialData?: any }) {
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState<ICPFormData>({
        target_industries: initialData?.target_industries || [],
        company_size_min: initialData?.company_size_min || "",
        company_size_max: initialData?.company_size_max || "",
        target_technologies: initialData?.target_technologies || [],
        digital_maturity: initialData?.digital_maturity || "Any",
        target_locations: initialData?.target_locations || [],
        key_roles: initialData?.key_roles || [],
        pain_points: initialData?.pain_points || "",
        opportunity_triggers: initialData?.opportunity_triggers || "",
        anti_icp_criteria: initialData?.anti_icp_criteria || "",
    })

    const handleChange = (field: keyof ICPFormData, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleArrayChange = (field: keyof ICPFormData, value: string) => {
        // Split by comma and trim
        const array = value.split(",").map(item => item.trim()).filter(Boolean)
        handleChange(field, array)
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            // Convert numbers
            const payload = {
                ...formData,
                company_size_min: formData.company_size_min ? Number(formData.company_size_min) : undefined,
                company_size_max: formData.company_size_max ? Number(formData.company_size_max) : undefined,
            }

            const result = await saveICPDefinition(payload)

            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive"
                })
            } else {
                toast({
                    title: "ICP Guardado",
                    description: "Tu perfil de cliente ideal ha sido actualizado correctamente.",
                    variant: "default" // or success if available
                })
                router.refresh()
            }
        } catch (e) {
            toast({
                title: "Error",
                description: "Ocurrió un error inesperado.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column: Demographics & Firmographics */}
            <Card>
                <CardHeader>
                    <CardTitle>Firmografía</CardTitle>
                    <CardDescription>Define las características de la empresa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Industrias Objetivo
                        </label>
                        <Input
                            placeholder="SaaS, FinTech, Retail... (separadas por coma)"
                            value={formData.target_industries ? formData.target_industries.join(", ") : ""}
                            onChange={(e) => handleArrayChange("target_industries", e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Tamaño Min (Empleados)</label>
                            <Input
                                type="number"
                                placeholder="10"
                                value={formData.company_size_min || ""}
                                onChange={(e) => handleChange("company_size_min", e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Tamaño Max</label>
                            <Input
                                type="number"
                                placeholder="500"
                                value={formData.company_size_max || ""}
                                onChange={(e) => handleChange("company_size_max", e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Geografía</label>
                        <Input
                            placeholder="España, LATAM, US... (separadas por coma)"
                            value={formData.target_locations ? formData.target_locations.join(", ") : ""}
                            onChange={(e) => handleArrayChange("target_locations", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Madurez Digital</label>
                        <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.digital_maturity}
                            onChange={(e) => handleChange("digital_maturity", e.target.value)}
                        >
                            <option value="Any">Cualquiera</option>
                            <option value="Low">Baja (Tradicional)</option>
                            <option value="Medium">Media (En transformación)</option>
                            <option value="High">Alta (Nativo Digital)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none">Tecnologías (Tech Stack)</label>
                        <Input
                            placeholder="Salesforce, AWS, HubSpot... (separadas por coma)"
                            value={formData.target_technologies ? formData.target_technologies.join(", ") : ""}
                            onChange={(e) => handleArrayChange("target_technologies", e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Right Column: Strategy & Persona */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Persona & Estrategia</CardTitle>
                        <CardDescription>¿A quién te diriges y por qué?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Cargos Clave (Roles)</label>
                            <Input
                                placeholder="CEO, CTO, VP Sales... (separadas por coma)"
                                value={formData.key_roles ? formData.key_roles.join(", ") : ""}
                                onChange={(e) => handleArrayChange("key_roles", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Pains Principales</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Describe qué problemas resuelves."
                                value={formData.pain_points || ""}
                                onChange={(e) => handleChange("pain_points", e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none">Señales de Oportunidad (Triggers)</label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Ej: Ronda de inversión, contratación masiva, cambio de directiva..."
                                value={formData.opportunity_triggers || ""}
                                onChange={(e) => handleChange("opportunity_triggers", e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-red-200 bg-red-50/10">
                    <CardHeader>
                        <CardTitle className="text-red-900">Anti-ICP (Exclusiones)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <textarea
                            className="flex min-h-[60px] w-full rounded-md border border-red-200 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Empresas que NO quieres (ej: consultoras, gobierno...)"
                            value={formData.anti_icp_criteria || ""}
                            onChange={(e) => handleChange("anti_icp_criteria", e.target.value)}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSubmit} disabled={loading} className="w-full md:w-auto bg-[#FF5A00] hover:bg-[#FF5A00]/90">
                        {loading ? "Guardando..." : "Guardar Definición ICP"}
                    </Button>
                </div>
            </div>
        </div>
    )
}
