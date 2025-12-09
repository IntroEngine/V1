import { supabaseAdmin } from '@/config/supabase';
import { openai } from '@/config/openai';
import { PROMPTS } from '@/services/ai/prompts';
// Assuming definitions exist or are compatible.
// In a real project, we would ensure @/db/schema exports 'Company'.
// For now, mirroring the DB shape here if strict types are missing.
import { Opportunity } from '@/db/schema';

// ===================================
// Local Types / Interfaces
// ===================================

// Mirroring the 'companies' table structure
export interface Company {
    id: string;
    name: string;
    domain?: string;
    website?: string;
    industry?: string;
    size_bucket?: string; // '1-10', '11-50', etc.
    country?: string;
    icp_score?: number;
}

export interface OutboundContext {
    company: {
        name: string;
        domain: string;
        industry: string;
        size: string;
        country: string;
    };
    target_role: string;
    buying_signals: {
        hiring: boolean;
        growth: boolean;
        chaos: boolean;
        recent_funding: boolean;
    };
    has_intro_opportunities: boolean;
    metadata?: Record<string, any>;
}

export interface OutboundAIResponse {
    outbound: {
        short: string;
        long: string;
        cta: string;
        reason_now: string;
    };
    score: {
        lead_potential_score: number;
    };
}

// ===================================
// Outbound Engine Service
// ===================================

export class OutboundEngine {

    /**
     * Generates a single outbound opportunity for a specific company if viable.
     */
    static async createOutboundOpportunityForCompany(accountId: string, companyId: string): Promise<void> {
        console.log(`[OutboundEngine] Analyzing company ${companyId}...`);

        try {
            // 1. Build Context
            const context = await this.buildOutboundContextForCompany(accountId, companyId);
            if (!context) {
                console.warn(`[OutboundEngine] Context build failed for ${companyId}`);
                return;
            }

            // 2. Gatekeeping: Don't generate outbound if we have good intros
            if (context.has_intro_opportunities) {
                console.log(`[OutboundEngine] Skipping outbound for ${companyId} - Warm Intro available.`);
                return;
            }

            // 3. Gatekeeping: Basic ICP check (can be advanced with ScoringService)
            // For now, we assume if we are running this, we want to try.

            // 4. Call AI
            const aiResponse = await this.callOutboundEngineAI(context);
            if (!aiResponse) {
                console.error(`[OutboundEngine] Failed to generate AI response for ${companyId}`);
                return;
            }

            // 5. Persist
            await this.upsertOutboundOpportunity(accountId, companyId, aiResponse, context);

            console.log(`[OutboundEngine] Outbound generated for ${context.company.name}`);

        } catch (error) {
            console.error(`[OutboundEngine] Error processing company ${companyId}:`, error);
        }
    }

    /**
     * Batch processing for multiple companies.
     */
    static async createOutboundOpportunitiesForCompanies(accountId: string, companyIds: string[]): Promise<void> {
        console.log(`[OutboundEngine] Batch processing ${companyIds.length} companies.`);

        // Process in sequence to manage rate limits, or Promise.all with concurrency limit in real prod
        for (const id of companyIds) {
            await this.createOutboundOpportunityForCompany(accountId, id);
        }
    }

    /**
     * Cron-friendly method to auto-scan the account for new outbound targets.
     */
    static async autoGenerateOutboundForAccount(accountId: string): Promise<void> {
        try {
            // 1. Find high-potential companies without recent activity
            // Using a raw query logic via Supabase or assume a simplified flow
            const { data: companies, error } = await supabaseAdmin
                .from('companies')
                .select('id, status')
                .eq('account_id', accountId)
                .neq('status', 'closed') // Don't pitch lost/won
                .order('created_at', { ascending: false })
                .limit(20); // Process batch of 20

            if (error) throw error;
            if (!companies || companies.length === 0) return;

            // Filter those who might already have an active opp (handled in createOutbound... but good to pre-filter)
            // For simplicity, we just run the main logic which handles checks.
            const ids = companies.map(c => c.id);

            await this.createOutboundOpportunitiesForCompanies(accountId, ids);

        } catch (error) {
            console.error(`[OutboundEngine] Auto-generate failed for account ${accountId}:`, error);
        }
    }

    // ===================================
    // Internal Helpers
    // ===================================

    private static async buildOutboundContextForCompany(accountId: string, companyId: string): Promise<OutboundContext | null> {
        // 1. Fetch Company
        const { data: company, error } = await supabaseAdmin
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .eq('account_id', accountId)
            .single();

        if (error || !company) return null;

        // 2. Check existing Intro opportunities
        const { count } = await supabaseAdmin
            .from('opportunities')
            .select('id', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('type', 'intro_direct') // or check all intro types
            .neq('status', 'lost');

        const hasIntro = (count || 0) > 0;

        // 3. Buying Signals (Placeholder or future 'signals' table)
        const signals = {
            hiring: true, // Mocked: assume we scraped LinkedIn jobs
            growth: company.size_bucket !== '1-10', // Mocked logic
            chaos: false,
            recent_funding: false
        };

        // 4. Determine Role
        const targetRole = this.getDefaultTargetRoleForCompany(company);

        return {
            company: {
                name: company.name,
                domain: company.domain || '',
                industry: company.industry || 'Unknown',
                size: company.size_bucket || 'Unknown',
                country: company.country || 'Unknown'
            },
            target_role: targetRole,
            buying_signals: signals,
            has_intro_opportunities: hasIntro,
            metadata: { source: 'auto-generated' }
        };
    }

    private static getDefaultTargetRoleForCompany(company: any): string {
        // Simple heuristic
        const industry = (company.industry || '').toLowerCase();
        const size = company.size_bucket || '1-10';

        if (size === '1-10' || size === '11-50') return 'Founder / CEO';
        if (industry.includes('tech') || industry.includes('saas')) return 'CTO / VP Engineering';

        // Default for Witar pitch (HR/Ops)
        return 'HR Manager / Operations Director';
    }

    private static async callOutboundEngineAI(context: OutboundContext): Promise<OutboundAIResponse | null> {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: PROMPTS.OUTBOUND_AGENT },
                    {
                        role: "user", content: `
Empresa a analizar:
${JSON.stringify(context.company)}

Rol objetivo:
${context.target_role}

Buying signals:
${JSON.stringify(context.buying_signals)}
`
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) return null;

            // Validate structure roughly
            const json = JSON.parse(content);
            if (!json.outbound || !json.score) return null;

            return json as OutboundAIResponse;
        } catch (error) {
            console.error("[OutboundEngine] OpenAI error:", error);
            return null;
        }
    }

    private static async upsertOutboundOpportunity(
        accountId: string,
        companyId: string,
        aiResult: OutboundAIResponse,
        context: OutboundContext
    ) {
        // 1. Check for existing outbound opportunity to update
        const { data: existing } = await supabaseAdmin
            .from('opportunities')
            .select('id')
            .eq('account_id', accountId)
            .eq('company_id', companyId)
            .eq('type', 'outbound') // Use specific enum value
            .in('status', ['suggested', 'in_progress']) // Only update active ones
            .maybeSingle();

        const opportunityData = {
            account_id: accountId,
            company_id: companyId,
            type: 'outbound',
            status: 'suggested',
            suggested_outbound_message: aiResult.outbound.long, // Storing the long version
            suggested_intro_message: null, // It's outbound
            last_action_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
            // target_contact_id: null (we don't have a specific person yet, just a role)
        };

        let opportunityId;

        if (existing) {
            opportunityId = existing.id;
            await supabaseAdmin
                .from('opportunities')
                .update(opportunityData)
                .eq('id', opportunityId);
        } else {
            const { data: created, error } = await supabaseAdmin
                .from('opportunities')
                .insert(opportunityData)
                .select()
                .single();

            if (error) {
                console.error("[OutboundEngine] Insert failed:", error);
                return;
            }
            opportunityId = created.id;
        }

        // 2. Persist Scores
        const scoreData = {
            opportunity_id: opportunityId,
            lead_potential_score: aiResult.score.lead_potential_score,
            industry_fit_score: null, // Could utilize ScoringService here if wanted
            buying_signal_score: null,
            raw_metadata: {
                outbound_context: context,
                generated_variants: aiResult.outbound
            },
            updated_at: new Date().toISOString()
        };

        await supabaseAdmin
            .from('scores')
            .upsert(scoreData, { onConflict: 'opportunity_id' });
    }
}
