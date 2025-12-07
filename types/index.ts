export type IntroType = 'DIRECT' | 'SECOND_LEVEL' | 'INFERRED' | 'OUTBOUND';

export interface Contact {
    id: string;
    user_id: string;
    name: string;
    email?: string;
    linkedin_url?: string;
    current_company: string;
    current_title: string;
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
    icp_score: number;
}

export interface Opportunity {
    id: string;
    user_id: string;
    target_id: string;
    contact_id?: string; // Optional because direct outbound has no contact
    type: IntroType;
    status: 'new' | 'contacted' | 'meeting_booked' | 'closed';

    // Scores
    score_industry_fit: number;
    score_buying_signal: number;
    score_intro_strength: number;
    score_lead_potential: number;
    score_total: number;

    // Joins for frontend convenience
    target?: Target;
    contact?: Contact;
}

export interface Message {
    id: string;
    opportunity_id: string;
    content: string;
    flavor?: string;
}
