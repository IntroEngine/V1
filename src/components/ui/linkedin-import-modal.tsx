"use client"

import { useState, useRef } from "react"
import { X, Upload, FileJson, FileText, CheckCircle, AlertCircle, FileSpreadsheet } from "lucide-react"
import { Button } from "./button"
import { parseCSVFile, autoDetectMapping, validateCSVData, transformCSVRowToContact } from "@/lib/csv-parser"

type LinkedInImportModalProps = {
    onImport: (data: any) => Promise<void>
    onClose: () => void
}

export function LinkedInImportModal({ onImport, onClose }: LinkedInImportModalProps) {
    const [mode, setMode] = useState<'csv' | 'json'>('csv')
    const [isLoading, setIsLoading] = useState(false)
    const [importStep, setImportStep] = useState<"upload" | "processing" | "success" | "error">("upload")
    const [jsonContent, setJsonContent] = useState("")
    const [csvFile, setCsvFile] = useState<File | null>(null)
    const [csvStats, setCsvStats] = useState<{ total: number } | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleJsonImport = async () => {
        if (!jsonContent.trim()) return

        setIsLoading(true)
        setImportStep("processing")

        try {
            const parsed = JSON.parse(jsonContent)
            await onImport(parsed)
            setImportStep("success")
            setTimeout(() => onClose(), 1500)
        } catch (error) {
            console.error(error)
            setImportStep("error")
        } finally {
            setIsLoading(false)
        }
    }

    const handleCsvFileSelect = async (file: File) => {
        if (!file.name.endsWith('.csv')) return
        setCsvFile(file)

        try {
            const parsed = await parseCSVFile(file)
            setCsvStats({ total: parsed.totalRows })
        } catch (error) {
            console.error(error)
            setCsvFile(null)
            // Could show a toast here
        }
    }

    const handleCsvImport = async () => {
        if (!csvFile) return

        setIsLoading(true)
        setImportStep("processing")

        try {
            const parsed = await parseCSVFile(csvFile) // Parse again to be safe or store parsed result
            const mapping = autoDetectMapping(parsed.headers)
            const contacts = parsed.rows.map(row => transformCSVRowToContact(row, mapping))

            await onImport(contacts)
            setImportStep("success")
            setTimeout(() => onClose(), 1500)
        } catch (error) {
            console.error(error)
            setImportStep("error")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Importar desde LinkedIn</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Sube tus datos exportados
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Tabs */}
                {importStep === 'upload' && (
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${mode === 'csv' ? 'border-[#FF5A00] text-[#FF5A00]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setMode('csv')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FileSpreadsheet className="h-4 w-4" />
                                Subir CSV
                            </div>
                        </button>
                        <button
                            className={`flex-1 py-3 text-sm font-medium border-b-2 transition-colors ${mode === 'json' ? 'border-[#FF5A00] text-[#FF5A00]' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setMode('json')}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <FileJson className="h-4 w-4" />
                                Pegar JSON
                            </div>
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="p-6">
                    {importStep === "upload" && (
                        <div className="space-y-4">
                            {mode === 'csv' ? (
                                <div
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#FF5A00] transition-colors cursor-pointer bg-gray-50/50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {csvFile ? (
                                        <div className="flex flex-col items-center">
                                            <FileText className="h-10 w-10 text-green-500 mb-2" />
                                            <p className="text-sm font-medium text-gray-900">{csvFile.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {csvStats?.total} contactos detectados
                                            </p>
                                            <Button size="sm" variant="ghost" className="mt-2 text-red-500 hover:text-red-700" onClick={(e) => {
                                                e.stopPropagation()
                                                setCsvFile(null)
                                                setCsvStats(null)
                                            }}>
                                                Eliminar
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm font-medium text-gray-900">
                                                Click para seleccionar archvio CSV
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Formato exportado de LinkedIn (Connections.csv)
                                            </p>
                                        </>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".csv"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) handleCsvFileSelect(file)
                                        }}
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Pegar contenido JSON
                                    </label>
                                    <textarea
                                        className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A00] focus:border-transparent resize-none text-xs font-mono"
                                        placeholder='[{ "firstName": "John", ... }]'
                                        value={jsonContent}
                                        onChange={(e) => setJsonContent(e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                                <p className="font-medium mb-1">¿Cómo obtener tus datos?</p>
                                <p>Configuración &gt; Privacidad de datos &gt; Obtener copia de tus datos &gt; Conexiones</p>
                            </div>
                        </div>
                    )}

                    {importStep === "processing" && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <Upload className="h-12 w-12 text-[#FF5A00] animate-bounce mb-4" />
                            <p className="text-lg font-medium text-gray-900">Procesando conexiones...</p>
                            <p className="text-sm text-gray-500">Esto puede tardar unos segundos</p>
                        </div>
                    )}

                    {importStep === "success" && (
                        <div className="flex flex-col items-center justify-center py-8">
                            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                            <p className="text-lg font-medium text-green-700">¡Importación Completada!</p>
                            <p className="text-sm text-gray-500">Tu red se ha actualizado correctamente</p>
                        </div>
                    )}

                    {importStep === "error" && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                            <p className="text-lg font-medium text-red-700">Error en la importación</p>
                            <p className="text-sm text-gray-500 mb-4">
                                El formato del archivo no es válido o hubo un error al procesarlo.
                            </p>
                            <Button variant="outline" onClick={() => setImportStep("upload")}>
                                Intentar de nuevo
                            </Button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {importStep === "upload" && (
                    <div className="flex items-center justify-between p-6 border-t border-gray-200">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={mode === 'csv' ? handleCsvImport : handleJsonImport}
                            disabled={isLoading || (mode === 'csv' ? !csvFile : !jsonContent.trim())}
                        >
                            <FileSpreadsheet className="h-4 w-4 mr-2" />
                            Procesar Datos
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
