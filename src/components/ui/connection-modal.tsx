"use client"

import { useState } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { Badge } from "./badge"
import type { ConnectionFormData, KeyContact } from "@/types/network"

type ConnectionModalProps = {
    connection?: ConnectionFormData
    onSave: (data: ConnectionFormData) => void
    onClose: () => void
}

const CONNECTION_TYPES = [
    { value: 'ex-colleague', label: 'Ex-colega' },
    { value: 'client', label: 'Cliente' },
    { value: 'vendor', label: 'Proveedor' },
    { value: 'investor', label: 'Inversor' },
    { value: 'other', label: 'Otro' }
]

export function ConnectionModal({ connection, onSave, onClose }: ConnectionModalProps) {
    const [formData, setFormData] = useState<ConnectionFormData>(connection || {
        company_name: "",
        company_domain: "",
        relationship_strength: 3,
        contact_count: 0,
        key_contacts: [],
        connection_type: undefined,
        notes: "",
        tags: [],
        last_interaction_date: ""
    })

    const [newTag, setNewTag] = useState("")
    const [isAddingContact, setIsAddingContact] = useState(false)
    const [newContact, setNewContact] = useState<KeyContact>({
        name: "",
        title: "",
        relationship: ""
    })

    const handleAddTag = () => {
        if (newTag.trim() && formData.tags.length < 10) {
            setFormData({
                ...formData,
                tags: [...formData.tags, newTag.trim()]
            })
            setNewTag("")
        }
    }

    const handleRemoveTag = (index: number) => {
        setFormData({
            ...formData,
            tags: formData.tags.filter((_, i) => i !== index)
        })
    }

    const handleAddContact = () => {
        if (newContact.name.trim() && formData.key_contacts.length < 20) {
            setFormData({
                ...formData,
                key_contacts: [...formData.key_contacts, newContact],
                contact_count: formData.key_contacts.length + 1
            })
            setNewContact({ name: "", title: "", relationship: "" })
            setIsAddingContact(false)
        }
    }

    const handleRemoveContact = (index: number) => {
        setFormData({
            ...formData,
            key_contacts: formData.key_contacts.filter((_, i) => i !== index),
            contact_count: Math.max(0, formData.contact_count - 1)
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.company_name.trim()) {
            alert("El nombre de la empresa es requerido")
            return
        }

        onSave(formData)
    }

    const getStrengthLabel = (strength: number) => {
        const labels = {
            5: 'Muy Fuerte',
            4: 'Fuerte',
            3: 'Media',
            2: 'Débil',
            1: 'Muy Débil'
        }
        return labels[strength as keyof typeof labels]
    }

    const getStrengthDescription = (strength: number) => {
        const descriptions = {
            5: 'Ex-colega cercano, amigo personal, contacto frecuente',
            4: 'Trabajamos juntos, contacto regular',
            3: 'Nos conocemos bien, contacto ocasional',
            2: 'Nos hemos visto una o dos veces',
            1: 'Solo conexión en LinkedIn'
        }
        return descriptions[strength as keyof typeof descriptions]
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {connection ? 'Editar' : 'Añadir'} Conexión
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Empresa donde tienes contactos
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="space-y-6">
                        {/* Company Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Empresa <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                value={formData.company_name}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                                placeholder="Amazon"
                            />
                        </div>

                        {/* Company Domain */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dominio (opcional)
                            </label>
                            <Input
                                value={formData.company_domain || ""}
                                onChange={(e) => setFormData({ ...formData, company_domain: e.target.value })}
                                placeholder="amazon.com"
                            />
                        </div>

                        {/* Relationship Strength */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fuerza de la Relación: {getStrengthLabel(formData.relationship_strength)} ({formData.relationship_strength}/5)
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={formData.relationship_strength}
                                onChange={(e) => setFormData({ ...formData, relationship_strength: parseInt(e.target.value) as any })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#FF5A00]"
                            />
                            <div className="flex justify-between text-xs text-gray-600 mt-2">
                                {[1, 2, 3, 4, 5].map(n => (
                                    <div
                                        key={n}
                                        className={`h-2 w-2 rounded-full ${n <= formData.relationship_strength ? 'bg-[#FF5A00]' : 'bg-gray-300'
                                            }`}
                                    />
                                ))}
                            </div>
                            <p className="text-xs text-gray-600 mt-2 italic">
                                {getStrengthDescription(formData.relationship_strength)}
                            </p>
                        </div>

                        {/* Connection Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tipo de Conexión
                            </label>
                            <select
                                value={formData.connection_type || ""}
                                onChange={(e) => setFormData({ ...formData, connection_type: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
                            >
                                <option value="">Seleccionar...</option>
                                {CONNECTION_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Contact Count */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Número de Contactos
                            </label>
                            <Input
                                type="number"
                                min="0"
                                max="1000"
                                value={formData.contact_count}
                                onChange={(e) => setFormData({ ...formData, contact_count: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        {/* Key Contacts */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Contactos Clave (opcional, máx. 20)
                                </label>
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={() => setIsAddingContact(true)}
                                    disabled={formData.key_contacts.length >= 20}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Añadir
                                </Button>
                            </div>

                            {isAddingContact && (
                                <div className="p-4 bg-gray-50 rounded-lg mb-3 space-y-3">
                                    <Input
                                        placeholder="Nombre"
                                        value={newContact.name}
                                        onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Cargo (opcional)"
                                        value={newContact.title || ""}
                                        onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Relación (opcional)"
                                        value={newContact.relationship || ""}
                                        onChange={(e) => setNewContact({ ...newContact, relationship: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <Button type="button" size="sm" onClick={handleAddContact}>
                                            Guardar
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setIsAddingContact(false)
                                                setNewContact({ name: "", title: "", relationship: "" })
                                            }}
                                        >
                                            Cancelar
                                        </Button>
                                    </div>
                                </div>
                            )}

                            <ul className="space-y-2">
                                {formData.key_contacts.map((contact, i) => (
                                    <li key={i} className="flex items-start justify-between p-3 bg-gray-50 rounded">
                                        <div>
                                            <p className="font-medium text-gray-900">{contact.name}</p>
                                            {contact.title && (
                                                <p className="text-sm text-gray-600">{contact.title}</p>
                                            )}
                                            {contact.relationship && (
                                                <p className="text-xs text-gray-500">{contact.relationship}</p>
                                            )}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveContact(i)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Last Interaction */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Última Interacción (opcional)
                            </label>
                            <Input
                                type="date"
                                value={formData.last_interaction_date || ""}
                                onChange={(e) => setFormData({ ...formData, last_interaction_date: e.target.value })}
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Notas (opcional)
                            </label>
                            <textarea
                                value={formData.notes || ""}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Trabajamos juntos en Microsoft 2018-2020..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tags (máx. 10)
                            </label>
                            <div className="flex gap-2 mb-3">
                                <Input
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    placeholder="engineering, product, sales..."
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddTag}
                                    disabled={formData.tags.length >= 10}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className="bg-gray-50 pr-1"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveTag(i)}
                                            className="ml-2 hover:text-gray-900"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                        {connection ? 'Guardar Cambios' : 'Añadir Conexión'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
