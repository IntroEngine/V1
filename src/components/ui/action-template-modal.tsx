"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Mail, Loader2, Check } from "lucide-react"
import { generateActionTemplate } from "@/app/actions/template-actions"
import { useToast } from "@/components/ui/use-toast"

interface ActionTemplateModalProps {
    isOpen: boolean
    onClose: () => void
    opportunity: any // Typed loosely for now, improve later
}

export function ActionTemplateModal({ isOpen, onClose, opportunity }: ActionTemplateModalProps) {
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [content, setContent] = useState("")
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (isOpen && opportunity) {
            handleGenerate()
        }
    }, [isOpen, opportunity])

    const handleGenerate = async () => {
        setLoading(true)
        setContent("")
        try {
            const res = await generateActionTemplate(opportunity.id)
            if (res.error) {
                toast({ title: "Error", description: res.error, variant: "destructive" })
                onClose()
            } else {
                setContent(res.content || "")
            }
        } catch (e) {
            toast({ title: "Error", description: "Failed to generate template", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast({ title: "Copiado", description: "Texto copiado al portapapeles" })
    }

    const handleOpenMail = () => {
        // extract subject if present
        let subject = ""
        let body = content

        const subjectMatch = content.match(/Asunto: (.*)/)
        if (subjectMatch) {
            subject = subjectMatch[1]
            body = content.replace(/Asunto: .*\n/, "").trim()
        }

        const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
        window.open(mailto, '_blank')
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {opportunity?.type === 'Intro' ? 'Solicitar Intro' : 'Generar Mensaje'}
                        <span className="text-xs font-normal text-muted-foreground px-2 py-0.5 bg-gray-100 rounded-full">Borrador IA</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {loading ? (
                        <div className="h-[300px] flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-[#FF5A00]" />
                            <p>Analizando contexto y generando borrador...</p>
                        </div>
                    ) : (
                        <Textarea
                            className="min-h-[300px] font-mono text-sm leading-relaxed p-4 bg-gray-50 border-gray-200 focus:border-[#FF5A00]"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    )}
                </div>

                <DialogFooter className="flex gap-2 sm:justify-between">
                    <Button variant="ghost" onClick={handleGenerate} disabled={loading}>
                        Regenerar
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleCopy} disabled={loading}>
                            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                            {copied ? "Copiado" : "Copiar"}
                        </Button>
                        <Button onClick={handleOpenMail} disabled={loading} className="bg-[#FF5A00] hover:bg-[#CC4800] text-white">
                            <Mail className="h-4 w-4 mr-2" />
                            Abrir Email
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
