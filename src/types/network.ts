// ============================================
// MI RED / MY NETWORK - TYPESCRIPT TYPES
// ============================================

// ============================================
// DATABASE TYPES
// ============================================

export interface UserProfile {
    id: string
    user_id: string
    current_company: string | null
    current_title: string | null
    current_location: string | null
    past_companies: PastCompany[]
    industries_expertise: string[]
    strengths_tags: string[]
    profile_completeness: number
    linkedin_imported: boolean
    last_sync_at: string | null
    created_at: string
    updated_at: string
}

export interface PastCompany {
    company: string
    title: string
    start: string // YYYY-MM or YYYY
    end: string | null // null if current
    industry?: string
    description?: string
}

export interface WorkHistory {
    id: string
    user_id: string
    company_name: string
    company_domain: string | null
    company_industry: string | null
    title: string
    seniority: 'C-Level' | 'VP' | 'Director' | 'Manager' | 'IC' | null
    start_date: string | null
    end_date: string | null
    is_current: boolean
    description: string | null
    achievements: string[]
    source: 'manual' | 'linkedin' | 'hubspot'
    created_at: string
    updated_at: string
}

export interface UserConnection {
    id: string
    user_id: string
    company_name: string
    company_domain: string | null
    relationship_strength: 1 | 2 | 3 | 4 | 5
    contact_count: number
    key_contacts: KeyContact[]
    connection_type: 'ex-colleague' | 'client' | 'vendor' | 'investor' | 'other' | null
    notes: string | null
    tags: string[]
    source: 'manual' | 'linkedin' | 'inferred'
    last_interaction_date: string | null
    created_at: string
    updated_at: string
}

export interface KeyContact {
    name: string
    title?: string
    relationship?: string
    linkedin_url?: string
    email?: string
    phone?: string
}

export interface InferredRelationship {
    id: string
    user_id: string
    target_company: string
    bridge_company: string | null
    inference_type: 'ALUMNI' | 'INDUSTRY' | 'GEOGRAPHY' | 'MUTUAL_CONNECTION'
    confidence_score: number
    reasoning: string
    supporting_data: Record<string, any>
    generated_at: string
    expires_at: string | null
    is_active: boolean
}

export interface LinkedInImport {
    id: string
    user_id: string
    raw_positions: any[]
    raw_connections: any[]
    processed_companies: string[]
    processed_contacts_count: number
    status: 'pending' | 'processing' | 'completed' | 'failed'
    processing_started_at: string | null
    processing_completed_at: string | null
    error_message: string | null
    file_name: string | null
    file_size: number | null
    import_type: 'positions' | 'connections' | 'full'
    created_at: string
}

// ============================================
// FORM TYPES
// ============================================

export interface ProfileFormData {
    current_company?: string
    current_title?: string
    current_location?: string
    industries_expertise: string[]
    strengths_tags: string[]
}

export interface WorkHistoryFormData {
    company_name: string
    company_domain?: string
    company_industry?: string
    title: string
    seniority?: 'C-Level' | 'VP' | 'Director' | 'Manager' | 'IC'
    start_date?: string
    end_date?: string
    is_current: boolean
    description?: string
    achievements: string[]
}

export interface ConnectionFormData {
    company_name: string
    company_domain?: string
    relationship_strength: 1 | 2 | 3 | 4 | 5
    contact_count: number
    key_contacts?: KeyContact[] // Changed to optional, keeping KeyContact as ConnectionKeyContact is not defined
    connection_type?: 'ex-colleague' | 'client' | 'vendor' | 'investor' | 'other'
    notes?: string
    tags: string[]
    last_interaction_date?: string
}

export interface IntroOpportunity {
    id: string
    target_company: string
    target_role?: string
    target_location?: string
    bridge_person?: string
    bridge_company?: string
    confidence_score: number
    reasoning: string
    type: 'ALUMNI' | 'INDUSTRY' | 'GEOGRAPHY' | 'MUTUAL_CONNECTION'
}

// ============================================
// API PAYLOAD TYPES
// ============================================

export interface NetworkGraphPayload {
    user_profile: UserProfile
    work_history: WorkHistory[]
    connections: UserConnection[]
    inferred_relationships: InferredRelationship[]

    // Computed fields for AI
    computed_metrics: NetworkMetrics
}

export interface NetworkMetrics {
    total_companies_worked: number
    total_connections: number
    strongest_industries: string[]
    network_strength_score: number // 0-100
    intro_opportunities_count: number
    direct_connections: number
    second_level_connections: number
    inferred_connections: number
}

export interface InferenceRequest {
    user_id: string
    target_companies?: string[] // Optional: specific companies to analyze
    min_confidence?: number // Minimum confidence score (0-100)
}

export interface InferenceResponse {
    inferred_count: number
    relationships: InferredRelationship[]
    processing_time_ms: number
}

// ============================================
// LINKEDIN IMPORT TYPES
// ============================================

export interface LinkedInPosition {
    company: string
    title: string
    start_date: string
    end_date: string | null
    location?: string
    description?: string
}

export interface LinkedInConnection {
    first_name: string
    last_name: string
    email?: string
    company?: string
    position?: string
    connected_on?: string
}

export interface LinkedInImportPreview {
    positions_count: number
    connections_count: number
    companies_identified: string[]
    target_company_matches: {
        company: string
        contact_count: number
    }[]
}

// ============================================
// COMPANY / PROSPECT TYPES
// ============================================

export interface Company {
    id: string
    name: string
    domain: string
    industry: string
    contactsCount: number
    opportunitiesCount: number
    score: number
    status: 'Active' | 'Inactive' | 'Prospect'
    hubspotSynced: boolean
    hubspotId?: string
    description?: string
}

export interface Opportunity {
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

export interface OpportunityStats {
    totalOpportunities: number
    introOpportunities: number
    outboundOpportunities: number
    successRate: number
}

// ============================================
// UI STATE TYPES
// ============================================

export interface NetworkPageState {
    profile: UserProfile | null
    workHistory: WorkHistory[]
    connections: UserConnection[]
    inferredRelationships: InferredRelationship[]
    isLoading: boolean
    error: string | null
}

export interface NetworkStats {
    total_companies_worked: number
    total_connections: number
    total_industries: number
    total_intro_opportunities: number
    profile_completeness: number
}

// ============================================
// RELATIONSHIP STRENGTH HELPERS
// ============================================

export const RELATIONSHIP_STRENGTH_LABELS: Record<1 | 2 | 3 | 4 | 5, string> = {
    5: 'Muy Fuerte',
    4: 'Fuerte',
    3: 'Media',
    2: 'Débil',
    1: 'Muy Débil'
}

export const RELATIONSHIP_STRENGTH_DESCRIPTIONS: Record<1 | 2 | 3 | 4 | 5, string> = {
    5: 'Ex-colega cercano, amigo personal, contacto frecuente',
    4: 'Trabajamos juntos, contacto regular',
    3: 'Nos conocemos bien, contacto ocasional',
    2: 'Nos hemos visto una o dos veces',
    1: 'Solo conexión en LinkedIn'
}

export const RELATIONSHIP_STRENGTH_COLORS: Record<1 | 2 | 3 | 4 | 5, string> = {
    5: 'bg-green-500',
    4: 'bg-blue-500',
    3: 'bg-yellow-500',
    2: 'bg-orange-500',
    1: 'bg-gray-400'
}

// ============================================
// INFERENCE TYPE HELPERS
// ============================================

export const INFERENCE_TYPE_LABELS: Record<InferredRelationship['inference_type'], string> = {
    ALUMNI: 'Alumni',
    INDUSTRY: 'Industria',
    GEOGRAPHY: 'Geografía',
    MUTUAL_CONNECTION: 'Conexión Mutua'
}

export const INFERENCE_TYPE_ICONS: Record<InferredRelationship['inference_type'], string> = {
    ALUMNI: '🎓',
    INDUSTRY: '🏢',
    GEOGRAPHY: '📍',
    MUTUAL_CONNECTION: '🤝'
}

// ============================================
// SENIORITY HELPERS
// ============================================

export const SENIORITY_LEVELS = ['C-Level', 'VP', 'Director', 'Manager', 'IC'] as const
export type SeniorityLevel = typeof SENIORITY_LEVELS[number]

export const SENIORITY_LABELS: Record<SeniorityLevel, string> = {
    'C-Level': 'C-Level',
    'VP': 'VP',
    'Director': 'Director',
    'Manager': 'Manager',
    'IC': 'Individual Contributor'
}

// ============================================
// CONNECTION TYPE HELPERS
// ============================================

export const CONNECTION_TYPES = ['ex-colleague', 'client', 'vendor', 'investor', 'other'] as const
export type ConnectionType = typeof CONNECTION_TYPES[number]

export const CONNECTION_TYPE_LABELS: Record<ConnectionType, string> = {
    'ex-colleague': 'Ex-colega',
    'client': 'Cliente',
    'vendor': 'Proveedor',
    'investor': 'Inversor',
    'other': 'Otro'
}

// ============================================
// VALIDATION SCHEMAS (Zod)
// ============================================

import { z } from 'zod'

export const profileSchema = z.object({
    current_company: z.string().min(2).max(100).optional(),
    current_title: z.string().min(2).max(100).optional(),
    current_location: z.string().max(100).optional(),
    industries_expertise: z.array(z.string()).max(10),
    strengths_tags: z.array(z.string()).max(15)
})

export const workHistorySchema = z.object({
    company_name: z.string().min(2).max(100),
    company_domain: z.string().url().optional().or(z.literal('')),
    company_industry: z.string().max(50).optional(),
    title: z.string().min(2).max(100),
    seniority: z.enum(['C-Level', 'VP', 'Director', 'Manager', 'IC']).optional(),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
    is_current: z.boolean(),
    description: z.string().max(500).optional(),
    achievements: z.array(z.string()).max(10)
}).refine(data => {
    if (data.end_date && data.start_date) {
        return new Date(data.end_date) > new Date(data.start_date)
    }
    return true
}, {
    message: "La fecha de fin debe ser posterior a la fecha de inicio"
}).refine(data => {
    if (data.is_current) {
        return !data.end_date
    }
    return true
}, {
    message: "Si es el trabajo actual, no debe tener fecha de fin"
})

export const connectionSchema = z.object({
    company_name: z.string().min(2).max(100),
    company_domain: z.string().url().optional().or(z.literal('')),
    relationship_strength: z.number().int().min(1).max(5),
    contact_count: z.number().int().min(0).max(1000).default(0),
    key_contacts: z.array(z.object({
        name: z.string().min(2),
        title: z.string().optional(),
        relationship: z.string().optional(),
        linkedin_url: z.string().url().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional()
    })).max(20),
    connection_type: z.enum(['ex-colleague', 'client', 'vendor', 'investor', 'other']).optional(),
    notes: z.string().max(500).optional(),
    tags: z.array(z.string()).max(10),
    last_interaction_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
})

export const keyContactSchema = z.object({
    name: z.string().min(2).max(100),
    title: z.string().max(100).optional(),
    relationship: z.string().max(100).optional(),
    linkedin_url: z.string().url().optional().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().max(20).optional()
})
