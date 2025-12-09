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
    Lightbulb,
    RefreshCw,
    Search,
    Send,
    MessageSquare,
    Eye,
    TrendingUp,
    CheckCircle2,
    Zap,
    Users,
    ArrowRight
} from "lucide-react"

// Types
type Opportunity = {
    id: string
    type: 'Intro' | 'Outbound'
    targetCompany: string
    targetCompanyId: string
    targetContact: {
        name: string
        role: string
        email: string
    }
    bridgeContact?: {
        name: string
        role: string
        relationshipStrength: number
    }
    aiScore: number
    reasoning: string
    status: 'Suggested' | 'Requested' | 'In Progress' | 'Won' | 'Lost'
    createdDate: string
}

export default function OpportunitiesPage() {
    // State
    const [searchQuery, setSearchQuery] = useState("")
    const [filterType, setFilterType] = useState<string>("all")
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [filterScore, setFilterScore] = useState<string>("all")
    const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

    // TODO: Fetch real data from /api/opportunities
    // const { data, isLoading } = useQuery(...)

    // Dummy Stats Data
    const stats = {
        totalOpportunities: 47,
        introOpportunities: 28,
        outboundOpportunities: 19,
        successRate: 34
    }

    // Dummy Opportunities Data
    const opportunities: Opportunity[] = [
        {
            id: '1',
            type: 'Intro',
            targetCompany: 'TechCorp SA',
            targetCompanyId: '1',
            targetContact: {
                name: 'Juan Pérez',
                role: 'Chief Technology Officer',
                email: 'juan.perez@techcorp.com'
            },
            bridgeContact: {
                name: 'Ana García',
                role: 'VP of Sales at Global Solutions',
                relationshipStrength: 92
            },
            aiScore: 95,
            reasoning: 'Ana has a strong relationship with Juan from their time at Tech Summit 2024. Both work in enterprise tech sales.',
            status: 'Suggested',
            createdDate: '2024-12-08'
        },
        {
            id: '2',
            type: 'Outbound',
            targetCompany: 'InnovateX',
            targetCompanyId: '3',
            targetContact: {
                name: 'Carlos Ruiz',
                role: 'Engineering Director',
                email: 'carlos.ruiz@innovatex.com'
            },
            aiScore: 82,
            reasoning: 'InnovateX recently announced Series B funding. Carlos is actively hiring for engineering roles, indicating growth phase.',
            status: 'In Progress',
            createdDate: '2024-12-05'
        },
        {
            id: '3',
            type: 'Intro',
            targetCompany: 'Alpha Logistics',
            targetCompanyId: '4',
            targetContact: {
                name: 'María López',
                role: 'Product Manager',
                email: 'maria.lopez@alphalog.com'
            },
            bridgeContact: {
                name: 'David Martínez',
                role: 'Senior Developer at Beta Systems',
                relationshipStrength: 78
            },
            aiScore: 88,
            reasoning: 'David and María worked together at a previous company. María is now leading product initiatives at Alpha Logistics.',
            status: 'Requested',
            createdDate: '2024-12-07'
        },
        {
            id: '4',
            type: 'Outbound',
            targetCompany: 'Beta Systems',
            targetCompanyId: '5',
            targetContact: {
                name: 'Laura Fernández',
                role: 'Head of Marketing',
                email: 'laura.fernandez@betasys.net'
            },
            aiScore: 71,
            reasoning: 'Beta Systems is expanding into new markets. Laura recently posted about looking for partnership opportunities.',
            status: 'Suggested',
            createdDate: '2024-12-06'
        },
        {
            id: '5',
            type: 'Intro',
            targetCompany: 'Global Solutions',
            targetCompanyId: '2',
            targetContact: {
                name: 'Pedro Sánchez',
                role: 'CEO',
                email: 'pedro.sanchez@globalsolutions.io'
            },
            bridgeContact: {
                name: 'Juan Pérez',
                role: 'CTO at TechCorp SA',
                relationshipStrength: 85
            },
            aiScore: 92,
            reasoning: 'Juan and Pedro are both in the enterprise software space and have mutual connections from industry events.',
            status: 'Won',
            createdDate: '2024-11-28'
        },
    ]

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

    const handleRequestIntro = (opportunityId: string) => {
        // TODO: Implement intro request
        console.log('Request intro for:', opportunityId)
    }

    const handleGenerateOutbound = (opportunityId: string) => {
        // TODO: Implement outbound generation
        console.log('Generate outbound for:', opportunityId)
    }

    const handleRefreshAI = () => {
        // TODO: Trigger AI analysis refresh
        console.log('Refreshing AI analysis...')
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
            case 'Suggested':
                return 'secondary'
            case 'Requested':
                return 'outline'
            case 'In Progress':
                return 'default'
            case 'Won':
                return 'success'
            case 'Lost':
                return 'destructive'
            default:
                return 'secondary'
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Pipeline de Oportunidades</h2>
                    <p className="text-gray-600 mt-1">
                        Gestiona intros cálidas y outbound generados por IA.
                    </p>
                </div>
                <div className="flex gap-3">
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

            {/* Filters and Search */}
            <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por empresa o contacto..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Type Filter */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2"
                        >
                            <option value="all">Todos los tipos</option>
                            <option value="Intro">Intros</option>
                            <option value="Outbound">Outbound</option>
                        </select>

                        {/* Status Filter */}
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="Suggested">Sugerido</option>
                            <option value="Requested">Pedido</option>
                            <option value="In Progress">En Progreso</option>
                            <option value="Won">Ganado</option>
                            <option value="Lost">Perdido</option>
                        </select>

                        {/* Score Filter */}
                        <select
                            value={filterScore}
                            onChange={(e) => setFilterScore(e.target.value)}
                            className="h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF5A00] focus:ring-offset-2"
                        >
                            <option value="all">Todos los scores</option>
                            <option value="high">Alto (≥90)</option>
                            <option value="medium">Medio (70-89)</option>
                            <option value="low">Bajo (&lt;70)</option>
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
                            {filteredOpportunities.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                        No se encontraron oportunidades con los filtros aplicados.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOpportunities.map((opp) => (
                                    <TableRow key={opp.id} className="hover:bg-white/60 transition-colors">
                                        <TableCell>
                                            <Badge className={`${getTypeBadgeClass(opp.type)} border-0`}>
                                                {opp.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900">
                                            {opp.targetCompany}
                                        </TableCell>
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
                                                            <div
                                                                className="h-full bg-[#FF5A00]"
                                                                style={{ width: `${opp.bridgeContact.relationshipStrength}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-600">{opp.bridgeContact.relationshipStrength}</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-gray-900">{opp.aiScore}</span>
                                                    <span className="text-xs text-gray-600">{getScoreLabel(opp.aiScore)}</span>
                                                </div>
                                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${getScoreColor(opp.aiScore)} transition-all`}
                                                        style={{ width: `${opp.aiScore}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[250px]">
                                            <p className="text-sm text-gray-600 line-clamp-2">{opp.reasoning}</p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={getStatusBadgeVariant(opp.status)}
                                                className={opp.status === 'Won' ? 'bg-[#FF5A00] text-white' : ''}
                                            >
                                                {opp.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {opp.type === 'Intro' && opp.status === 'Suggested' && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleRequestIntro(opp.id)}
                                                        className="h-8"
                                                    >
                                                        <Send className="h-3 w-3 mr-1" />
                                                        Pedir Intro
                                                    </Button>
                                                )}
                                                {opp.type === 'Outbound' && opp.status === 'Suggested' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleGenerateOutbound(opp.id)}
                                                        className="h-8"
                                                    >
                                                        <MessageSquare className="h-3 w-3 mr-1" />
                                                        Generar
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewDetails(opp)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Eye className="h-4 w-4" />
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

            {/* Detail Modal */}
            {isDetailModalOpen && selectedOpportunity && (
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
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="text-gray-500"
                                >
                                    ✕
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {/* AI Score */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-2">AI Score</h4>
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl font-bold text-gray-900">{selectedOpportunity.aiScore}</div>
                                        <div className="flex-1">
                                            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${getScoreColor(selectedOpportunity.aiScore)}`}
                                                    style={{ width: `${selectedOpportunity.aiScore}%` }}
                                                />
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
                                                    <div
                                                        className="h-full bg-[#FF5A00]"
                                                        style={{ width: `${selectedOpportunity.bridgeContact.relationshipStrength}%` }}
                                                    />
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
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsDetailModalOpen(false)}
                                    >
                                        Cerrar
                                    </Button>
                                    {selectedOpportunity.type === 'Intro' && selectedOpportunity.status === 'Suggested' && (
                                        <Button variant="primary" onClick={() => handleRequestIntro(selectedOpportunity.id)}>
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
            )}
        </div>
    )
}
