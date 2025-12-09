"use client"

import { useState } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import { Badge } from "./badge"
import type { ProfileFormData } from "@/types/network"

type EditProfileModalProps = {
    profile: ProfileFormData
    onSave: (data: ProfileFormData) => void
    onClose: () => void
}

export function EditProfileModal({ profile, onSave, onClose }: EditProfileModalProps) {
    const [formData, setFormData] = useState<ProfileFormData>(profile)
    const [newIndustry, setNewIndustry] = useState("")
    const [newStrength, setNewStrength] = useState("")

    const handleAddIndustry = () => {
        if (newIndustry.trim() && formData.industries_expertise.length < 10) {
            setFormData({
                ...formData,
                industries_expertise: [...formData.industries_expertise, newIndustry.trim()]
            })
            setNewIndustry("")
        }
    }

    const handleRemoveIndustry = (index: number) => {
        setFormData({
            ...formData,
            industries_expertise: formData.industries_expertise.filter((_, i) => i !== index)
        })
    }

    const handleAddStrength = () => {
        if (newStrength.trim() && formData.strengths_tags.length < 15) {
            setFormData({
                ...formData,
                strengths_tags: [...formData.strengths_tags, newStrength.trim()]
            })
            setNewStrength("")
        }
    }

    const handleRemoveStrength = (index: number) => {
        setFormData({
            ...formData,
            strengths_tags: formData.strengths_tags.filter((_, i) => i !== index)
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Editar Perfil Profesional</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Actualiza tu información profesional
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="space-y-6">
                        {/* Current Company */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Empresa Actual
                            </label>
                            <Input
                                value={formData.current_company || ""}
                                onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                                placeholder="TechCorp SA"
                            />
                        </div>

                        {/* Current Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cargo Actual
                            </label>
                            <Input
                                value={formData.current_title || ""}
                                onChange={(e) => setFormData({ ...formData, current_title: e.target.value })}
                                placeholder="VP of Product"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ubicación
                            </label>
                            <Input
                                value={formData.current_location || ""}
                                onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                                placeholder="Madrid, Spain"
                            />
                        </div>

                        {/* Industries */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Industrias de Expertise (máx. 10)
                            </label>
                            <div className="flex gap-2 mb-3">
                                <Input
                                    value={newIndustry}
                                    onChange={(e) => setNewIndustry(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddIndustry())}
                                    placeholder="SaaS, B2B, Enterprise..."
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddIndustry}
                                    disabled={formData.industries_expertise.length >= 10}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.industries_expertise.map((industry, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className="bg-blue-50 text-blue-700 border-blue-200 pr-1"
                                    >
                                        {industry}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveIndustry(i)}
                                            className="ml-2 hover:text-blue-900"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Strengths */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fortalezas (máx. 15)
                            </label>
                            <div className="flex gap-2 mb-3">
                                <Input
                                    value={newStrength}
                                    onChange={(e) => setNewStrength(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddStrength())}
                                    placeholder="Product, Sales, Strategy..."
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddStrength}
                                    disabled={formData.strengths_tags.length >= 15}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.strengths_tags.map((strength, i) => (
                                    <Badge
                                        key={i}
                                        variant="outline"
                                        className="bg-purple-50 text-purple-700 border-purple-200 pr-1"
                                    >
                                        {strength}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveStrength(i)}
                                            className="ml-2 hover:text-purple-900"
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
                        Guardar Cambios
                    </Button>
                </div>
            </div>
        </div>
    )
}
