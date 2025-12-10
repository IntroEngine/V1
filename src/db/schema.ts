export type IntroType = 'DIRECT' | 'SECOND_LEVEL' | 'INFERRED' | 'OUTBOUND';

export interface Contact {
    id: string;
    user_id: string;
    name: string;
    email?: string;
    linkedin_url?: string;
    current_company: string;
    current_title: string;
    // stored as jsonb in DB, parsed here
    past_companies: {
        company: string;
        title: string;
        start_year?: number;
        end_year?: number;
    }[];
    created_at: string;
}

export interface Target {
    id: string;
    user_id: string;
    name: string;
    domain: string;
    industry: string;
    size_range?: string;
    icp_score: number; // 0-100
    created_at: string;
}

export type Company = Target;

export interface Opportunity {
    id: string;
    user_id: string;
    target_id: string;
    contact_id?: string;
    type: IntroType;
    status: 'new' | 'contacted' | 'meeting_booked' | 'closed' | 'intro_requested' | 'in_progress' | 'demo_scheduled' | 'suggested' | 'won' | 'lost';

    // Scores
    score_industry_fit: number;
    score_buying_signal: number;
    score_intro_strength: number;
    score_lead_potential: number;
    score_total: number;

    created_at: string;
    updated_at: string;
}

// Helper Types for Joined Data
export interface EnrichedOpportunity extends Opportunity {
    target?: Target;
    contact?: Contact;
}
