"use client"

import { useState } from "react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Building2,
    Plus,
    RefreshCw,
    Search,
    Edit,
    Trash2,
    ExternalLink,
    CheckCircle2,
    XCircle,
    Clock,
    TrendingUp
} from "lucide-react"

// Types
type Company = {
    id: string
    name: string
    domain: string
    industry: string
    contactsCount: number
    opportunitiesCount: number
    score: number
    status: 'Active' | 'Inactive' | 'Prospect'
    hubspotSynced: boolean
    hubspotId?: string
    description?: string
}

export default function CompaniesPage() {
    // State
    const [searchQuery, setSearchQuery] = useState("")
    const [filterIndustry, setFilterIndustry] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [filterHubspot, setFilterHubspot] = useState<string>("all")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

    // TODO: Fetch real data from /api/companies
    // const { data, isLoading } = useQuery(...)

    // Dummy Stats Data
    const stats = {
        totalCompanies: 127,
        activeOpportunities: 45,
        hubspotSynced: 98,
        avgScore: 76
    }

    // Dummy Companies Data
    const companies: Company[] = [
        {
            id: '1',
            name: 'TechCorp SA',
            domain: 'techcorp.com',
            industry: 'Technology',
            contactsCount: 12,
            opportunitiesCount: 5,
            score: 92,
            status: 'Active',
            hubspotSynced: true,
            hubspotId: 'hs-12345',
            description: 'Leading technology solutions provider'
        },
        {
            id: '2',
            name: 'Global Solutions',
            domain: 'globalsolutions.io',
            industry: 'Consulting',
            contactsCount: 8,
            opportunitiesCount: 3,
            score: 85,
            status: 'Active',
            hubspotSynced: true,
            hubspotId: 'hs-67890'
        },
        {
            id: '3',
            name: 'InnovateX',
            domain: 'innovatex.com',
            industry: 'SaaS',
            contactsCount: 15,
            opportunitiesCount: 7,
            score: 88,
            status: 'Active',
            hubspotSynced: false
        },
        {
            id: '4',
            name: 'Alpha Logistics',
            domain: 'alphalog.com',
            industry: 'Logistics',
            contactsCount: 5,
            opportunitiesCount: 2,
            score: 72,
            status: 'Prospect',
            hubspotSynced: true,
            hubspotId: 'hs-11223'
        },
        {
            id: '5',
            name: 'Beta Systems',
            domain: 'betasys.net',
            industry: 'Technology',
            contactsCount: 3,
            opportunitiesCount: 1,
            score: 65,
            status: 'Inactive',
            hubspotSynced: false
        },
    ]

    // Filter companies
    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            company.domain.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesIndustry = filterIndustry === 'all' || company.industry === filterIndustry
        const matchesStatus = filterStatus === 'all' || company.status === filterStatus
        const matchesHubspot = filterHubspot === 'all' ||
            (filterHubspot === 'synced' && company.hubspotSynced) ||
            (filterHubspot === 'not-synced' && !company.hubspotSynced)

        return matchesSearch && matchesIndustry && matchesStatus && matchesHubspot
    })

    // Handlers
    const handleCreateCompany = () => {
        setIsCreateModalOpen(true)
    }

    const handleEditCompany = (company: Company) => {
        setSelectedCompany(company)
        setIsEditModalOpen(true)
    }

    const handleDeleteCompany = (companyId: string) => {
        // TODO: Implement delete with confirmation
        console.log('Delete company:', companyId)
    }

    const handleSyncHubspot = () => {
        // TODO: Trigger HubSpot sync
        console.log('Syncing with HubSpot...')
    }

    const getStatusBadgeVariant = (status: Company['status']) => {
        switch (status) {
            case 'Active':
                return 'default'
            case 'Inactive':
                return 'secondary'
            case 'Prospect':
                return 'outline'
            default:
                return 'secondary'
        }
    }

    const getStatusIcon = (status: Company['status']) => {
        switch (status) {
            case 'Active':
                return <CheckCircle2 className="h-3 w-3" />
            case 'Inactive':
                return <XCircle className="h-3 w-3" />
            case 'Prospect':
                return <Clock className="h-3 w-3" />
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Empresas</h2>
                    <p className="text-gray-600 mt-1">
                        Administra tu cartera de empresas y sincroniza con HubSpot.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={handleSyncHubspot}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sincronizar HubSpot
                    </Button>
                    <Button size="sm" onClick={handleCreateCompany}>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Empresa
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Total Empresas</CardTitle>
                        <Building2 className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalCompanies}</div>
                        <p className="text-xs text-gray-600 mt-1">+12 este mes</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Oportunidades Activas</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-[#FF5A00]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.activeOpportunities}</div>
                        <p className="text-xs text-gray-600 mt-1">En {filteredCompanies.filter(c => c.status === 'Active').length} empresas</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Sincronizadas HubSpot</CardTitle>
                        <RefreshCw className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.hubspotSynced}</div>
                        <p className="text-xs text-gray-600 mt-1">{Math.round((stats.hubspotSynced / stats.totalCompanies) * 100)}% del total</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Score Promedio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[#FF5A00]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.avgScore}</div>
                        <p className="text-xs text-gray-600 mt-1">+3 puntos vs mes anterior</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por nombre o dominio..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Industry Filter */}
                        <select
                            value={filterIndustry}
                            onChange={(e) => setFilterIndustry(e.target.value)}
                            className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2"
                        >
                            <option value="all">Todas las industrias</option>
                            <option value="Technology">Technology</option>
                            <option value="SaaS">SaaS</option>
                            <option value="Consulting">Consulting</option>
                            <option value="Logistics">Logistics</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="Active">Active</option>
                            <option value="Prospect">Prospect</option>
                            <option value="Inactive">Inactive</option>
                        </select>

                        {/* HubSpot Filter */}
                        <select
                            value={filterHubspot}
                            onChange={(e) => setFilterHubspot(e.target.value)}
                            className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2"
                        >
                            <option value="all">HubSpot: Todas</option>
                            <option value="synced">Sincronizadas</option>
                            <option value="not-synced">No sincronizadas</option>
                        </select>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                        Mostrando <span className="font-semibold text-gray-900">{filteredCompanies.length}</span> de <span className="font-semibold text-gray-900">{companies.length}</span> empresas
                    </div>
                </CardContent>
            </Card>

            {/* Companies Table */}
            <Card className="border-gray-200 bg-white/40 backdrop-blur-sm shadow-md">
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-gray-900 font-semibold">Empresa</TableHead>
                                <TableHead className="text-gray-900 font-semibold">Dominio</TableHead>
                                <TableHead className="text-gray-900 font-semibold">Industria</TableHead>
                                <TableHead className="text-gray-900 font-semibold text-center">Contactos</TableHead>
                                <TableHead className="text-gray-900 font-semibold text-center">Oportunidades</TableHead>
                                <TableHead className="text-gray-900 font-semibold text-center">Score</TableHead>
                                <TableHead className="text-gray-900 font-semibold">Estado</TableHead>
                                <TableHead className="text-gray-900 font-semibold text-center">HubSpot</TableHead>
                                <TableHead className="text-right text-gray-900 font-semibold">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCompanies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                        No se encontraron empresas con los filtros aplicados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCompanies.map((company) => (
                                    <TableRow key={company.id} className="hover:bg-white/60 transition-colors">
                                        <TableCell className="font-medium text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <Building2 className="h-4 w-4 text-gray-500" />
                                                </div>
                                                {company.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <a
                                                href={`https://${company.domain}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[#FF5A00] hover:underline flex items-center gap-1"
                                            >
                                                {company.domain}
                                                <ExternalLink className="h-3 w-3" />
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal border-gray-300">
                                                {company.industry}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center text-gray-900 font-medium">
                                            {company.contactsCount}
                                        </TableCell>
                                        <TableCell className="text-center text-gray-900 font-medium">
                                            {company.opportunitiesCount}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`font-bold ${company.score >= 80 ? 'text-[#FF5A00]' : 'text-gray-600'}`}>
                                                {company.score}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getStatusBadgeVariant(company.status)}
                                                className={`flex items-center gap-1 w-fit ${company.status === 'Active' ? 'bg-[#FF5A00] text-white' : ''}`}
                                            >
                                                {getStatusIcon(company.status)}
                                                {company.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {company.hubspotSynced ? (
                                                <CheckCircle2 className="h-5 w-5 text-green-600 mx-auto" />
                                            ) : (
                                                <XCircle className="h-5 w-5 text-gray-400 mx-auto" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditCompany(company)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteCompany(company.id)}
                                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                    Página 1 de 1
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                        Anterior
                    </Button>
                    <Button variant="outline" size="sm" disabled>
                        Siguiente
                    </Button>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="text-lg font-bold mb-4 text-gray-900">
                                {isCreateModalOpen ? 'Añadir nueva empresa' : 'Editar empresa'}
                            </h3>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault()
                                    console.log("Saving company...") // TODO: Connect to API
                                    setIsCreateModalOpen(false)
                                    setIsEditModalOpen(false)
                                    setSelectedCompany(null)
                                }}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-900">Nombre de la empresa *</label>
                                        <Input
                                            required
                                            placeholder="Ej: TechCorp SA"
                                            defaultValue={selectedCompany?.name}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-900">Dominio *</label>
                                        <Input
                                            required
                                            placeholder="techcorp.com"
                                            defaultValue={selectedCompany?.domain}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-900">Industria</label>
                                        <select
                                            defaultValue={selectedCompany?.industry}
                                            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2"
                                        >
                                            <option value="Technology">Technology</option>
                                            <option value="SaaS">SaaS</option>
                                            <option value="Consulting">Consulting</option>
                                            <option value="Logistics">Logistics</option>
                                            <option value="Finance">Finance</option>
                                            <option value="Healthcare">Healthcare</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-900">Estado</label>
                                        <select
                                            defaultValue={selectedCompany?.status}
                                            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Prospect">Prospect</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-900">Descripción</label>
                                    <textarea
                                        placeholder="Breve descripción de la empresa..."
                                        defaultValue={selectedCompany?.description}
                                        rows={3}
                                        className="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2"
                                    />
                                </div>

                                {isEditModalOpen && selectedCompany?.hubspotId && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-900">HubSpot ID</label>
                                        <Input
                                            disabled
                                            value={selectedCompany.hubspotId}
                                            className="bg-gray-50"
                                        />
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => {
                                            setIsCreateModalOpen(false)
                                            setIsEditModalOpen(false)
                                            setSelectedCompany(null)
                                        }}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button type="submit">
                                        {isCreateModalOpen ? 'Crear Empresa' : 'Guardar Cambios'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
