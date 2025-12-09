"use client"

import { useState } from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import type { UserProfile, WorkHistory, UserConnection, NetworkStats, ProfileFormData, WorkHistoryFormData, ConnectionFormData } from "@/types/network"
import { EditProfileModal } from "@/components/ui/edit-profile-modal"
import { WorkHistoryModal } from "@/components/ui/work-history-modal"
import { ConnectionModal } from "@/components/ui/connection-modal"
import { useToast } from "@/hooks/use-toast"

export default function MyNetworkPage() {
    const toast = useToast()

    // State
    const [isEditingProfile, setIsEditingProfile] = useState(false)
    const [isAddingWork, setIsAddingWork] = useState(false)
    const [isEditingWork, setIsEditingWork] = useState(false)
    const [selectedWork, setSelectedWork] = useState<WorkHistory | null>(null)
    const [isAddingConnection, setIsAddingConnection] = useState(false)
    const [isEditingConnection, setIsEditingConnection] = useState(false)
    const [selectedConnection, setSelectedConnection] = useState<UserConnection | null>(null)
    const [isImportingLinkedIn, setIsImportingLinkedIn] = useState(false)

    // TODO: Fetch from API
    const stats: NetworkStats = {
        total_companies_worked: 12,
        total_connections: 45,
        total_industries: 8,
        total_intro_opportunities: 23,
        profile_completeness: 75
    }

    // TODO: Fetch from API
    const profile: UserProfile | null = {
        id: '1',
        user_id: 'user_1',
        current_company: 'TechCorp SA',
        current_title: 'VP of Product',
        current_location: 'Madrid, Spain',
        past_companies: [],
        industries_expertise: ['SaaS', 'B2B', 'Enterprise'],
        strengths_tags: ['Product', 'Sales', 'Strategy'],
        profile_completeness: 75,
        linkedin_imported: false,
        last_sync_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    const workHistory: WorkHistory[] = [
        {
            id: '1',
            user_id: 'user_1',
            company_name: 'Microsoft',
            company_domain: 'microsoft.com',
            company_industry: 'Technology',
            title: 'Product Manager',
            seniority: 'Manager',
            start_date: '2018-01-15',
            end_date: '2020-06-30',
            is_current: false,
            description: null,
            achievements: ['Launched 3 major features', 'Managed team of 5'],
            source: 'manual',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: '2',
            user_id: 'user_1',
            company_name: 'Google',
            company_domain: 'google.com',
            company_industry: 'Technology',
            title: 'Associate PM',
            seniority: 'IC',
            start_date: '2015-06-01',
            end_date: '2018-01-01',
            is_current: false,
            description: null,
            achievements: [],
            source: 'manual',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ]

    const connections: UserConnection[] = [
        {
            id: '1',
            user_id: 'user_1',
            company_name: 'Amazon',
            company_domain: 'amazon.com',
            relationship_strength: 4,
            contact_count: 5,
            key_contacts: [
                { name: 'John Doe', title: 'VP Engineering', relationship: 'ex-colleague' }
            ],
            connection_type: 'ex-colleague',
            notes: 'Worked together at Microsoft 2018-2020',
            tags: ['engineering', 'product'],
            source: 'manual',
            last_interaction_date: '2024-11-15',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: '2',
            user_id: 'user_1',
            company_name: 'Salesforce',
            company_domain: 'salesforce.com',
            relationship_strength: 3,
            contact_count: 2,
            key_contacts: [],
            connection_type: 'client',
            notes: 'Former clients',
            tags: ['sales'],
            source: 'manual',
            last_interaction_date: '2024-10-20',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ]

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
                            {profile?.industries_expertise.map((industry, i) => (
                                <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                    {industry}
                                </Badge>
                            ))}
                            {profile?.industries_expertise.length === 0 && (
                                <span className="text-sm text-gray-500">No hay industrias añadidas</span>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Fortalezas</label>
                        <div className="flex flex-wrap gap-2">
                            {profile?.strengths_tags.map((strength, i) => (
                                <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                                    <Award className="h-3 w-3 mr-1" />
                                    {strength}
                                </Badge>
                            ))}
                            {profile?.strengths_tags.length === 0 && (
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
                        {workHistory.map((work) => (
                            <div
                                key={work.id}
                                className="flex items-start justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-[#FF5A00] transition-colors"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="font-semibold text-gray-900">{work.company_name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                            {work.seniority}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-700">{work.title}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(work.start_date!).getFullYear()} - {work.end_date ? new Date(work.end_date).getFullYear() : 'Presente'}
                                    </p>
                                    {work.achievements.length > 0 && (
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
                                    <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
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

                                    {connection.tags.length > 0 && (
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
                                    <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* TODO: Modals */}
            {/* - Edit Profile Modal */}
            {/* - Add/Edit Work History Modal */}
            {/* - Add/Edit Connection Modal */}
            {/* - LinkedIn Import Modal */}
        </div>
    )
}
