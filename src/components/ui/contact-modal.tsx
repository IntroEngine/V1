"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

// Types matching the Page implementation
type Contact = {
    id?: string // Optional for new contacts
    firstName: string
    lastName: string
    email: string
    company: string
    role: string
    seniority: 'C-Level' | 'VP' | 'Director' | 'Manager' | 'IC'
    relationshipStrength: number // 0-100
    linkedinUrl?: string
    phone?: string
    notes?: string
}

interface ContactModalProps {
    isOpen: boolean
    onClose: () => void
    onSave: (contact: Contact) => Promise<void>
    contact?: Contact | null // Null/undefined means Create mode
}

export function ContactModal({ isOpen, onClose, onSave, contact }: ContactModalProps) {
    const isEditing = !!contact
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Form State
    const [formData, setFormData] = useState<Contact>({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        role: "",
        seniority: "IC",
        relationshipStrength: 50,
        linkedinUrl: "",
        phone: "",
        notes: ""
    })

    // Reset or Load data when modal opens/changes
    useEffect(() => {
        if (isOpen) {
            if (contact) {
                setFormData({
                    ...contact,
                    relationshipStrength: contact.relationshipStrength || 50, // Fallback
                    linkedinUrl: contact.linkedinUrl || "",
                    phone: contact.phone || "",
                    notes: contact.notes || ""
                })
            } else {
                // Reset for Create mode
                setFormData({
                    firstName: "",
                    lastName: "",
                    email: "",
                    company: "",
                    role: "",
                    seniority: "IC",
                    relationshipStrength: 50,
                    linkedinUrl: "",
                    phone: "",
                    notes: ""
                })
            }
            setErrors({})
        }
    }, [isOpen, contact])

    const validate = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
        if (!formData.email.trim()) {
            newErrors.email = "Email is required"
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format"
        }
        if (!formData.company.trim()) newErrors.company = "Company is required"
        if (!formData.role.trim()) newErrors.role = "Job title is required"

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return

        setIsLoading(true)
        try {
            await onSave(formData)
            onClose()
        } catch (error) {
            console.error("Error submitting form:", error)
            // Error handling is usually done in the parent via toast, but we catch here to stop loading state properly if needed
        } finally {
            setIsLoading(false)
        }
    }

    const getStrengthLabel = (val: number) => {
        if (val >= 80) return "Strong (Closely connected)"
        if (val >= 50) return "Medium (Regular interaction)"
        return "Weak (Acquaintance)"
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Contact" : "Add New Contact"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the details of your contact below."
                            : "Enter the details of the professional you want to add to your network."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                placeholder="Jane"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className={errors.firstName ? "border-red-500" : ""}
                            />
                            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className={errors.lastName ? "border-red-500" : ""}
                            />
                            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="jane.doe@company.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="jobTitle">Job Title</Label>
                            <Input
                                id="jobTitle"
                                placeholder="VP of Sales"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className={errors.role ? "border-red-500" : ""}
                            />
                            {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="company">Company</Label>
                            <Input
                                id="company"
                                placeholder="Acme Inc."
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                className={errors.company ? "border-red-500" : ""}
                            />
                            {errors.company && <p className="text-xs text-red-500">{errors.company}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="seniority">Seniority Level</Label>
                            <Select
                                value={formData.seniority}
                                onValueChange={(val: any) => setFormData({ ...formData, seniority: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="C-Level">C-Level (CEO, CTO, etc)</SelectItem>
                                    <SelectItem value="VP">VP / Head of</SelectItem>
                                    <SelectItem value="Director">Director</SelectItem>
                                    <SelectItem value="Manager">Manager</SelectItem>
                                    <SelectItem value="IC">Individual Contributor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn URL (Optional)</Label>
                            <Input
                                id="linkedin"
                                placeholder="https://linkedin.com/in/..."
                                value={formData.linkedinUrl}
                                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center">
                            <Label>Relationship Strength</Label>
                            <span className={`text-xs font-medium px-2 py-1 rounded bg-gray-100 ${formData.relationshipStrength >= 80 ? 'text-[#FF5A00] bg-orange-50' : 'text-gray-600'}`}>
                                {formData.relationshipStrength}/100 - {getStrengthLabel(formData.relationshipStrength)}
                            </span>
                        </div>
                        <Slider
                            value={[formData.relationshipStrength]}
                            onValueChange={(vals) => setFormData({ ...formData, relationshipStrength: vals[0] })}
                            max={100}
                            step={5}
                            className="w-full"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Textarea
                            id="notes"
                            placeholder="Met at TechCrunch Disrupt..."
                            className="resize-none h-20"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading} className="bg-[#FF5A00] hover:bg-orange-600 text-white">
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Save Changes" : "Create Contact"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
