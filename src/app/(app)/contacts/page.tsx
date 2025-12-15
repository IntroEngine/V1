"use client"

import { useState, useEffect } from "react"
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
    Users,
    Plus,
    RefreshCw,
    Search,
    Edit,
    Trash2,
    Mail,
    Building2,
    Zap,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Upload
} from "lucide-react"
import { CSVUploadModal } from "@/components/ui/csv-upload"
import { ContactModal } from "@/components/ui/contact-modal"
import { useToast } from "@/hooks/use-toast"

// Types
type Contact = {
    id: string
    firstName: string
    lastName: string
    email: string
    company: string
    companyId: string
    role: string
    seniority: 'C-Level' | 'VP' | 'Director' | 'Manager' | 'IC'
    relationshipStrength: number // 0-100
    introPotential: number // 0-100
    lastContactDate: string
    phone?: string
    linkedinUrl?: string
    hubspotSynced: boolean
    hubspotId?: string
    notes?: string
}

export default function ContactsPage() {
    const toast = useToast()

    // State
    const [searchQuery, setSearchQuery] = useState("")
    const [filterCompany, setFilterCompany] = useState<string>("all")
    const [filterSeniority, setFilterSeniority] = useState<string>("all")
    const [filterRelationship, setFilterRelationship] = useState<string>("all")
    const [filterHubspot, setFilterHubspot] = useState<string>("all")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isCSVUploadOpen, setIsCSVUploadOpen] = useState(false)
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null) // If null -> Create, if set -> Edit

    // State
    const [contacts, setContacts] = useState<Contact[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Derived Stats
    const stats = {
        totalContacts: contacts.length,
        strongRelationships: contacts.filter(c => c.relationshipStrength >= 80).length,
        introOpportunities: contacts.filter(c => c.introPotential >= 70).length,
        hubspotSynced: contacts.filter(c => c.hubspotSynced).length
    }

    // Fetch Contacts
    const fetchContacts = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/contacts')
            if (!res.ok) {
                const errText = await res.text();
                console.error(`Fetch error: ${res.status} ${res.statusText}`, errText);
                throw new Error(`Failed to fetch: ${res.status}`)
            }
            const data = await res.json()
            setContacts(data)
        } catch (error) {
            console.error("ContactsPage Error:", error)
            // toast.error("Error al cargar contactos") // Optional: Suppress on first load if empty
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchContacts()
    }, [])

    // Filter contacts
    const filteredContacts = contacts.filter(contact => {
        const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase()
        const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
            contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.company.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCompany = filterCompany === 'all' || contact.company === filterCompany
        const matchesSeniority = filterSeniority === 'all' || contact.seniority === filterSeniority
        const matchesRelationship = filterRelationship === 'all' ||
            (filterRelationship === 'strong' && contact.relationshipStrength >= 80) ||
            (filterRelationship === 'medium' && contact.relationshipStrength >= 50 && contact.relationshipStrength < 80) ||
            (filterRelationship === 'weak' && contact.relationshipStrength < 50)
        const matchesHubspot = filterHubspot === 'all' ||
            (filterHubspot === 'synced' && contact.hubspotSynced) ||
            (filterHubspot === 'not-synced' && !contact.hubspotSynced)

        return matchesSearch && matchesCompany && matchesSeniority && matchesRelationship && matchesHubspot
    })

    // Handlers
    const handleCreateContact = () => {
        setSelectedContact(null)
        setIsCreateModalOpen(true)
    }

    const handleEditContact = (contact: Contact) => {
        setSelectedContact(contact)
        setIsCreateModalOpen(true) // Reusing the same modal/state variable logic
    }

    const handleSaveContact = async (contactData: Partial<Contact>) => {
        try {
            const method = selectedContact ? 'PUT' : 'POST'
            const body = {
                ...contactData,
                id: selectedContact?.id
            }

            const res = await fetch('/api/contacts', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })

            if (!res.ok) throw new Error('Failed to save contact')

            toast.success(selectedContact ? "Contacto actualizado" : "Contacto creado")
            setIsCreateModalOpen(false)
            fetchContacts()
        } catch (error) {
            console.error(error)
            toast.error("Error al guardar el contacto")
            throw error
        }
    }

    const handleDeleteContact = async (contactId: string) => {
        if (!confirm("¿Está seguro de eliminar este contacto?")) return

        try {
            const res = await fetch(`/api/contacts?id=${contactId}`, { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')

            toast.success("Contacto eliminado")
            fetchContacts()
        } catch (error) {
            console.error(error)
            toast.error("Error al eliminar contacto")
        }
    }

    const handleSyncHubspot = () => {
        // TODO: Trigger HubSpot sync
        console.log('Syncing with HubSpot...')
        toast.info("Iniciando sincronización con HubSpot...")
    }

    const handleCSVImport = async (contacts: any[]) => {
        try {
            console.log('Importing contacts:', contacts)
            const res = await fetch('/api/contacts/bulk-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contacts })
            })

            if (!res.ok) {
                throw new Error('Failed to import')
            }

            const result = await res.json()
            toast.success(`${contacts.length} contactos procesados correctamente`)

            fetchContacts()
        } catch (error) {
            console.error(error)
            toast.error('Error al importar contactos')
            throw error
        }
    }

    const handleDeleteAll = async () => {
        if (!confirm('¿Estás SEGURO de que quieres eliminar TODOS tus contactos? Esta acción no se puede deshacer.')) {
            return
        }

        try {
            setIsLoading(true)
            const res = await fetch('/api/contacts?all=true', { method: 'DELETE' })
            if (!res.ok) throw new Error('Failed to delete')

            toast.success('Todos los contactos han sido eliminados')
            setContacts([])
        } catch (error) {
            console.error(error)
            toast.error('Error al eliminar contactos')
        } finally {
            setIsLoading(false)
        }
    }

    const getRelationshipColor = (strength: number) => {
        if (strength >= 80) return 'bg-[#FF5A00]'
        if (strength >= 50) return 'bg-yellow-500'
        return 'bg-gray-400'
    }

    const getRelationshipLabel = (strength: number) => {
        if (strength >= 80) return 'Fuerte'
        if (strength >= 50) return 'Media'
        return 'Débil'
    }

    const getSeniorityBadgeColor = (seniority: Contact['seniority']) => {
        switch (seniority) {
            case 'C-Level':
                return 'bg-purple-100 text-purple-800 border-purple-300'
            case 'VP':
                return 'bg-blue-100 text-blue-800 border-blue-300'
            case 'Director':
                return 'bg-green-100 text-green-800 border-green-300'
            case 'Manager':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300'
            case 'IC':
                return 'bg-gray-100 text-gray-800 border-gray-300'
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Contactos</h2>
                    <p className="text-gray-600 mt-1">
                        Administra tu red de contactos y relaciones clave.
                    </p>
                </div>
                <div className="flex gap-3">
                    {contacts.length > 0 && (
                        <Button variant="outline" size="sm" onClick={handleDeleteAll} className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar Todo
                        </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setIsCSVUploadOpen(true)}>
                        <Upload className="h-4 w-4 mr-2" />
                        Importar CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSyncHubspot}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sincronizar HubSpot
                    </Button>
                    <Button size="sm" onClick={handleCreateContact}>
                        <Plus className="h-4 w-4 mr-2" />
                        Añadir Contacto
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Total Contactos</CardTitle>
                        <Users className="h-4 w-4 text-gray-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.totalContacts}</div>
                        <p className="text-xs text-gray-600 mt-1">En tu red</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Relaciones Fuertes</CardTitle>
                        <Zap className="h-4 w-4 text-[#FF5A00]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.strongRelationships}</div>
                        <p className="text-xs text-gray-600 mt-1">Score ≥ 80</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Potencial de Intros</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.introOpportunities}</div>
                        <p className="text-xs text-gray-600 mt-1">Oportunidades activas</p>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 bg-white/40 backdrop-blur-sm hover:bg-white/60 transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-900">Sincronizados</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats.hubspotSynced}</div>
                        <p className="text-xs text-gray-600 mt-1">Con HubSpot</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Buscar por nombre, email o empresa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-2">
                            <select
                                value={filterSeniority}
                                onChange={(e) => setFilterSeniority(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">Todos los niveles</option>
                                <option value="C-Level">C-Level</option>
                                <option value="VP">VP</option>
                                <option value="Director">Director</option>
                                <option value="Manager">Manager</option>
                                <option value="IC">IC</option>
                            </select>

                            <select
                                value={filterRelationship}
                                onChange={(e) => setFilterRelationship(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">Todas las relaciones</option>
                                <option value="strong">Fuertes (≥80)</option>
                                <option value="medium">Medias (50-79)</option>
                                <option value="weak">Débiles (&lt;50)</option>
                            </select>

                            <select
                                value={filterHubspot}
                                onChange={(e) => setFilterHubspot(e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                            >
                                <option value="all">Todos</option>
                                <option value="synced">Sincronizados</option>
                                <option value="not-synced">No sincronizados</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contacts Table */}
            <Card className="border-gray-200 bg-white/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-gray-900">
                        Contactos ({filteredContacts.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-gray-900">Nombre</TableHead>
                                <TableHead className="text-gray-900">Email</TableHead>
                                <TableHead className="text-gray-900">Empresa</TableHead>
                                <TableHead className="text-gray-900">Cargo</TableHead>
                                <TableHead className="text-gray-900">Nivel</TableHead>
                                <TableHead className="text-gray-900">Relación</TableHead>
                                <TableHead className="text-gray-900">Intro Potential</TableHead>
                                <TableHead className="text-gray-900">HubSpot</TableHead>
                                <TableHead className="text-right text-gray-900">Acciones</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center h-24 text-gray-500">
                                        Cargando contactos...
                                    </TableCell>
                                </TableRow>
                            ) : filteredContacts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center h-24 text-gray-500">
                                        No se encontraron contactos.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredContacts.map((contact) => (
                                    <TableRow key={contact.id} className="hover:bg-white/60 transition-colors">
                                        <TableCell className="font-medium text-gray-900">
                                            {contact.firstName} {contact.lastName}
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-3 w-3 text-gray-400" />
                                                {contact.email}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-3 w-3 text-gray-400" />
                                                {contact.company}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-600 text-sm">
                                            {contact.role}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`${getSeniorityBadgeColor(contact.seniority)} font-normal`}>
                                                {contact.seniority}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${getRelationshipColor(contact.relationshipStrength)}`} />
                                                <span className="text-sm text-gray-600">
                                                    {getRelationshipLabel(contact.relationshipStrength)} ({contact.relationshipStrength})
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className="bg-[#FF5A00] h-1.5 rounded-full"
                                                        style={{ width: `${contact.introPotential}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-gray-600">{contact.introPotential}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {contact.hubspotSynced ? (
                                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-gray-400" />
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditContact(contact)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteContact(contact.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-600" />
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

            {/* CSV Upload Modal */}
            {isCSVUploadOpen && (
                <CSVUploadModal
                    onImport={handleCSVImport}
                    onClose={() => setIsCSVUploadOpen(false)}
                />
            )}

            {/* Create / Edit Contact Modal */}
            <ContactModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleSaveContact}
                contact={selectedContact}
            />
        </div>
    )
}
