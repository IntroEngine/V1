"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { CreatableMultiSelect } from "@/components/ui/creatable-multi-select"
import { saveICPDefinition, type ICPFormData } from "@/app/actions/icp-actions"
import { useToast } from "@/components/ui/use-toast"
import { ChevronDown, ChevronUp, Target } from "lucide-react"

const INDUSTRIES_OPTIONS = [
    "SaaS", "FinTech", "HealthTech", "E-commerce", "Retail", "Manufacturing",
    "Logistics", "Real Estate", "Consulting", "Agency", "EdTech",
    "Cybersecurity", "Blockchain", "Gaming", "Travel", "PropTech",
    "LegalTech", "InsurTech", "MarTech", "CleanTech"
]

const LOCATION_OPTIONS = [
    "España", "Madrid", "Barcelona", "Valencia", "Bilbao",
    "LATAM", "México", "Colombia", "Argentina", "Chile", "Perú",
    "USA", "New York", "San Francisco", "Miami", "Austin",
    "Europe", "UK", "London", "Germany", "Berlin", "France", "Paris",
    "Remote", "Global", "EMEA", "APAC"
]

const ROLE_OPTIONS = [
    "CEO", "Founder", "Co-Founder", "CTO", "CFO", "COO", "CMO", "CRO",
    "VP Sales", "VP Marketing", "VP Engineering", "VP Product", "VP People",
    "Head of Sales", "Head of Growth", "Head of Product", "Head of Engineering",
    "Director of Sales", "Sales Manager", "Marketing Manager",
    "HR Director", "Talent Acquisition", "Procurement Manager", "IT Director"
]

export function ICPForm({ initialData }: { initialData?: any }) {
    const { toast } = useToast()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isCollapsed, setIsCollapsed] = useState(false) // Default open
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

    const handleSubmit = async () => {
        setLoading(true)
        try {
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
                    variant: "default"
                })
                setIsCollapsed(true) // Auto collapse on save
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
        <Card className="border-blue-100 bg-blue-50/10 shadow-md">
            <CardHeader
                className="cursor-pointer bg-gradient-to-r from-blue-50/50 to-transparent border-b border-blue-100 py-4 transition-colors hover:bg-blue-50/80"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-blue-600" />
                        <div>
                            <CardTitle className="text-blue-950 text-lg">Capa 1: Tu ICP</CardTitle>
                            <CardDescription className="text-blue-900/60">Define tu Cliente Ideal (Industria, Tamaño, Roles...)</CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>

            {!isCollapsed && (
                <div className="p-6 animate-in slide-in-from-top-2 fade-in duration-300">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Left Column: Demographics & Firmographics */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">
                                    Industrias Objetivo
                                </label>
                                <CreatableMultiSelect
                                    options={INDUSTRIES_OPTIONS}
                                    value={formData.target_industries}
                                    onChange={(val) => handleChange("target_industries", val)}
                                    placeholder="Selecciona o escribe..."
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
                                <CreatableMultiSelect
                                    options={LOCATION_OPTIONS}
                                    value={formData.target_locations}
                                    onChange={(val) => handleChange("target_locations", val)}
                                    placeholder="Países, regiones o ciudades..."
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
                        </div>

                        {/* Right Column: Strategy & Persona */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Cargos Clave (Roles)</label>
                                <CreatableMultiSelect
                                    options={ROLE_OPTIONS}
                                    value={formData.key_roles}
                                    onChange={(val) => handleChange("key_roles", val)}
                                    placeholder="Selecciona roles..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Pains Principales</label>
                                <Textarea
                                    className="min-h-[100px] resize-none"
                                    placeholder="Describe qué problemas resuelves."
                                    value={formData.pain_points || ""}
                                    onChange={(e) => handleChange("pain_points", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Señales de Oportunidad (Triggers)</label>
                                <Textarea
                                    className="min-h-[100px] resize-none"
                                    placeholder="Ej: Ronda de inversión, contratación masiva..."
                                    value={formData.opportunity_triggers || ""}
                                    onChange={(e) => handleChange("opportunity_triggers", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none text-red-700">Anti-ICP (Exclusiones)</label>
                                <Textarea
                                    className="min-h-[80px] border-red-200 focus-visible:ring-red-500 bg-red-50/20 placeholder:text-red-300"
                                    placeholder="Empresas que NO quieres (ej: consultoras, gobierno...)"
                                    value={formData.anti_icp_criteria || ""}
                                    onChange={(e) => handleChange("anti_icp_criteria", e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSubmit} disabled={loading} className="w-full md:w-auto bg-[#FF5A00] hover:bg-[#CC4800] text-white shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]">
                                    {loading ? (
                                        <>
                                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                            Guardando...
                                        </>
                                    ) : "Guardar Definición ICP"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    )
}

