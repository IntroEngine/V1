"use client"

import { Opportunity, OpportunityStats } from "@/types/network"
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
    Lightbulb,
    RefreshCw,
    Search,
    Send,
    MessageSquare,
    Eye,
    TrendingUp,
    Users,
    LayoutGrid,
    List,
    Zap
} from "lucide-react"
import { ActionTemplateModal } from "@/components/ui/action-template-modal"
import { updateOpportunityStatus } from "@/app/actions/opportunity-actions"

export default function OpportunitiesPage() {
    const toast = useToast()

    // State
    const [opportunities, setOpportunities] = useState<Opportunity[]>([])
    const [stats, setStats] = useState<OpportunityStats>({
        totalOpportunities: 0,
        introOpportunities: 0,
        outboundOpportunities: 0,
        successRate: 0
    })
    const [isLoading, setIsLoading] = useState(true)

    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [filterScore, setFilterScore] = useState<string>("all")
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    // Action Modal State
    const [selectedActionOpp, setSelectedActionOpp] = useState<Opportunity | null>(null)
    const [isActionModalOpen, setIsActionModalOpen] = useState(false)

    // Fetch Data
    const fetchOpportunities = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/opportunities')
            if (!res.ok) throw new Error('Failed to fetch')
            const data = await res.json()
            setOpportunities(data.opportunities)
            setStats(data.stats)
        } catch (error) {
            console.error(error)
            toast.error("Error al cargar oportunidades")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchOpportunities()
    }, [])

    // Filter opportunities
    const filteredOpportunities = opportunities.filter(opp => {
        const matchesSearch = opp.targetCompany.toLowerCase().includes(searchQuery.toLowerCase()) ||
            opp.targetContact.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesType = filterType === 'all' || opp.type === filterType
        const matchesStatus = filterStatus === 'all' || opp.status === filterStatus
        const matchesScore = filterScore === 'all' ||
            (filterScore === 'high' && opp.aiScore >= 90) ||
            (filterScore === 'medium' && opp.aiScore >= 70 && opp.aiScore < 90) ||
            (filterScore === 'low' && opp.aiScore < 70)

        return matchesSearch && matchesType && matchesStatus && matchesScore
    })

    // Handlers
    const handleViewDetails = (opportunity: Opportunity) => {
        setSelectedOpportunity(opportunity)
        setIsDetailModalOpen(true)
    }

    const handleRequestIntro = async (opportunity: Opportunity) => {
        // Optimistic UI update
        setOpportunities(prev => prev.map(o => o.id === opportunity.id ? { ...o, status: 'Requested' } : o))

        // Open Modal
        setSelectedActionOpp(opportunity)
        setIsActionModalOpen(true)

        // Persist to DB
        try {
            await updateOpportunityStatus(opportunity.id, opportunity.type, 'Requested')
        } catch (error) {
            console.error("Failed to update status", error)
            toast.error("Error al guardar estado")
        }
    }

    const handleGenerateOutbound = async (opportunityId: string) => {
        const opp = opportunities.find(o => o.id === opportunityId)
        if (opp) {
            // Optimistic Update
            setOpportunities(prev => prev.map(o => o.id === opportunityId ? { ...o, status: 'In Progress' } : o))

            setSelectedActionOpp(opp)
            setIsActionModalOpen(true)

            // Persist to DB
            try {
                await updateOpportunityStatus(opp.id, opp.type, 'In Progress')
            } catch (error) {
                console.error("Failed to update status", error)
                toast.error("Error al guardar estado")
            }
        }
    }

    const handleRefreshAI = async () => {
        setIsLoading(true)
        toast.info("Re-analizando red...")
        try {
            const res = await fetch('/api/opportunities/refresh', { method: 'POST' })
            if (!res.ok) throw new Error('Failed to refresh')

            const result = await res.json()
            toast.success(`Análisis completado: ${result.data.created} nuevas oportunidades`)

            // Reload list
            await fetchOpportunities()
        } catch (error) {
            console.error(error)
            toast.error("Error al actualizar análisis")
        } finally {
            setIsLoading(false)
        }
    }

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'bg-green-500'
        if (score >= 70) return 'bg-[#FF5A00]'
        return 'bg-gray-400'
    }

    const getScoreLabel = (score: number) => {
        if (score >= 90) return 'Excelente'
        if (score >= 70) return 'Bueno'
        return 'Bajo'
    }

    const getTypeBadgeClass = (type: Opportunity['type']) => {
        return type === 'Intro'
            ? 'bg-gradient-to-r from-[#FF5A00] to-orange-600 text-white'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
    }

    const getStatusBadgeVariant = (status: Opportunity['status']): "default" | "secondary" | "success" | "warning" | "destructive" | "outline" => {
        switch (status) {
            case 'Suggested': return 'secondary'
            case 'Requested': return 'outline'
            case 'In Progress': return 'default'
            case 'Won': return 'success'
            case 'Lost': return 'destructive'
            default: return 'secondary'
        }
    }

    // View Mode State
    const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('pipeline')

    const handleStageChange = async (opportunityId: string, newStatus: string) => {
        const opp = opportunities.find(o => o.id === opportunityId)
        if (!opp) return

        // Optimistic Update
        setOpportunities(prev => prev.map(o => o.id === opportunityId ? { ...o, status: newStatus as any } : o))
        toast.success(`Oportunidad movida a ${newStatus}`)

        // Persist
        try {
            await updateOpportunityStatus(opportunityId, opp.type, newStatus)
        } catch (error) {
            console.error("Failed to update status", error)
            toast.error("Error al guardar estado")
            // Revert logic could go here
        }
    }

    // Drag and Drop State and Handlers
    const [draggedOppId, setDraggedOppId] = useState<string | null>(null)

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedOppId(id)
        e.dataTransfer.effectAllowed = "move"
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault() // Necessary to allow dropping
        e.dataTransfer.dropEffect = "move"
    }

    const handleDrop = (e: React.DragEvent, newStatus: string) => {
        e.preventDefault()
        if (draggedOppId) {
            handleStageChange(draggedOppId, newStatus)
            setDraggedOppId(null)
        }
    }

    // Pipeline Columns
    const columns = [
        { id: 'Suggested', title: 'Sugerido', color: 'bg-blue-50 border-blue-200' },
        { id: 'Requested', title: 'Solicitado', color: 'bg-orange-50 border-orange-200' },
        { id: 'In Progress', title: 'En Progreso', color: 'bg-purple-50 border-purple-200' },
        { id: 'Won', title: 'Ganado', color: 'bg-green-50 border-green-200' },
        { id: 'Lost', title: 'Perdido', color: 'bg-red-50 border-red-200' }
    ]

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-500 p-6 pb-20 md:pb-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Pipeline de Oportunidades</h2>
                    <p className="text-gray-600 mt-1">
                        Gestiona intros cálidas y outbound generados por IA.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
                        <button
                            onClick={() => setViewMode('pipeline')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'pipeline' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            title="Vista Pipeline"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
                            title="Vista Lista"
                        >
                            <List className="h-4 w-4" />
                        </button>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleRefreshAI}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Actualizar IA
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Total Oportunidades</CardTitle>
                        <Lightbulb className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalOpportunities}</div>
                        <p className="text-xs text-gray-600 mt-1">+8 esta semana</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Intros Disponibles</CardTitle>
                        <Users className="h-4 w-4 text-[#FF5A00]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.introOpportunities}</div>
                        <p className="text-xs text-gray-600 mt-1">Con bridge contacts</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Outbound Sugerido</CardTitle>
                        <Zap className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.outboundOpportunities}</div>
                        <p className="text-xs text-gray-600 mt-1">Listo para generar</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Tasa de Éxito</CardTitle>
                        <TrendingUp className="h-4 w-4 text-[#FF5A00]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.successRate}%</div>
                        <p className="text-xs text-gray-600 mt-1">Últimos 30 días</p>
                    </CardContent>
                </Card>
            </div>

            {/* View Content */}
            {viewMode === 'list' ? (
                <>
                    {/* Filters and Search */}
                    <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                        <CardContent className="pt-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Buscar por empresa o contacto..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2">
                                    <option value="all">Todos los tipos</option>
                                    <option value="Intro">Intros</option>
                                    <option value="Outbound">Outbound</option>
                                </select>
                                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2">
                                    <option value="all">Todos los estados</option>
                                    <option value="Suggested">Sugerido</option>
                                    <option value="Requested">Pedido</option>
                                    <option value="In Progress">En Progreso</option>
                                    <option value="Won">Ganado</option>
                                    <option value="Lost">Perdido</option>
                                </select>
                            </div>
                            <div className="mt-3 text-sm text-gray-600">
                                Mostrando <span className="font-semibold text-gray-900">{filteredOpportunities.length}</span> de <span className="font-semibold text-gray-900">{opportunities.length}</span> oportunidades
                            </div>
                        </CardContent>
                    </Card>

                    {/* Opportunities Table */}
                    <Card className="border-gray-200 bg-white/40 backdrop-blur-sm shadow-md">
                        <CardContent className="pt-6">
                            {/* DESKTOP TABLE */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="text-gray-900 font-semibold">Tipo</TableHead>
                                            <TableHead className="text-gray-900 font-semibold">Empresa Target</TableHead>
                                            <TableHead className="text-gray-900 font-semibold">Contacto Target</TableHead>
                                            <TableHead className="text-gray-900 font-semibold">Bridge Contact</TableHead>
                                            <TableHead className="text-gray-900 font-semibold">AI Score</TableHead>
                                            <TableHead className="text-gray-900 font-semibold">Reasoning</TableHead>
                                            <TableHead className="text-gray-900 font-semibold">Estado</TableHead>
                                            <TableHead className="text-right text-gray-900 font-semibold">Acciones</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-gray-500">Cargando oportunidades...</TableCell>
                                            </TableRow>
                                        ) : filteredOpportunities.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={8} className="text-center py-8 text-gray-500">No se encontraron oportunidades.</TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredOpportunities.map((opp) => (
                                                <TableRow key={opp.id} className="hover:bg-white/60 transition-colors">
                                                    <TableCell><Badge className={`${getTypeBadgeClass(opp.type)} border-0`}>{opp.type}</Badge></TableCell>
                                                    <TableCell className="font-medium text-gray-900">{opp.targetCompany}</TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900 text-sm">{opp.targetContact.name}</span>
                                                            <span className="text-xs text-gray-600">{opp.targetContact.role}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {opp.bridgeContact ? (
                                                            <div className="flex flex-col">
                                                                <span className="font-medium text-gray-900 text-sm">{opp.bridgeContact.name}</span>
                                                                <span className="text-xs text-gray-600">{opp.bridgeContact.role}</span>
                                                                <div className="flex items-center gap-1 mt-1">
                                                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-[#FF5A00]" style={{ width: `${opp.bridgeContact.relationshipStrength}%` }} />
                                                                    </div>
                                                                    <span className="text-xs text-gray-600">{opp.bridgeContact.relationshipStrength}</span>
                                                                </div>
                                                            </div>
                                                        ) : <span className="text-gray-400 text-sm">-</span>}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-bold text-gray-900">{opp.aiScore}</span>
                                                            </div>
                                                            <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div className={`h-full ${getScoreColor(opp.aiScore)}`} style={{ width: `${opp.aiScore}%` }} />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="max-w-[250px]"><p className="text-sm text-gray-600 line-clamp-2">{opp.reasoning}</p></TableCell>
                                                    <TableCell><Badge variant={getStatusBadgeVariant(opp.status)} className={opp.status === 'Won' ? 'bg-[#FF5A00] text-white' : ''}>{opp.status}</Badge></TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {opp.type === 'Intro' && opp.status === 'Suggested' && (
                                                                <Button variant="primary" size="sm" onClick={() => handleRequestIntro(opp)} className="h-8"><Send className="h-3 w-3 mr-1" />Pedir Intro</Button>
                                                            )}
                                                            {opp.type === 'Outbound' && opp.status === 'Suggested' && (
                                                                <Button variant="outline" size="sm" onClick={() => handleGenerateOutbound(opp.id)} className="h-8"><MessageSquare className="h-3 w-3 mr-1" />Generar</Button>
                                                            )}
                                                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(opp)} className="h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* MOBILE LIST VIEW */}
                            <div className="md:hidden space-y-4">
                                {isLoading ? (
                                    <div className="text-center py-8 text-gray-500">Cargando oportunidades...</div>
                                ) : filteredOpportunities.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">No se encontraron oportunidades.</div>
                                ) : (
                                    filteredOpportunities.map((opp) => (
                                        <div key={opp.id} className="bg-white/60 p-4 rounded-lg border border-gray-100 shadow-sm space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">{opp.targetCompany}</h3>
                                                    <p className="text-sm text-gray-600">{opp.targetContact.name}</p>
                                                </div>
                                                <Badge className={`${getTypeBadgeClass(opp.type)} border-0 text-[10px]`}>{opp.type}</Badge>
                                            </div>

                                            {opp.bridgeContact && (
                                                <div className="text-sm bg-orange-50 p-2 rounded-md">
                                                    <span className="text-xs text-gray-500 uppercase font-bold">Bridge Contact</span>
                                                    <div className="font-medium text-gray-900">{opp.bridgeContact.name}</div>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                            <div className="h-full bg-[#FF5A00]" style={{ width: `${opp.bridgeContact.relationshipStrength}%` }} />
                                                        </div>
                                                        <span className="text-xs text-gray-600">{opp.bridgeContact.relationshipStrength}%</span>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center py-2 border-t border-gray-100 mt-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={getStatusBadgeVariant(opp.status)} className="text-[10px]">{opp.status}</Badge>
                                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${opp.aiScore >= 90 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-[#FF5A00]'} `}>Score: {opp.aiScore}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {opp.type === 'Intro' && opp.status === 'Suggested' && (
                                                        <Button variant="ghost" size="sm" onClick={() => handleRequestIntro(opp)} className="h-8 w-8 p-0 text-[#FF5A00]">
                                                            <Send className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="sm" onClick={() => handleViewDetails(opp)} className="h-8 w-8 p-0"><Eye className="h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            ) : (
                /* PIPELINE VIEW */
                <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)] w-full md:overflow-hidden md:gap-2">
                    {columns.map(col => (
                        <div
                            key={col.id}
                            className={`min-w-[280px] w-[280px] md:min-w-0 md:flex-1 md:w-auto flex flex-col bg-gray-50/50 rounded-xl border border-gray-200 h-full transition-colors ${draggedOppId ? 'bg-gray-100/80 border-dashed' : ''}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, col.id)}
                        >
                            {/* Column Header */}
                            <div className={`p-4 border-b ${col.color} rounded-t-xl sticky top-0 bg-white/50 backdrop-blur-sm z-10`}>
                                <h3 className="font-semibold text-gray-900 flex items-center justify-between">
                                    {col.title}
                                    <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs text-gray-600 font-medium">
                                        {opportunities.filter(o => o.status === col.id).length}
                                    </span>
                                </h3>
                            </div>

                            {/* Column Content */}
                            <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-hide">
                                {opportunities.filter(o => o.status === col.id).map(opp => (
                                    <div
                                        key={opp.id}
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, opp.id)}
                                        className="cursor-move"
                                    >
                                        <Card className={`bg-white hover:shadow-md transition-shadow cursor-pointer border-gray-200 group ${draggedOppId === opp.id ? 'opacity-50 ring-2 ring-[#FF5A00] rotate-2' : ''}`} onClick={() => handleViewDetails(opp)}>
                                            <CardContent className="p-4 space-y-3">
                                                {/* Header: Company & Bridge */}
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 text-sm leading-tight">{opp.targetCompany}</h4>
                                                        <span className="text-xs text-gray-500 mt-1 block">{opp.targetContact.name}</span>
                                                    </div>
                                                    <Badge className={`${getTypeBadgeClass(opp.type)} text-[10px] px-1.5 py-0 h-5`}>
                                                        {opp.type}
                                                    </Badge>
                                                </div>

                                                {/* Bridge Contact (Mini) */}
                                                {
                                                    opp.bridgeContact && (
                                                        <div className="flex items-center gap-2 bg-orange-50/50 p-2 rounded-md">
                                                            <div className="h-6 w-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-[#FF5A00]">
                                                                {opp.bridgeContact.name.charAt(0)}
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-xs font-medium text-gray-900 truncate">{opp.bridgeContact.name}</p>
                                                                <div className="flex items-center gap-1">
                                                                    <div className="w-10 h-1 bg-gray-200 rounded-full overflow-hidden">
                                                                        <div className="h-full bg-[#FF5A00]" style={{ width: `${opp.bridgeContact.relationshipStrength}%` }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                }

                                                {/* Reasoning Snippet */}
                                                < p className="text-xs text-gray-500 line-clamp-2 italic" >
                                                    "{opp.reasoning}"
                                                </p>

                                                {/* Footer: Score & Action */}
                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                                    <div className="flex items-center gap-1.5" title="AI Match Score">
                                                        <div className={`w-2 h-2 rounded-full ${getScoreColor(opp.aiScore)}`} />
                                                        <span className="text-xs font-bold text-gray-700">{opp.aiScore}</span>
                                                    </div>

                                                    {/* In-Card Actions */}
                                                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                                        {opp.type === 'Intro' && opp.status === 'Suggested' && (
                                                            <Button size="sm" variant="ghost" className="h-7 px-2 text-[#FF5A00] hover:text-[#FF5A00] hover:bg-orange-50" onClick={() => handleRequestIntro(opp)}>
                                                                <Send className="h-3 w-3 mr-1" />
                                                                Pedir
                                                            </Button>
                                                        )}

                                                        {opp.status === 'Requested' && (
                                                            <Button size="sm" variant="ghost" className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleStageChange(opp.id, 'In Progress')}>
                                                                Conversando
                                                            </Button>
                                                        )}

                                                        {opp.status === 'In Progress' && (
                                                            <Button size="sm" variant="ghost" className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleStageChange(opp.id, 'Won')}>
                                                                Marcar Ganado
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div >
            )}

            {/* Existing Detail Modal */}
            {
                isDetailModalOpen && selectedOpportunity && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <Card className="w-full max-w-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900">{selectedOpportunity.targetCompany}</h3>
                                        <Badge className={`${getTypeBadgeClass(selectedOpportunity.type)} border-0 mt-2`}>
                                            {selectedOpportunity.type} Opportunity
                                        </Badge>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setIsDetailModalOpen(false)} className="text-gray-500">✕</Button>
                                </div>

                                <div className="space-y-6">
                                    {/* AI Score */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">AI Score</h4>
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl font-bold text-gray-900">{selectedOpportunity.aiScore}</div>
                                            <div className="flex-1">
                                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className={`h-full ${getScoreColor(selectedOpportunity.aiScore)}`} style={{ width: `${selectedOpportunity.aiScore}%` }} />
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{getScoreLabel(selectedOpportunity.aiScore)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Target Contact */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Target Contact</h4>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="font-medium text-gray-900">{selectedOpportunity.targetContact.name}</p>
                                            <p className="text-sm text-gray-600">{selectedOpportunity.targetContact.role}</p>
                                            <p className="text-sm text-[#FF5A00] mt-1">{selectedOpportunity.targetContact.email}</p>
                                        </div>
                                    </div>
                                    {/* Bridge Contact */}
                                    {selectedOpportunity.bridgeContact && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 mb-2">Bridge Contact</h4>
                                            <div className="bg-orange-50 rounded-lg p-4">
                                                <p className="font-medium text-gray-900">{selectedOpportunity.bridgeContact.name}</p>
                                                <p className="text-sm text-gray-600">{selectedOpportunity.bridgeContact.role}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="text-xs text-gray-600">Relationship Strength:</span>
                                                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[#FF5A00]" style={{ width: `${selectedOpportunity.bridgeContact.relationshipStrength}%` }} />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{selectedOpportunity.bridgeContact.relationshipStrength}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {/* AI Reasoning */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">AI Reasoning</h4>
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-700">{selectedOpportunity.reasoning}</p>
                                        </div>
                                    </div>
                                    {/* Actions */}
                                    <div className="flex justify-end gap-3 pt-4 border-t">
                                        <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Cerrar</Button>
                                        {selectedOpportunity.type === 'Intro' && selectedOpportunity.status === 'Suggested' && (
                                            <Button variant="primary" onClick={() => handleRequestIntro(selectedOpportunity)}>
                                                <Send className="h-4 w-4 mr-2" />
                                                Pedir Intro
                                            </Button>
                                        )}
                                        {selectedOpportunity.type === 'Outbound' && selectedOpportunity.status === 'Suggested' && (
                                            <Button variant="primary" onClick={() => handleGenerateOutbound(selectedOpportunity.id)}>
                                                <MessageSquare className="h-4 w-4 mr-2" />
                                                Generar Outbound
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )
            }

            {/* NEW: Action Template Modal */}
            <ActionTemplateModal
                isOpen={isActionModalOpen}
                onClose={() => setIsActionModalOpen(false)}
                opportunity={selectedActionOpp}
            />
        </div>
    )
}
