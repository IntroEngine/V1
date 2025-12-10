"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
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


import { Company } from "@/types/network"

export default function CompaniesPage() {
    const toast = useToast()

    // State
    const [companies, setCompanies] = useState<Company[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterIndustry, setFilterIndustry] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [filterHubspot, setFilterHubspot] = useState<string>("all")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)

    // Form State
    const [formData, setFormData] = useState<Partial<Company>>({})

    // Fetch Companies
    const fetchCompanies = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/companies')
            if (!res.ok) throw new Error('Failed to fetch companies')
            const data = await res.json()
            setCompanies(data)
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar empresas")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCompanies()
    }, [])

    // Derived Stats
    const stats = {
        totalCompanies: companies.length,
        activeOpportunities: companies.reduce((acc, c) => acc + (c.opportunitiesCount || 0), 0),
        hubspotSynced: companies.filter(c => c.hubspotSynced).length,
        avgScore: companies.length > 0 ? Math.round(companies.reduce((acc, c) => acc + (c.score || 0), 0) / companies.length) : 0
    }

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
        setFormData({})
        setIsCreateModalOpen(true)
    }

    const handleEditCompany = (company: Company) => {
        setSelectedCompany(company)
        setFormData({
            name: company.name,
            domain: company.domain,
            industry: company.industry,
            status: company.status,
            description: company.description,
            score: company.score
        })
        setIsEditModalOpen(true)
    }

    const handleDeleteCompany = async (companyId: string) => {
        if (!confirm("¿Estás seguro de eliminar esta empresa?")) return

        try {
            const res = await fetch(`/api/companies/${companyId}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')

            toast.success("Empresa eliminada")
            // MOCK MODE: Manually update local state
            setCompanies(prev => prev.filter(c => c.id !== companyId))
            // fetchCompanies() <--- Disabled for Mock Mode
        } catch (error) {
            toast.error("No se pudo eliminar la empresa")
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = isCreateModalOpen ? '/api/companies' : `/api/companies/${selectedCompany?.id}`
            const method = isCreateModalOpen ? 'POST' : 'PATCH'

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (!res.ok) throw new Error('Failed to save')

            const savedData = await res.json() // Mock API returns the created object or success

            toast.success(isCreateModalOpen ? "Empresa creada" : "Empresa actualizada")

            // MOCK MODE: Manually update local state
            if (isCreateModalOpen) {
                // If the API returns the created object (it does for create), use it. 
                // Otherwise construct it.
                const newCompany = {
                    ...savedData,
                    // Ensure defaults if API didn't return full object
                    contactsCount: 0,
                    opportunitiesCount: 0,
                    hubspotSynced: false
                }
                setCompanies(prev => [...prev, newCompany])
            } else {
                setCompanies(prev => prev.map(c =>
                    c.id === selectedCompany?.id
                        ? { ...c, ...formData } as Company
                        : c
                ))
            }

            setIsCreateModalOpen(false)
            setIsEditModalOpen(false)
            // fetchCompanies() <--- Disabled for Mock Mode
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar cambios")
        }
    }

    const handleSyncHubspot = () => {
        toast.info("Sincronización con HubSpot iniciada (Simulación)")
        setTimeout(() => toast.success("Sincronización completada"), 2000)
    }

    const getStatusBadgeVariant = (status: Company['status']) => {
        switch (status) {
            case 'Active': return 'default'
            case 'Inactive': return 'secondary'
            case 'Prospect': return 'outline'
            default: return 'secondary'
        }
    }

    const getStatusIcon = (status: Company['status']) => {
        switch (status) {
            case 'Active': return <CheckCircle2 className="h-3 w-3" />
            case 'Inactive': return <XCircle className="h-3 w-3" />
            case 'Prospect': return <Clock className="h-3 w-3" />
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500">
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
                        <p className="text-xs text-gray-600 mt-1">En cartera</p>
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
                        <p className="text-xs text-gray-600 mt-1">{stats.totalCompanies > 0 ? Math.round((stats.hubspotSynced / stats.totalCompanies) * 100) : 0}% del total</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Score Promedio</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[#FF5A00]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.avgScore}</div>
                        <p className="text-xs text-gray-600 mt-1">ICP Match</p>
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                        Cargando empresas...
                                    </TableCell>
                                </TableRow>
                            ) : filteredCompanies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                                        No se encontraron empresas.
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
                                            {company.domain && (
                                                <a
                                                    href={`https://${company.domain}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-[#FF5A00] hover:underline flex items-center gap-1"
                                                >
                                                    {company.domain}
                                                    <ExternalLink className="h-3 w-3" />
                                                </a>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal border-gray-300">
                                                {company.industry || 'N/A'}
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
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-900">Nombre de la empresa *</label>
                                        <Input
                                            required
                                            placeholder="Ej: TechCorp SA"
                                            value={formData.name || ''}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-900">Dominio *</label>
                                        <Input
                                            required
                                            placeholder="techcorp.com"
                                            value={formData.domain || ''}
                                            onChange={e => setFormData({ ...formData, domain: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-900">Industria</label>
                                        <select
                                            value={formData.industry || ''}
                                            onChange={e => setFormData({ ...formData, industry: e.target.value })}
                                            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2"
                                        >
                                            <option value="">Seleccionar...</option>
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
                                            value={formData.status || 'new'}
                                            onChange={e => setFormData({ ...formData, status: e.target.value as any })}
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
                                        value={formData.description || ''}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
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
