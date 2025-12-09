import Papa from 'papaparse'

export type CSVRow = Record<string, string>

export interface ParsedCSV {
    headers: string[]
    rows: CSVRow[]
    totalRows: number
}

export interface ValidationError {
    row: number
    field: string
    message: string
}

export interface ContactCSVRow {
    name: string
    email?: string
    company?: string
    title?: string
    phone?: string
    linkedin?: string
    notes?: string
}

/**
 * Parse CSV file to structured data
 */
export async function parseCSVFile(file: File): Promise<ParsedCSV> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const headers = results.meta.fields || []
                const rows = results.data as CSVRow[]

                resolve({
                    headers,
                    rows,
                    totalRows: rows.length
                })
            },
            error: (error) => {
                reject(new Error(`CSV parsing failed: ${error.message}`))
            }
        })
    })
}

/**
 * Auto-detect column mapping based on common header names
 */
export function autoDetectMapping(headers: string[]): Record<string, string> {
    const mapping: Record<string, string> = {}

    const patterns = {
        name: ['name', 'full name', 'fullname', 'nombre', 'contact name', 'first name', 'last name'],
        email: ['email', 'e-mail', 'correo', 'mail', 'email address'],
        company: ['company', 'organization', 'empresa', 'org', 'organization name'],
        title: ['title', 'job title', 'position', 'role', 'cargo', 'puesto'],
        phone: ['phone', 'telephone', 'tel', 'teléfono', 'móvil', 'mobile'],
        linkedin: ['linkedin', 'linkedin url', 'linkedin profile'],
        notes: ['notes', 'description', 'notas', 'comentarios']
    }

    headers.forEach(header => {
        const normalized = header.toLowerCase().trim()

        for (const [field, patterns_list] of Object.entries(patterns)) {
            if (patterns_list.some(pattern => normalized.includes(pattern))) {
                mapping[header] = field
                break
            }
        }
    })

    return mapping
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate a single contact row - FLEXIBLE validation
 */
export function validateContactRow(
    row: CSVRow,
    mapping: Record<string, string>,
    rowIndex: number
): ValidationError[] {
    const errors: ValidationError[] = []

    // Get mapped email field
    const emailField = Object.entries(mapping).find(([_, field]) => field === 'email')?.[0]

    // Check if row has ANY non-empty value (not completely empty row)
    const hasAnyValue = Object.values(row).some(value => value?.trim())

    if (!hasAnyValue) {
        errors.push({
            row: rowIndex,
            field: 'row',
            message: 'Empty row'
        })
        return errors
    }

    // Email validation (if provided and mapped)
    if (emailField && row[emailField]?.trim()) {
        const email = row[emailField].trim()
        if (!isValidEmail(email)) {
            errors.push({
                row: rowIndex,
                field: 'email',
                message: `Invalid email format: ${email}`
            })
        }
    }

    return errors
}

/**
 * Transform CSV row to Contact object based on mapping
 */
export function transformCSVRowToContact(
    row: CSVRow,
    mapping: Record<string, string>
): ContactCSVRow {
    const contact: ContactCSVRow = {
        name: ''
    }

    // Try to build name from available fields
    const nameField = Object.entries(mapping).find(([_, field]) => field === 'name')?.[0]

    if (nameField && row[nameField]) {
        contact.name = row[nameField].trim()
    } else {
        // Fallback: use first non-empty column as name
        const firstValue = Object.values(row).find(v => v?.trim())
        contact.name = firstValue?.trim() || 'Unknown'
    }

    // Map other fields
    Object.entries(mapping).forEach(([csvHeader, field]) => {
        if (field !== 'name') {
            const value = row[csvHeader]?.trim()
            if (value) {
                contact[field as keyof ContactCSVRow] = value
            }
        }
    })

    return contact
}

/**
 * Validate entire CSV dataset
 */
export function validateCSVData(
    rows: CSVRow[],
    mapping: Record<string, string>
): ValidationError[] {
    const errors: ValidationError[] = []

    rows.forEach((row, index) => {
        const rowErrors = validateContactRow(row, mapping, index + 1)
        errors.push(...rowErrors)
    })

    return errors
}

/**
 * Check for duplicate emails in CSV
 */
export function findDuplicateEmails(
    rows: CSVRow[],
    mapping: Record<string, string>
): number[] {
    const emailField = Object.entries(mapping).find(([_, field]) => field === 'email')?.[0]
    if (!emailField) return []

    const emailMap = new Map<string, number[]>()

    rows.forEach((row, index) => {
        const email = row[emailField]?.trim().toLowerCase()
        if (email) {
            if (!emailMap.has(email)) {
                emailMap.set(email, [])
            }
            emailMap.get(email)!.push(index + 1)
        }
    })

    // Return row numbers with duplicate emails
    const duplicates: number[] = []
    emailMap.forEach((rowNumbers) => {
        if (rowNumbers.length > 1) {
            duplicates.push(...rowNumbers)
        }
    })

    return duplicates
}
