import { supabaseAdmin } from '@/config/supabase';
import { openai } from '@/config/openai';
import { PROMPTS } from '@/services/ai/prompts';
import { Opportunity, Contact, Company } from '@/db/schema';

// ===================================
// Local Types / Interfaces
// ===================================

export type FollowUpType = 'bridge' | 'prospect' | 'outbound';

export interface FollowUpContext {
    opportunity: {
        id: string;
        type: string;
        status: string;
        last_action_at: string | null;
    };
    company: {
        id: string;
        name: string;
        industry?: string;
        size_bucket?: string;
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
        relationship_strength?: number;
    };
    days_without_activity: number;
    followup_type: FollowUpType;
}

export interface FollowUpAIResponse {
    followups: {
        bridge_contact?: string;
        prospect?: string;
        outbound?: string;
    };
}

export interface FollowUpSuggestion {
    type: FollowUpType;
    message: string;
}

// ===================================
// Follow-up Engine Service
// ===================================

export class FollowUpEngine {

    /**
     * Scans an account for stale opportunities and generates follow-ups.
     */
    static async generateFollowUpsForAccount(accountId: string, options: { daysWithoutActivity?: number } = {}): Promise<void> {
        const thresholdDays = options.daysWithoutActivity || 3;
        console.log(`[FollowUpEngine] Scanning account ${accountId} for inactivity > ${thresholdDays} days...`);

        // 1. Find Opportunities with inactivity
        // We need to calculate date diff in SQL or fetch and filter.
        // Fetching candidates (active states)
        const { data: opps, error } = await supabaseAdmin
            .from('opportunities')
            .select('id, last_action_at')
            .eq('account_id', accountId)
            .not('status', 'in', '("won","lost","closed")') // Filter active only
            .lt('last_action_at', new Date(Date.now() - thresholdDays * 24 * 60 * 60 * 1000).toISOString());

        if (error) {
            console.error("[FollowUpEngine] Error fetching opps:", error);
            return;
        }

        if (!opps || opps.length === 0) {
            console.log("[FollowUpEngine] No stale opportunities found.");
            return;
        }

        console.log(`[FollowUpEngine] Found ${opps.length} stale opportunities. Processing...`);

        // 2. Turn-key generation
        for (const opp of opps) {
            await this.generateFollowUpsForOpportunity(accountId, opp.id, thresholdDays);
        }
    }

    /**
     * Generates and persists a follow-up for a single opportunity.
     */
    static async generateFollowUpsForOpportunity(accountId: string, opportunityId: string, minDays: number = 3): Promise<void> {
        try {
            const suggestion = await this.previewFollowUpForOpportunity(accountId, opportunityId, minDays);

            if (!suggestion) return; // No applicable follow-up

            // Persist in Activity Logs (or dedicated table)
            await supabaseAdmin.from('activity_logs').insert({
                account_id: accountId,
                user_id: 'system', // Automated
                activity_type: 'followup_suggestion',
                entity_type: 'opportunity',
                entity_id: opportunityId,
                description: `Suggested ${suggestion.type} follow-up`,
                metadata: {
                    suggestion: suggestion.message,
                    type: suggestion.type,
                    generated_at: new Date().toISOString()
                }
            });

            console.log(`[FollowUpEngine] Persisted suggestion for Opp ${opportunityId}`);

        } catch (error) {
            console.error(`[FollowUpEngine] Error processing opp ${opportunityId}:`, error);
        }
    }

    /**
     * Generates context and calls AI to preview the message. Does NOT persist.
     */
    static async previewFollowUpForOpportunity(accountId: string, opportunityId: string, daysWithoutActivity?: number): Promise<FollowUpSuggestion | null> {
        // 1. Build Context
        const context = await this.buildFollowUpContext(accountId, opportunityId, daysWithoutActivity || 0);
        if (!context) return null;

        // 2. Call AI
        const result = await this.callFollowUpEngineAI(context);
        if (!result) return null;

        // 3. Extract relevant message
        let message = '';
        if (context.followup_type === 'bridge') message = result.followups.bridge_contact || '';
        else if (context.followup_type === 'prospect') message = result.followups.prospect || '';
        else if (context.followup_type === 'outbound') message = result.followups.outbound || '';

        if (!message) return null;

        return {
            type: context.followup_type,
            message
        };
    }

    // ===================================
    // Internal Helpers
    // ===================================

    private static determineFollowUpType(opportunity: Opportunity): FollowUpType | null {
        if (['won', 'lost', 'closed'].includes(opportunity.status)) return null;

        if (opportunity.type.includes('intro')) {
            if (opportunity.status === 'intro_requested') return 'bridge';
            if (opportunity.status === 'in_progress' || opportunity.status === 'demo_scheduled') return 'prospect';
        }

        if (opportunity.type === 'outbound') {
            if (opportunity.status === 'in_progress' || opportunity.status === 'suggested') return 'outbound';
        }

        return null;
    }

    private static async buildFollowUpContext(accountId: string, opportunityId: string, daysOverrides: number): Promise<FollowUpContext | null> {
        // Fetch Opp + relations
        const { data: oppRaw } = await supabaseAdmin
            .from('opportunities')
            .select(`
        *,
        company:companies(*),
        target_contact:contacts!target_contact_id(*),
        bridge_contact:contacts!bridge_contact_id(*)
      `)
            .eq('id', opportunityId)
            .eq('account_id', accountId)
            .single();

        if (!oppRaw) return null;

        // Cast types locally or assume join shape
        const opp = oppRaw as any;
        const company = opp.company;

        const type = this.determineFollowUpType(opp);
        if (!type) return null;

        // Calculate actual days if not provided
        let days = daysOverrides;
        if (days === 0 && opp.last_action_at) {
            const last = new Date(opp.last_action_at).getTime();
            const now = Date.now();
            days = Math.floor((now - last) / (1000 * 60 * 60 * 24));
        }

        return {
            opportunity: {
                id: opp.id,
                type: opp.type,
                status: opp.status,
                last_action_at: opp.last_action_at
            },
            company: {
                id: company.id,
                name: company.name,
                industry: company.industry,
                size_bucket: company.size_bucket
            },
            target_contact: opp.target_contact ? {
                id: opp.target_contact.id,
                full_name: opp.target_contact.name,
                role_title: opp.target_contact.current_title
            } : undefined,
            bridge_contact: opp.bridge_contact ? {
                id: opp.bridge_contact.id,
                full_name: opp.bridge_contact.name,
                role_title: opp.bridge_contact.current_title
            } : undefined,
            days_without_activity: days,
            followup_type: type
        };
    }

    private static async callFollowUpEngineAI(context: FollowUpContext): Promise<FollowUpAIResponse | null> {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: PROMPTS.FOLLOWUP_AGENT },
                    {
                        role: "user", content: `
Estado de la oportunidad:
${JSON.stringify({
                            type: context.opportunity.type,
                            status: context.opportunity.status,
                            company: context.company.name,
                            target: context.target_contact?.full_name,
                            bridge: context.bridge_contact?.full_name
                        }, null, 2)}

Días sin respuesta:
${context.days_without_activity}

Tipo de Follow-up Necesario:
${context.followup_type.toUpperCase()}
`
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) return null;

            const json = JSON.parse(content);
            return json as FollowUpAIResponse;

        } catch (error) {
            console.error("[FollowUpEngine] AI Error:", error);
            return null;
        }
    }
}
