"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Users,
    Building2,
    Briefcase,
    TrendingUp,
    Plus,
    Edit,
    Trash2,
    Upload,
    Target,
    Award,
    Search,
    Filter,
    UserCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
    UserProfile,
    WorkHistory,
    UserConnection,
    NetworkStats,
    ProfileFormData,
    WorkHistoryFormData,
    ConnectionFormData,
    IntroOpportunity
} from "@/types/network"
import { LinkedInImportModal } from "@/components/ui/linkedin-import-modal"
import { IntroOpportunitiesList } from "@/components/network/intro-opportunities-list"
import { EditProfileModal } from "@/components/ui/edit-profile-modal"
import { WorkHistoryModal } from "@/components/ui/work-history-modal"
import { ConnectionModal } from "@/components/ui/connection-modal"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function MyNetworkPage() {
    const toast = useToast()

    // Data State
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [workHistory, setWorkHistory] = useState<WorkHistory[]>([])
    const [connections, setConnections] = useState<UserConnection[]>([])
    const [opportunities, setOpportunities] = useState<IntroOpportunity[]>([])
    const [stats, setStats] = useState<NetworkStats>({
        total_companies_worked: 0,
        total_connections: 0,
        total_industries: 0,
        total_intro_opportunities: 0,
        profile_completeness: 0
    })

    // UI State
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [isAddingWork, setIsAddingWork] = useState(false)
    const [isEditingWork, setIsEditingWork] = useState(false)
    const [selectedWork, setSelectedWork] = useState<WorkHistory | null>(null)
    const [isAddingConnection, setIsAddingConnection] = useState(false)
    const [isEditingConnection, setIsEditingConnection] = useState(false)
    const [selectedConnection, setSelectedConnection] = useState<UserConnection | null>(null)
    const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false)

    // Bulk Selection State
    const [selectedConnectionIds, setSelectedConnectionIds] = useState<Set<string>>(new Set())

    // Filter & Pagination State
    const [searchQuery, setSearchQuery] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [strengthFilter, setStrengthFilter] = useState<string>("all")
    const [typeFilter, setTypeFilter] = useState<string>("all")
    const [activeTab, setActiveTab] = useState("overview")

    // Derived State
    const filteredConnections = connections.filter(c => {
        const matchesSearch = c.company_name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStrength = strengthFilter === "all" || c.relationship_strength.toString() === strengthFilter
        const matchesType = typeFilter === "all" || (c.connection_type || 'other') === typeFilter
        return matchesSearch && matchesStrength && matchesType
    })

    const totalPages = Math.ceil(filteredConnections.length / itemsPerPage)
    const paginatedConnections = filteredConnections.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Reset page when filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, itemsPerPage])

    const toggleConnectionSelection = (id: string) => {
        setSelectedConnectionIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) {
                next.delete(id)
            } else {
                next.add(id)
            }
            return next
        })
    }

    const handleBulkDelete = async () => {
        if (!confirm(`¿Estás seguro de que deseas eliminar ${selectedConnectionIds.size} contactos?`)) return

        try {
            const res = await fetch('/api/my-network/connections/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionIds: Array.from(selectedConnectionIds) })
            })

            if (!res.ok) throw new Error('Failed to delete items')

            const result = await res.json()
            toast.success(`${result.deletedCount} contactos eliminados`)

            setSelectedConnectionIds(new Set())
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Error al eliminar los contactos")
        }
    }

    // ... [KEEPING EXISTING HANDLERS FOR brevity, assuming they are standard] ...
    // Fetch Data
    const fetchData = useCallback(async () => {
        try {
            const [profileRes, workRes, connectionsRes, statsRes, opportunitiesRes] = await Promise.all([
                fetch("/api/my-network/profile"),
                fetch("/api/my-network/work-history"),
                fetch("/api/my-network/connections"),
                fetch("/api/my-network/stats"),
                fetch("/api/opportunities")
            ])

            if (profileRes.ok) setProfile(await profileRes.json())
            if (workRes.ok) setWorkHistory(await workRes.json())
            if (connectionsRes.ok) setConnections(await connectionsRes.json())
            if (statsRes.ok) setStats(await statsRes.json())
            if (opportunitiesRes.ok) {
                const opps = await opportunitiesRes.json()
                setOpportunities(Array.isArray(opps) ? opps : [])
            }

        } catch (error) {
            console.error("Error fetching data:", error)
            toast.error("Error al cargar los datos de la red")
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleUpdateProfile = async (data: ProfileFormData) => {
        try {
            const res = await fetch("/api/my-network/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to update profile")
            toast.success("Perfil actualizado correctamente")
            setIsEditingProfile(false)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Error al actualizar el perfil")
        }
    }

    const handleAddWork = async (data: WorkHistoryFormData) => {
        try {
            const res = await fetch("/api/my-network/work-history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to add work history")
            toast.success("Experiencia laboral añadida")
            setIsAddingWork(false)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Error al añadir experiencia laboral")
        }
    }

    const handleUpdateWork = async (data: WorkHistoryFormData) => {
        if (!selectedWork) return
        try {
            const res = await fetch(`/api/network/work-history?id=${selectedWork.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to update work history")
            toast.success("Experiencia laboral actualizada")
            setIsEditingWork(false)
            setSelectedWork(null)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Error al actualizar experiencia laboral")
        }
    }

    const handleDeleteWork = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta experiencia?")) return
        try {
            const res = await fetch(`/api/network/work-history?id=${id}`, {
                method: "DELETE",
            })
            if (!res.ok) throw new Error("Failed to delete work history")
            toast.success("Experiencia eliminada")
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Error al eliminar experiencia")
        }
    }

    const handleAddConnection = async (data: ConnectionFormData) => {
        try {
            const res = await fetch("/api/my-network/connections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to add connection")
            toast.success("Contacto añadido correctamente")
            setIsAddingConnection(false)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Error al añadir contacto")
        }
    }

    const handleUpdateConnection = async (data: ConnectionFormData) => {
        if (!selectedConnection) return
        try {
            const res = await fetch(`/api/my-network/connections?id=${selectedConnection.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to update connection")
            toast.success("Contacto actualizado")
            setIsEditingConnection(false)
            setSelectedConnection(null)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Error al actualizar contacto")
        }
    }

    const handleDeleteAllConnections = async () => {
        if (!confirm("ESTA ACCIÓN ELIMINARÁ TODOS TUS CONTACTOS Y EMPRESAS GUARDADAS. ¿Estás seguro?")) return

        try {
            const res = await fetch('/api/my-network/connections/delete-all', {
                method: 'DELETE',
            })

            if (!res.ok) throw new Error('Failed to delete all connections')

            const result = await res.json()
            toast.success(`Se eliminaron ${result.deletedCount} contactos.`)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Error al eliminar todos los contactos")
        }
    }

    const handleDeleteConnection = async (id: string) => {
        if (!confirm("¿Eliminar este contacto?")) return
        try {
            const res = await fetch(`/api/my-network/connections?id=${id}`, {
                method: "DELETE",
            })
            if (!res.ok) throw new Error("Failed to delete connection")
            toast.success("Contacto eliminado")
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Error al eliminar contacto")
        }
    }

    const handleLinkedInImport = async (data: any[]) => {
        try {
            const res = await fetch("/api/my-network/import/linkedin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ connections: data }),
            })

            if (!res.ok) throw new Error("Import failed")

            const result = await res.json()

            toast.success(`Importación completada: ${result.stats.added} contactos procesados.`)
            setIsImportingLinkedIn(false)
            fetchData()
        } catch (error) {
            console.error(error)
            toast.error("Error al importar datos de LinkedIn")
        }
    }

    const getRelationshipDots = (strength: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <div
                key={i}
                className={`h-2 w-2 rounded-full ${i < strength ? 'bg-[#FF5A00]' : 'bg-gray-300'
                    }`}
            />
        ))
    }

    const getRelationshipLabel = (strength: number) => {
        if (strength >= 4) return 'Fuerte'
        if (strength >= 3) return 'Media'
        return 'Débil'
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Mi Red</h2>
                    <p className="text-gray-600 mt-1">
                        Gestiona tu red profesional y descubre oportunidades de intro
                    </p>
                </div>
                <Button onClick={() => setIsImportingLinkedIn(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Importar desde LinkedIn
                </Button>
            </div>

            {isLoading ? (
                <div className="flex h-96 items-center justify-center"><LoadingSpinner /></div>
            ) : (
                <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-shrink-0 border-b border-gray-200 mb-4">
                        <TabsList className="bg-transparent p-0 gap-6">
                            <TabsTrigger
                                value="overview"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF5A00] data-[state=active]:text-[#FF5A00] rounded-none px-2 py-3 text-gray-500 hover:text-gray-700"
                            >
                                Resumen
                            </TabsTrigger>
                            <TabsTrigger
                                value="profile"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF5A00] data-[state=active]:text-[#FF5A00] rounded-none px-2 py-3 text-gray-500 hover:text-gray-700"
                            >
                                Mi Perfil
                            </TabsTrigger>
                            <TabsTrigger
                                value="connections"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF5A00] data-[state=active]:text-[#FF5A00] rounded-none px-2 py-3 text-gray-500 hover:text-gray-700"
                            >
                                Contactos ({stats.total_connections || connections.length || 0})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 pb-6">
                        {/* OVERVIEW TAB */}
                        <TabsContent value="overview" className="space-y-8 mt-0">
                            {/* Stats */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <Card className="border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-900">Intros Posibles</CardTitle>
                                        <TrendingUp className="h-4 w-4 text-green-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-gray-900">{stats.total_intro_opportunities}</div>
                                        <p className="text-xs text-gray-600 mt-1">Oportunidades detectadas</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-900">Contactos</CardTitle>
                                        <Users className="h-4 w-4 text-[#FF5A00]" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-gray-900">{stats.total_connections || connections.length || 0}</div>
                                        <p className="text-xs text-gray-600 mt-1">En tu red</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-900">Industrias</CardTitle>
                                        <Building2 className="h-4 w-4 text-blue-600" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-gray-900">{stats.total_industries}</div>
                                        <p className="text-xs text-gray-600 mt-1">Sectores cubiertos</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-gray-200 bg-white shadow-sm">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-gray-900">Empresas</CardTitle>
                                        <Briefcase className="h-4 w-4 text-gray-500" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-gray-900">{stats.total_companies_worked}</div>
                                        <p className="text-xs text-gray-600 mt-1">Historial laboral</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Profile Completeness */}
                            <Card className="border-gray-200 bg-white shadow-sm border-l-4 border-l-[#FF5A00]">
                                <CardContent className="pt-6 flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Target className="h-5 w-5 text-[#FF5A00]" />
                                            <h3 className="font-semibold text-gray-900">Salud de tu Perfil</h3>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3 max-w-xl">
                                            Un perfil completo ayuda a nuestra IA a encontrar mejores conexiones. Asegúrate de tener tu historial laboral y tags de expertise al día.
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="w-full max-w-sm bg-gray-100 rounded-full h-2.5">
                                                <div className="bg-[#FF5A00] h-2.5 rounded-full transition-all duration-500" style={{ width: `${stats.profile_completeness}%` }} />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{stats.profile_completeness}%</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" onClick={() => setIsEditingProfile(true)}>
                                        Completar Perfil
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Opportunities List */}
                            <div className="space-y-4 pt-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-green-600" />
                                        Últimas Oportunidades
                                    </h3>
                                </div>
                                <IntroOpportunitiesList opportunities={opportunities} />
                            </div>
                        </TabsContent>

                        {/* PROFILE TAB */}
                        <TabsContent value="profile" className="space-y-6 mt-0">
                            {/* Professional Profile */}
                            <Card className="border-gray-200 bg-white shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-gray-900 flex items-center gap-2">
                                        <UserCircle className="h-5 w-5 text-gray-500" />
                                        Perfil Profesional
                                    </CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-3">
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Empresa Actual</label>
                                            <p className="text-gray-900 font-medium">{profile?.current_company || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Cargo</label>
                                            <p className="text-gray-900 font-medium">{profile?.current_title || '-'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Ubicación</label>
                                            <p className="text-gray-900 font-medium">{profile?.current_location || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div>
                                            <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2 block">Industrias</label>
                                            <div className="flex flex-wrap gap-2">
                                                {profile?.industries_expertise?.length ? profile.industries_expertise.map((ind, i) => (
                                                    <Badge key={i} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">{ind}</Badge>
                                                )) : <span className="text-sm text-gray-400 italic">No especificado</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2 block">Fortalezas</label>
                                            <div className="flex flex-wrap gap-2">
                                                {profile?.strengths_tags?.length ? profile.strengths_tags.map((tag, i) => (
                                                    <Badge key={i} variant="secondary" className="bg-purple-50 text-purple-700 hover:bg-purple-100">{tag}</Badge>
                                                )) : <span className="text-sm text-gray-400 italic">No especificado</span>}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Work History */}
                            <Card className="border-gray-200 bg-white shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle className="text-gray-900 flex items-center gap-2">
                                        <Briefcase className="h-5 w-5 text-gray-500" />
                                        Historial Laboral
                                    </CardTitle>
                                    <Button size="sm" onClick={() => setIsAddingWork(true)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Añadir Experiencia
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {workHistory.length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                                                <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm border border-gray-100">
                                                    <Briefcase className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <p className="text-gray-500 font-medium">No has añadido experiencia laboral</p>
                                                <p className="text-sm text-gray-400 mt-1 max-w-xs text-center">Añadir tu historial ayuda a encontrar ex-colegas.</p>
                                            </div>
                                        )}
                                        {workHistory.map((work) => (
                                            <div key={work.id} className="group relative pl-4 border-l-2 border-gray-200 hover:border-[#FF5A00] transition-colors py-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 text-lg">{work.company_name}</h4>
                                                        <p className="text-gray-700 font-medium">{work.title}</p>
                                                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                                            <span>{work.start_date ? new Date(work.start_date).getFullYear() : 'N/A'} - {work.is_current ? 'Presente' : (work.end_date ? new Date(work.end_date).getFullYear() : '')}</span>
                                                            {work.seniority && <Badge variant="outline" className="text-[10px] h-5">{work.seniority}</Badge>}
                                                        </p>
                                                    </div>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setSelectedWork(work); setIsEditingWork(true); }}>
                                                            <Edit className="h-4 w-4 text-gray-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeleteWork(work.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* CONNECTIONS TAB */}
                        <TabsContent value="connections" className="space-y-6 mt-0">
                            <Card className="border-gray-200 bg-white shadow-sm">
                                <CardHeader className="border-b border-gray-100 pb-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <CardTitle className="text-gray-900">Directorio de Contactos</CardTitle>
                                            <p className="text-sm text-gray-500 mt-1">Personas clave que pueden presentarte</p>
                                        </div>
                                        <div className="flex gap-2">
                                            {selectedConnectionIds.size > 0 && (
                                                <Button variant="danger" size="sm" onClick={handleBulkDelete}>
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar ({selectedConnectionIds.size})
                                                </Button>
                                            )}
                                            {connections.length > 0 && (
                                                <Button variant="outline" size="sm" onClick={handleDeleteAllConnections} className="text-red-600 hover:bg-red-50 border-red-200">
                                                    Eliminar Todo
                                                </Button>
                                            )}
                                            <Button size="sm" onClick={() => setIsAddingConnection(true)}>
                                                <Plus className="h-4 w-4 mr-2" />
                                                Añadir Manual
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-col md:flex-row gap-4">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <Input
                                                placeholder="Buscar por nombre, empresa..."
                                                className="pl-9 bg-gray-50 border-gray-200"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <Select value={strengthFilter} onValueChange={setStrengthFilter}>
                                            <SelectTrigger className="w-[160px]">
                                                <SelectValue placeholder="Fuerza..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todas las fuerzas</SelectItem>
                                                <SelectItem value="5">Muy Fuerte (5)</SelectItem>
                                                <SelectItem value="4">Fuerte (4)</SelectItem>
                                                <SelectItem value="3">Media (3)</SelectItem>
                                                <SelectItem value="2">Débil (2)</SelectItem>
                                                <SelectItem value="1">Muy Débil (1)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                                            <SelectTrigger className="w-[160px]">
                                                <SelectValue placeholder="Tipo..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Todos los tipos</SelectItem>
                                                <SelectItem value="ex-colleague">Ex-colega</SelectItem>
                                                <SelectItem value="client">Cliente</SelectItem>
                                                <SelectItem value="vendor">Proveedor</SelectItem>
                                                <SelectItem value="investor">Inversor</SelectItem>
                                                <SelectItem value="other">Otro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={itemsPerPage.toString()} onValueChange={(v: string) => setItemsPerPage(Number(v))}>
                                            <SelectTrigger className="w-[140px]">
                                                <SelectValue placeholder="Mostrar..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="5">5 por página</SelectItem>
                                                <SelectItem value="10">10 por página</SelectItem>
                                                <SelectItem value="20">20 por página</SelectItem>
                                                <SelectItem value="50">50 por página</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-gray-100">
                                        {paginatedConnections.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                                                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                                    <Users className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900">No se encontraron contactos</h3>
                                                <p className="text-sm text-gray-500 max-w-sm mt-2">
                                                    Intenta ajustar tus filtros o añade nuevos contactos manualmente o vía LinkedIn.
                                                </p>
                                                <Button variant="outline" className="mt-6" onClick={() => { setSearchQuery(''); setStrengthFilter('all'); setTypeFilter('all'); }}>
                                                    Limpiar Filtros
                                                </Button>
                                            </div>
                                        ) : (
                                            paginatedConnections.map((conn) => (
                                                <div key={conn.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${conn.relationship_strength >= 4 ? 'bg-orange-100 text-[#FF5A00]' : 'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {conn.company_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium text-gray-900">{conn.company_name}</h4>
                                                            <p className="text-sm text-gray-500">{conn.key_contacts?.[0]?.name || 'Contacto en Red'}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        <div className="flex flex-col items-end mr-4">
                                                            <div className="flex gap-1 mb-1">
                                                                {getRelationshipDots(conn.relationship_strength)}
                                                            </div>
                                                            <span className="text-xs text-gray-400">{getRelationshipLabel(conn.relationship_strength)}</span>
                                                        </div>
                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="sm" onClick={() => { setSelectedConnection(conn); setIsEditingConnection(true); }}>
                                                                <Edit className="h-4 w-4 text-gray-400 hover:text-gray-900" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteConnection(conn.id)}>
                                                                <Trash2 className="h-4 w-4 text-red-400 hover:text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {/* Pagination (Simplified) */}
                                    {totalPages > 1 && (
                                        <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
                                            <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Anterior</Button>
                                            <span className="text-sm py-2 px-2 text-gray-600">Página {currentPage} de {totalPages}</span>
                                            <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Siguiente</Button>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>
                </Tabs>
            )}

            {/* Same Modals (Keep existing ones) */}
            {isImportingLinkedIn && (
                <LinkedInImportModal
                    onClose={() => setIsImportingLinkedIn(false)}
                    onImport={handleLinkedInImport}
                />
            )}

            {isEditingProfile && (
                <EditProfileModal
                    onClose={() => setIsEditingProfile(false)}
                    profile={(profile as unknown as ProfileFormData) || {
                        current_company: '',
                        current_title: '',
                        current_location: '',
                        industries_expertise: [],
                        strengths_tags: []
                    }}
                    onSave={handleUpdateProfile}
                />
            )}

            {(isAddingWork || isEditingWork) && (
                <WorkHistoryModal
                    onClose={() => {
                        setIsAddingWork(false)
                        setIsEditingWork(false)
                        setSelectedWork(null)
                    }}
                    onSave={isEditingWork ? handleUpdateWork : handleAddWork}
                    workHistory={selectedWork as unknown as WorkHistoryFormData || undefined}
                />
            )}

            {(isAddingConnection || isEditingConnection) && (
                <ConnectionModal
                    onClose={() => {
                        setIsAddingConnection(false)
                        setIsEditingConnection(false)
                    }}
                    onSave={isEditingConnection ? handleUpdateConnection : handleAddConnection}
                    connection={selectedConnection as unknown as ConnectionFormData || undefined}
                />
            )}
        </div>
    )
}
