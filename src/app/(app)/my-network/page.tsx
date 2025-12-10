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
    Award
} from "lucide-react"
import type {
    UserProfile,
    WorkHistory,
    UserConnection,
    NetworkStats,
    ProfileFormData,
    WorkHistoryFormData,
    ConnectionFormData
} from "@/types/network"
import { EditProfileModal } from "@/components/ui/edit-profile-modal"
import { WorkHistoryModal } from "@/components/ui/work-history-modal"
import { ConnectionModal } from "@/components/ui/connection-modal"
import { useToast } from "@/hooks/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export default function MyNetworkPage() {
    const { toast } = useToast()

    // Data State
    const [isLoading, setIsLoading] = useState(true)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [workHistory, setWorkHistory] = useState<WorkHistory[]>([])
    const [connections, setConnections] = useState<UserConnection[]>([])
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

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/my-network')
            if (!res.ok) throw new Error('Failed to fetch data')
            const data = await res.json()

            setProfile(data.profile)
            setWorkHistory(data.workHistory)
            setConnections(data.connections)
            setStats(data.stats)
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos de la red.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }, [toast])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // Handlers
    const handleSaveProfile = async (data: ProfileFormData) => {
        try {
            const res = await fetch('/api/my-network/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (!res.ok) throw new Error()

            await fetchData()
            setIsEditingProfile(false)
            toast({ title: "Perfil actualizado correctamente" })
        } catch (error) {
            toast({
                title: "Error",
                description: "No se pudo actualizar el perfil.",
                variant: "destructive"
            })
        }
    }

    const handleSaveWork = async (data: WorkHistoryFormData) => {
        try {
            const method = isEditingWork ? 'PUT' : 'POST'
            const body = isEditingWork && selectedWork
                ? { ...data, id: selectedWork.id }
                : data

            const res = await fetch('/api/my-network/work-history', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            if (!res.ok) throw new Error()

            await fetchData()
            setIsAddingWork(false)
            setIsEditingWork(false)
            setSelectedWork(null)
            toast({ title: isEditingWork ? "Experiencia actualizada" : "Experiencia añadida" })
        } catch (error) {
            toast({ title: "Error al guardar experiencia", variant: "destructive" })
        }
    }

    const handleDeleteWork = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta experiencia?")) return
        try {
            const res = await fetch(`/api/my-network/work-history?id=${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error()
            await fetchData()
            toast({ title: "Experiencia eliminada" })
        } catch (error) {
            toast({ title: "Error al eliminar", variant: "destructive" })
        }
    }

    const handleSaveConnection = async (data: ConnectionFormData) => {
        try {
            const method = isEditingConnection ? 'PUT' : 'POST'
            const body = isEditingConnection && selectedConnection
                ? { ...data, id: selectedConnection.id }
                : data

            const res = await fetch('/api/my-network/connections', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            if (!res.ok) throw new Error()

            await fetchData()
            setIsAddingConnection(false)
            setIsEditingConnection(false)
            setSelectedConnection(null)
            toast({ title: isEditingConnection ? "Conexión actualizada" : "Conexión añadida" })
        } catch (error) {
            toast({ title: "Error al guardar conexión", variant: "destructive" })
        }
    }

    const handleDeleteConnection = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta conexión?")) return
        try {
            const res = await fetch(`/api/my-network/connections?id=${id}`, { method: 'DELETE' })
            if (!res.ok) throw new Error()
            await fetchData()
            toast({ title: "Conexión eliminada" })
        } catch (error) {
            toast({ title: "Error al eliminar", variant: "destructive" })
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

    if (isLoading) {
        return <div className="flex h-96 items-center justify-center"><LoadingSpinner /></div>
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
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

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Empresas Pasadas</CardTitle>
                        <Briefcase className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.total_companies_worked}</div>
                        <p className="text-xs text-gray-600 mt-1">En tu historial</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Contactos Actuales</CardTitle>
                        <Users className="h-4 w-4 text-[#FF5A00]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.total_connections}</div>
                        <p className="text-xs text-gray-600 mt-1">Empresas con contactos</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Industrias</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.total_industries}</div>
                        <p className="text-xs text-gray-600 mt-1">Áreas de expertise</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Intros Posibles</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.total_intro_opportunities}</div>
                        <p className="text-xs text-gray-600 mt-1">Oportunidades detectadas</p>
                    </CardContent>
                </Card>
            </div>

            {/* Profile Completeness */}
            <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-[#FF5A00]" />
                            <span className="font-medium text-gray-900">Completitud del Perfil</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{stats.profile_completeness}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-[#FF5A00] h-2 rounded-full transition-all duration-300"
                            style={{ width: `${stats.profile_completeness}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                        Completa tu perfil para mejorar la detección de oportunidades
                    </p>
                </CardContent>
            </Card>

            {/* Professional Profile */}
            <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-gray-900">👤 Mi Perfil Profesional</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsEditingProfile(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Empresa Actual</label>
                            <p className="text-gray-900 mt-1">{profile?.current_company || '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Cargo Actual</label>
                            <p className="text-gray-900 mt-1">{profile?.current_title || '-'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Ubicación</label>
                            <p className="text-gray-900 mt-1">{profile?.current_location || '-'}</p>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Industrias de Expertise</label>
                        <div className="flex flex-wrap gap-2">
                            {profile?.industries_expertise && profile.industries_expertise.length > 0 ? (
                                profile.industries_expertise.map((industry, i) => (
                                    <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                        {industry}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-gray-500">No hay industrias añadidas</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Fortalezas</label>
                        <div className="flex flex-wrap gap-2">
                            {profile?.strengths_tags && profile.strengths_tags.length > 0 ? (
                                profile.strengths_tags.map((strength, i) => (
                                    <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                        <Award className="h-3 w-3 mr-1" />
                                        {strength}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-sm text-gray-500">No hay fortalezas añadidas</span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Work History */}
            <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-gray-900">💼 Historial Laboral</CardTitle>
                    <Button size="sm" onClick={() => setIsAddingWork(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {workHistory.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No hay experiencia laboral registrada</p>
                        )}
                        {workHistory.map((work) => (
                            <div
                                key={work.id}
                                className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-[#FF5A00] transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-semibold text-gray-900">{work.company_name}</h4>
                                        {work.seniority && (
                                            <Badge variant="outline" className="text-xs">
                                                {work.seniority}
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700">{work.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {work.start_date ? new Date(work.start_date).getFullYear() : ''} -
                                        {work.is_current ? ' Presente' : (work.end_date ? ` ${new Date(work.end_date).getFullYear()}` : '')}
                                    </p>
                                    {work.achievements && work.achievements.length > 0 && (
                                        <div className="mt-2">
                                            <ul className="text-xs text-gray-600 space-y-1">
                                                {work.achievements.map((achievement, i) => (
                                                    <li key={i}>• {achievement}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setSelectedWork(work)
                                        setIsEditingWork(true)
                                    }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteWork(work.id)}>
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Connections */}
            <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-gray-900">🤝 Empresas donde tengo Contactos</CardTitle>
                    <Button size="sm" onClick={() => setIsAddingConnection(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {connections.length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">No hay conexiones registradas</p>
                        )}
                        {connections.map((connection) => (
                            <div
                                key={connection.id}
                                className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-[#FF5A00] transition-colors"
                            >
                                <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900 mb-2">{connection.company_name}</h4>

                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-sm text-gray-700">Relación:</span>
                                        <div className="flex gap-1">
                                            {getRelationshipDots(connection.relationship_strength)}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            ({connection.relationship_strength}/5) - {getRelationshipLabel(connection.relationship_strength)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-gray-600">
                                        <span>{connection.contact_count} contactos</span>
                                        {connection.connection_type && (
                                            <Badge variant="outline" className="text-xs">
                                                {connection.connection_type}
                                            </Badge>
                                        )}
                                    </div>

                                    {connection.notes && (
                                        <p className="text-xs text-gray-600 mt-2">{connection.notes}</p>
                                    )}

                                    {connection.tags && connection.tags.length > 0 && (
                                        <div className="flex gap-1 mt-2">
                                            {connection.tags.map((tag, i) => (
                                                <Badge key={i} variant="outline" className="text-xs bg-gray-50">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => {
                                        setSelectedConnection(connection)
                                        setIsEditingConnection(true)
                                    }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteConnection(connection.id)}>
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            {isEditingProfile && profile && (
                <EditProfileModal
                    profile={{
                        current_company: profile.current_company || undefined,
                        current_title: profile.current_title || undefined,
                        current_location: profile.current_location || undefined,
                        industries_expertise: profile.industries_expertise || [],
                        strengths_tags: profile.strengths_tags || []
                    }}
                    onSave={handleSaveProfile}
                    onClose={() => setIsEditingProfile(false)}
                />
            )}

            {(isAddingWork || isEditingWork) && (
                <WorkHistoryModal
                    workHistory={selectedWork ? {
                        company_name: selectedWork.company_name,
                        company_domain: selectedWork.company_domain || undefined,
                        company_industry: selectedWork.company_industry || undefined,
                        title: selectedWork.title,
                        seniority: selectedWork.seniority || undefined,
                        start_date: selectedWork.start_date || undefined,
                        end_date: selectedWork.end_date || undefined,
                        is_current: selectedWork.is_current,
                        description: selectedWork.description || undefined,
                        achievements: selectedWork.achievements
                    } : undefined}
                    onSave={handleSaveWork}
                    onClose={() => {
                        setIsAddingWork(false)
                        setIsEditingWork(false)
                        setSelectedWork(null)
                    }}
                />
            )}

            {(isAddingConnection || isEditingConnection) && (
                <ConnectionModal
                    connection={selectedConnection ? {
                        company_name: selectedConnection.company_name,
                        company_domain: selectedConnection.company_domain || undefined,
                        relationship_strength: selectedConnection.relationship_strength,
                        contact_count: selectedConnection.contact_count,
                        key_contacts: selectedConnection.key_contacts,
                        connection_type: selectedConnection.connection_type || undefined,
                        notes: selectedConnection.notes || undefined,
                        tags: selectedConnection.tags,
                        last_interaction_date: selectedConnection.last_interaction_date || undefined
                    } : undefined}
                    onSave={handleSaveConnection}
                    onClose={() => {
                        setIsAddingConnection(false)
                        setIsEditingConnection(false)
                        setSelectedConnection(null)
                    }}
                />
            )}
        </div>
    )
}
