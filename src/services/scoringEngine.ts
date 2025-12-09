import { supabaseAdmin } from '@/config/supabase';
import { openai } from '@/config/openai';
import { PROMPTS } from '@/services/ai/prompts';
// Ensure Contact, Opportunity, Target (Company) types are compatible
// Assuming @/db/schema mirrors the actual DB structure
import { Opportunity, Contact, Target } from '@/db/schema';

// ===================================
// Local Types / Interfaces
// ===================================

export interface ScoringContext {
    company: {
        id: string;
        name: string;
        industry?: string;
        size_bucket?: string;
        country?: string;
    };
    opportunity: {
        id: string;
        type: string; // 'intro_direct' | 'outbound' | etc
        status: string;
    };
    target_contact?: {
        id: string;
        full_name: string;
        role_title?: string;
        seniority?: string;
    };
    bridge_contact?: {
        id: string;
        full_name: string;
        role_title?: string;
        seniority?: string;
    };
    relationship?: {
        type: 'direct' | 'second_level' | 'inferred' | null;
        strength: number | null;
    };
    buying_signals: {
        hiring: boolean;
        growth: boolean;
        chaos: boolean;
        no_hr: boolean;
    };
}

export interface ScoringAIResponse {
    scores: {
        industry_fit_score: number;
        buying_signal_score: number;
        intro_strength_score: number;
        lead_potential_score: number;
    };
    explanation: string;
}

// ===================================
// Scoring Engine Service
// ===================================

export class ScoringEngine {

    /**
     * Scores a single opportunity by ID.
     * Fetches full context (Company, Contacts, etc.) and calls AI.
     */
    static async scoreOpportunityById(accountId: string, opportunityId: string): Promise<void> {
        console.log(`[ScoringEngine] Scoring Opportunity: ${opportunityId}`);

        try {
            // 1. Fetch Opportunity with relations
            // Note: Supabase JS join syntax depends on setup. Doing manual fetch for control logic.
            const { data: op, error: opError } = await supabaseAdmin
                .from('opportunities')
                .select('*')
                .eq('id', opportunityId)
                .eq('account_id', accountId)
                .single();

            if (opError || !op) {
                console.error(`[ScoringEngine] Opp not found: ${opportunityId}`);
                return;
            }

            // 2. Fetch Company
            const { data: company } = await supabaseAdmin
                .from('companies')
                .select('*')
                .eq('id', op.company_id)
                .single();

            if (!company) {
                console.error(`[ScoringEngine] Company not found for opp: ${opportunityId}`);
                return;
            }

            // 3. Fetch Contacts (Target & Bridge)
            let targetContact: Contact | undefined;
            let bridgeContact: Contact | undefined;

            if (op.target_contact_id) {
                const { data } = await supabaseAdmin.from('contacts').select('*').eq('id', op.target_contact_id).single();
                if (data) targetContact = data as Contact;
            }

            if (op.bridge_contact_id) {
                const { data } = await supabaseAdmin.from('contacts').select('*').eq('id', op.bridge_contact_id).single();
                if (data) bridgeContact = data as Contact;
            }

            // 4. Build Context
            // MOCK: buying signals / relationship info details
            const buyingSignals = {
                hiring: true, // TODO: Implement real signal fetch
                growth: company.size_bucket !== '1-10',
                chaos: false,
                no_hr: true
            };

            // Relationship inference from opp type
            let relType: 'direct' | 'second_level' | 'inferred' | null = null;
            if (op.type.includes('direct')) relType = 'direct';
            else if (op.type.includes('second')) relType = 'second_level';
            else if (op.type.includes('inferred')) relType = 'inferred';

            const context: ScoringContext = {
                company: {
                    id: company.id,
                    name: company.name,
                    industry: company.industry,
                    size_bucket: company.size_bucket,
                    country: company.country
                },
                opportunity: {
                    id: op.id,
                    type: op.type,
                    status: op.status
                },
                target_contact: targetContact ? {
                    id: targetContact.id,
                    full_name: targetContact.name, // Using 'name' from schema
                    role_title: targetContact.current_title, // Schema uses 'current_title'
                    seniority: 'Unknown' // TODO: add seniority to contact schema or infer
                } : undefined,
                bridge_contact: bridgeContact ? {
                    id: bridgeContact.id,
                    full_name: bridgeContact.name,
                    role_title: bridgeContact.current_title,
                    seniority: 'Unknown'
                } : undefined,
                relationship: {
                    type: relType,
                    strength: relType === 'direct' ? 5 : (relType === 'second_level' ? 3 : 1)
                },
                buying_signals: buyingSignals
            };

            // 5. Calculate Scores (AI)
            const aiResult = await this.scoreSingleContext(context);

            // 6. Persist
            await this.upsertScores(opportunityId, aiResult);

            console.log(`[ScoringEngine] Scored Opp ${opportunityId}: Lead Potential ${aiResult.scores.lead_potential_score}/100`);

        } catch (error) {
            console.error(`[ScoringEngine] Error scoring opp ${opportunityId}:`, error);
        }
    }

    /**
     * Pure function to get scores for a context. Useful for testing or pre-scoring.
     */
    static async scoreSingleContext(context: ScoringContext): Promise<ScoringAIResponse> {
        return await this.callScoringEngineAI(context);
    }

    /**
     * Batch score all opportunities for a company.
     */
    static async scoreOpportunitiesForCompany(accountId: string, companyId: string): Promise<void> {
        const { data: opps } = await supabaseAdmin
            .from('opportunities')
            .select('id')
            .eq('account_id', accountId)
            .eq('company_id', companyId);

        if (!opps) return;

        for (const opp of opps) {
            await this.scoreOpportunityById(accountId, opp.id);
        }
    }

    /**
     * Batch score all opportunities for the account.
     */
    static async scoreAllOpportunitiesForAccount(accountId: string): Promise<void> {
        const { data: opps } = await supabaseAdmin
            .from('opportunities')
            .select('id')
            .eq('account_id', accountId)
            .neq('status', 'closed') // skip closed
            .neq('status', 'lost');

        if (!opps) return;

        console.log(`[ScoringEngine] Batch scoring ${opps.length} opportunities for account ${accountId}`);
        for (const opp of opps) {
            await this.scoreOpportunityById(accountId, opp.id);
        }
    }

    // ===================================
    // Internal Helpers
    // ===================================

    private static async callScoringEngineAI(context: ScoringContext): Promise<ScoringAIResponse> {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: PROMPTS.SCORING_AGENT },
                    {
                        role: "user", content: `
Datos para analizar:
${JSON.stringify(context, null, 2)}
`
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("Empty AI response");

            const json = JSON.parse(content);

            // Fallback defaults if AI acts up
            return {
                scores: {
                    industry_fit_score: json.scores?.industry_fit_score || 0,
                    buying_signal_score: json.scores?.buying_signal_score || 0,
                    intro_strength_score: json.scores?.intro_strength_score || 0,
                    lead_potential_score: json.scores?.lead_potential_score || 0
                },
                explanation: json.explanation || "No explanation provided."
            };

        } catch (error) {
            console.error("[ScoringEngine] AI Call Failed:", error);
            // Return failsafe 0 scores
            return {
                scores: {
                    industry_fit_score: 0,
                    buying_signal_score: 0,
                    intro_strength_score: 0,
                    lead_potential_score: 0
                },
                explanation: "Scoring failed due to API error."
            };
        }
    }

    private static async upsertScores(opportunityId: string, result: ScoringAIResponse) {
        const scoreData = {
            opportunity_id: opportunityId,
            industry_fit_score: result.scores.industry_fit_score,
            buying_signal_score: result.scores.buying_signal_score,
            intro_strength_score: result.scores.intro_strength_score,
            lead_potential_score: result.scores.lead_potential_score,
            raw_metadata: { explanation: result.explanation },
            updated_at: new Date().toISOString()
        };

        const { error } = await supabaseAdmin
            .from('scores')
            .upsert(scoreData, { onConflict: 'opportunity_id' });

        if (error) {
            console.error("[ScoringEngine] DB Upsert Error:", error);
        }
    }
}
