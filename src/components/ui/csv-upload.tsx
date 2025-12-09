"use client"

import { useState, useRef, DragEvent } from 'react'
import { Upload, X, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from './button'
import { parseCSVFile, autoDetectMapping, validateCSVData, findDuplicateEmails, transformCSVRowToContact, type ParsedCSV, type ValidationError } from '@/lib/csv-parser'
import { useToast } from '@/hooks/use-toast'

type CSVUploadProps = {
    onImport: (contacts: any[]) => Promise<void>
    onClose: () => void
}

export function CSVUploadModal({ onImport, onClose }: CSVUploadProps) {
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<ParsedCSV | null>(null)
    const [mapping, setMapping] = useState<Record<string, string>>({})
    const [errors, setErrors] = useState<ValidationError[]>([])
    const [duplicates, setDuplicates] = useState<number[]>([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [step, setStep] = useState<'upload' | 'preview' | 'importing'>('upload')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const toast = useToast()

    const handleFileSelect = async (selectedFile: File) => {
        if (!selectedFile.name.endsWith('.csv')) {
            toast.error('Por favor selecciona un archivo CSV')
            return
        }

        setFile(selectedFile)
        setIsProcessing(true)

        try {
            const parsed = await parseCSVFile(selectedFile)
            setParsedData(parsed)

            // Auto-detect mapping
            const detectedMapping = autoDetectMapping(parsed.headers)
            setMapping(detectedMapping)

            // Validate
            const validationErrors = validateCSVData(parsed.rows, detectedMapping)
            setErrors(validationErrors)

            // Find duplicates
            const dupes = findDuplicateEmails(parsed.rows, detectedMapping)
            setDuplicates(dupes)

            setStep('preview')
        } catch (error) {
            toast.error('Error al procesar el archivo CSV')
            console.error(error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) {
            handleFileSelect(droppedFile)
        }
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
    }

    const handleImport = async () => {
        if (!parsedData) return

        setStep('importing')
        setProgress(0)

        try {
            const contacts = parsedData.rows.map(row =>
                transformCSVRowToContact(row, mapping)
            )

            // Simulate progress (replace with actual batch import)
            const batchSize = 100
            for (let i = 0; i < contacts.length; i += batchSize) {
                const batch = contacts.slice(i, i + batchSize)
                await onImport(batch)
                setProgress(Math.min(100, ((i + batchSize) / contacts.length) * 100))
            }

            toast.success(`${contacts.length} contactos importados correctamente`)
            onClose()
        } catch (error) {
            toast.error('Error al importar contactos')
            console.error(error)
            setStep('preview')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Importar Contactos</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            Sube un archivo CSV con tus contactos
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    {step === 'upload' && (
                        <div>
                            {/* Drag & Drop Area */}
                            <div
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-[#FF5A00] transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-900 mb-2">
                                    Arrastra tu archivo CSV aquí
                                </p>
                                <p className="text-sm text-gray-600 mb-4">
                                    o haz click para seleccionar
                                </p>
                                <Button variant="secondary" size="sm">
                                    Seleccionar Archivo
                                </Button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleFileSelect(file)
                                }}
                                className="hidden"
                            />

                            {/* Format Info */}
                            <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                <h3 className="font-medium text-gray-900 mb-2">Formato esperado:</h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• <strong>Nombre</strong> (requerido)</li>
                                    <li>• Email, Empresa, Cargo, Teléfono, LinkedIn (opcionales)</li>
                                    <li>• Primera fila debe contener los encabezados</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {step === 'preview' && parsedData && (
                        <div>
                            {/* File Info */}
                            <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
                                <FileText className="h-8 w-8 text-[#FF5A00]" />
                                <div>
                                    <p className="font-medium text-gray-900">{file?.name}</p>
                                    <p className="text-sm text-gray-600">
                                        {parsedData.totalRows} contactos encontrados
                                    </p>
                                </div>
                            </div>

                            {/* Validation Summary */}
                            {errors.length > 0 && (
                                <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-red-900">
                                                {errors.length} errores encontrados
                                            </p>
                                            <p className="text-sm text-red-700 mt-1">
                                                Revisa los errores antes de importar
                                            </p>
                                            {/* Show first 10 errors */}
                                            <div className="mt-3 space-y-1 max-h-40 overflow-y-auto">
                                                {errors.slice(0, 10).map((error, i) => (
                                                    <div key={i} className="text-xs text-red-800 font-mono bg-red-100 px-2 py-1 rounded">
                                                        Fila {error.row}: {error.field} - {error.message}
                                                    </div>
                                                ))}
                                                {errors.length > 10 && (
                                                    <p className="text-xs text-red-700 mt-2">
                                                        ... y {errors.length - 10} errores más
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {duplicates.length > 0 && (
                                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-amber-900">
                                                {duplicates.length} emails duplicados
                                            </p>
                                            <p className="text-sm text-amber-700 mt-1">
                                                Se importará solo la primera ocurrencia
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {errors.length === 0 && duplicates.length === 0 && (
                                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <p className="font-medium text-green-900">
                                            Archivo válido y listo para importar
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Preview Table */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                {parsedData.headers.slice(0, 5).map((header, i) => (
                                                    <th key={i} className="px-4 py-3 text-left font-medium text-gray-900">
                                                        {header}
                                                        {mapping[header] && (
                                                            <span className="ml-2 text-xs text-[#FF5A00]">
                                                                → {mapping[header]}
                                                            </span>
                                                        )}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.rows.slice(0, 5).map((row, i) => (
                                                <tr key={i} className="border-t border-gray-200">
                                                    {parsedData.headers.slice(0, 5).map((header, j) => (
                                                        <td key={j} className="px-4 py-3 text-gray-600">
                                                            {row[header] || '-'}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="px-4 py-2 bg-gray-50 text-xs text-gray-600 border-t border-gray-200">
                                    Mostrando primeras 5 filas de {parsedData.totalRows}
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'importing' && (
                        <div className="text-center py-12">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#FF5A00]/10 rounded-full mb-4">
                                    <Upload className="h-8 w-8 text-[#FF5A00] animate-pulse" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Importando contactos...
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {Math.round(progress)}% completado
                                </p>
                            </div>

                            {/* Progress Bar */}
                            <div className="max-w-md mx-auto">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-[#FF5A00] transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {step !== 'importing' && (
                    <div className="flex items-center justify-between p-6 border-t border-gray-200">
                        <Button variant="outline" onClick={onClose}>
                            Cancelar
                        </Button>
                        {step === 'preview' && (
                            <Button
                                onClick={handleImport}
                                disabled={errors.length > 0 || isProcessing}
                            >
                                Importar {parsedData?.totalRows} Contactos
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
