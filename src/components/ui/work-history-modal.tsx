"use client"

import { useState } from "react"
import { X, Plus, Trash2 } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"
import type { WorkHistoryFormData } from "@/types/network"

type WorkHistoryModalProps = {
    workHistory?: WorkHistoryFormData
    onSave: (data: WorkHistoryFormData) => void
    onClose: () => void
}

const SENIORITY_OPTIONS = [
    { value: 'C-Level', label: 'C-Level' },
    { value: 'VP', label: 'VP' },
    { value: 'Director', label: 'Director' },
    { value: 'Manager', label: 'Manager' },
    { value: 'IC', label: 'Individual Contributor' }
]

export function WorkHistoryModal({ workHistory, onSave, onClose }: WorkHistoryModalProps) {
    const [formData, setFormData] = useState<WorkHistoryFormData>(workHistory || {
        company_name: "",
        company_domain: "",
        company_industry: "",
        title: "",
        seniority: undefined,
        start_date: "",
        end_date: "",
        is_current: false,
        description: "",
        achievements: []
    })

    const [newAchievement, setNewAchievement] = useState("")

    const handleAddAchievement = () => {
        if (newAchievement.trim() && formData.achievements.length < 10) {
            setFormData({
                ...formData,
                achievements: [...formData.achievements, newAchievement.trim()]
            })
            setNewAchievement("")
        }
    }

    const handleRemoveAchievement = (index: number) => {
        setFormData({
            ...formData,
            achievements: formData.achievements.filter((_, i) => i !== index)
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Validation
        if (!formData.company_name.trim()) {
            alert("El nombre de la empresa es requerido")
            return
        }
        if (!formData.title.trim()) {
            alert("El cargo es requerido")
            return
        }

        onSave(formData)
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {workHistory ? 'Editar' : 'Añadir'} Experiencia Laboral
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Completa los detalles de tu experiencia profesional
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
                                placeholder="Microsoft"
                            />
                        </div>

                        {/* Company Domain & Industry */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Dominio (opcional)
                                </label>
                                <Input
                                    value={formData.company_domain || ""}
                                    onChange={(e) => setFormData({ ...formData, company_domain: e.target.value })}
                                    placeholder="microsoft.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Industria (opcional)
                                </label>
                                <Input
                                    value={formData.company_industry || ""}
                                    onChange={(e) => setFormData({ ...formData, company_industry: e.target.value })}
                                    placeholder="Technology"
                                />
                            </div>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cargo <span className="text-red-500">*</span>
                            </label>
                            <Input
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Product Manager"
                            />
                        </div>

                        {/* Seniority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nivel de Seniority
                            </label>
                            <select
                                value={formData.seniority || ""}
                                onChange={(e) => setFormData({ ...formData, seniority: e.target.value as any })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
                            >
                                <option value="">Seleccionar...</option>
                                {SENIORITY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Inicio
                                </label>
                                <Input
                                    type="date"
                                    value={formData.start_date || ""}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Fin
                                </label>
                                <Input
                                    type="date"
                                    value={formData.end_date || ""}
                                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                    disabled={formData.is_current}
                                />
                            </div>
                        </div>

                        {/* Is Current */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_current"
                                checked={formData.is_current}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    is_current: e.target.checked,
                                    end_date: e.target.checked ? "" : formData.end_date
                                })}
                                className="h-4 w-4 text-[#FF5A00] focus:ring-[#FF5A00] border-gray-300 rounded"
                            />
                            <label htmlFor="is_current" className="text-sm font-medium text-gray-700">
                                Trabajo actual
                            </label>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Descripción (opcional)
                            </label>
                            <textarea
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe tus responsabilidades..."
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5A00]"
                            />
                        </div>

                        {/* Achievements */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Logros (máx. 10)
                            </label>
                            <div className="flex gap-2 mb-3">
                                <Input
                                    value={newAchievement}
                                    onChange={(e) => setNewAchievement(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
                                    placeholder="Lanzé 3 productos principales..."
                                />
                                <Button
                                    type="button"
                                    onClick={handleAddAchievement}
                                    disabled={formData.achievements.length >= 10}
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            <ul className="space-y-2">
                                {formData.achievements.map((achievement, i) => (
                                    <li key={i} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                                        <span className="text-sm text-gray-700 flex-1">• {achievement}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveAchievement(i)}
                                            className="text-gray-400 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200">
                    <Button variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button onClick={handleSubmit}>
                        {workHistory ? 'Guardar Cambios' : 'Añadir Experiencia'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
