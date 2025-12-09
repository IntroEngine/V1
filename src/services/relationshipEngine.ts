import { supabaseAdmin } from '@/config/supabase'; // Assumed config path
import { openai } from '@/config/openai';         // Assumed config path
import { PROMPTS } from '@/services/ai/prompts';  // Assumed prompts path
import { Company, Contact, Opportunity } from '@/db/schema'; // Assumed DB types

// ==============================================================================
// 1. Module-Specific Types & Interfaces
// ==============================================================================

export interface BridgeContact {
    id: string;
    full_name: string;
    role_title: string;
    current_company: string;
    seniority?: string;
}

export interface TargetCandidate {
    id: string;
    full_name: string;
    role_title: string;
    current_company: string;
    seniority?: string;
}

export interface RelationshipContext {
    company: {
        id: string;
        name: string;
        industry?: string;
        size?: string;
        country?: string;
    };
    bridge_contacts: BridgeContact[];
    target_candidates: TargetCandidate[];
    known_relationships: {
        contact_1: string;
        contact_2: string;
        type: string;
    }[];
}

export interface IntroOpportunityResult {
    opportunities: {
        company_id: string;
        target: {
            id: string;
            full_name: string;
            role_title: string;
            seniority: string;
        };
        best_route: {
            type: 'DIRECT' | 'SECOND_LEVEL' | 'INFERRED';
            bridge_contact?: {
                id: string;
                full_name: string;
            };
            confidence: number;
            why: string;
        };
        suggested_intro_message: string;
        score: {
            intro_strength_score: number;
        };
    }[];
}

// ==============================================================================
// 2. Relationship Engine Service
// ==============================================================================

export class RelationshipEngine {

    /**
     * Public: Analyzes a single company for intro opportunities.
     */
    static async findIntroOpportunitiesForCompany(accountId: string, companyId: string): Promise<void> {
        console.log(`[RelationshipEngine] Processing Company: ${companyId} for Account: ${accountId}`);

        try {
            // 1. Fetch Context
            const { company, contacts, relationships } = await this.getCompanyContext(accountId, companyId);

            if (!company) {
                console.warn(`[RelationshipEngine] Company not found for ID: ${companyId}`);
                return;
            }

            // 2. Group Contacts
            const { bridgeContacts, targetCandidates } = this.segmentContacts(contacts, companyId);

            if (bridgeContacts.length === 0) {
                console.log(`[RelationshipEngine] No bridge contacts available for account. Skipping.`);
                return;
            }

            // 3. Build AI Context
            const context: RelationshipContext = {
                company: {
                    id: company.id,
                    name: company.name,
                    industry: company.industry,
                    size: company.size_bucket, // Mapping DB field
                    country: company.country
                },
                bridge_contacts: bridgeContacts.map(c => ({
                    id: c.id,
                    full_name: c.full_name,
                    role_title: c.role_title || 'Unknown',
                    current_company: c.company_id ? company.name : 'Network', // Simplified
                    seniority: c.seniority
                })),
                target_candidates: targetCandidates.map(c => ({
                    id: c.id,
                    full_name: c.full_name,
                    role_title: c.role_title || 'Unknown',
                    current_company: company.name,
                    seniority: c.seniority
                })),
                known_relationships: relationships.map(r => ({
                    contact_1: r.contact_id_1,
                    contact_2: r.contact_id_2,
                    type: r.relationship_type || 'knows'
                }))
            };

            // 4. Call AI
            const aiResult = await this.callRelationshipEngineAI(context);

            if (!aiResult || !aiResult.opportunities || aiResult.opportunities.length === 0) {
                console.log(`[RelationshipEngine] No opportunities identified by AI.`);
                return;
            }

            // 5. Persist Results
            await this.upsertIntroOpportunitiesFromAI(accountId, companyId, aiResult);

            console.log(`[RelationshipEngine] Successfully processed ${aiResult.opportunities.length} opportunities for ${company.name}`);

        } catch (error) {
            console.error(`[RelationshipEngine] Failed to process company ${companyId}:`, error);
            // Try not to throw here to allow batch processing to continue
        }
    }

    /**
     * Public: Batch processing.
     */
    static async findIntroOpportunitiesForCompanies(accountId: string, companyIds: string[]): Promise<void> {
        console.log(`[RelationshipEngine] Starting batch processing for ${companyIds.length} companies.`);
        for (const companyId of companyIds) {
            await this.findIntroOpportunitiesForCompany(accountId, companyId);
        }
        console.log(`[RelationshipEngine] Batch processing complete.`);
    }

    /**
     * Public: Recalculate for entire account.
     */
    static async recalculateIntroOpportunitiesForAccount(accountId: string): Promise<void> {
        // get all active companies
        const { data: companies, error } = await supabaseAdmin
            .from('companies')
            .select('id')
            .eq('account_id', accountId)
            .eq('status', 'new'); // Example filter

        if (error) throw error;
        if (!companies) return;

        const ids = companies.map(c => c.id);
        await this.findIntroOpportunitiesForCompanies(accountId, ids);
    }

    // ============================================================================
    // Internal Helpers
    // ============================================================================

    private static async getCompanyContext(accountId: string, companyId: string) {
        // Parallel fetching for performance
        const [companyRes, contactsRes, relRes] = await Promise.all([
            supabaseAdmin.from('companies').select('*').eq('id', companyId).eq('account_id', accountId).single(),
            supabaseAdmin.from('contacts').select('*').eq('account_id', accountId), // Fetch all my network + targets
            supabaseAdmin.from('contact_relationships').select('*').eq('account_id', accountId)
        ]);

        if (companyRes.error) console.error("Error fetching company", companyRes.error);

        return {
            company: companyRes.data,
            contacts: contactsRes.data || [],
            relationships: relRes.data || []
        };
    }

    private static segmentContacts(allContacts: any[], targetCompanyId: string) {
        // Naive segmentation: 
        // Target = contacts assigned to this company
        // Bridge = everyone else (my network)

        // Improved logic could define 'type' field in DB: 'bridge' vs 'target'
        const targetCandidates = allContacts.filter(c => c.company_id === targetCompanyId || c.type === 'target');
        const bridgeContacts = allContacts.filter(c => c.company_id !== targetCompanyId && c.type !== 'target');

        return { bridgeContacts, targetCandidates };
    }

    private static async callRelationshipEngineAI(context: RelationshipContext): Promise<IntroOpportunityResult | null> {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: PROMPTS.RELATIONSHIP_AGENT }, // Assumes imported
                    { role: "user", content: `Contexto del análisis:\n${JSON.stringify(context)}` }
                ],
                response_format: { type: "json_object" },
                temperature: 0.2
            });

            const content = response.choices[0].message.content;
            if (!content) return null;

            return JSON.parse(content) as IntroOpportunityResult;

        } catch (e) {
            console.error("[RelationshipEngine] OpenAI Call Error:", e);
            return null;
        }
    }

    private static async upsertIntroOpportunitiesFromAI(accountId: string, companyId: string, result: IntroOpportunityResult) {
        for (const opp of result.opportunities) {

            // 1. Identify IDs
            // AI returns IDs we sent. Verify existence or trust AI.
            // If AI returns a bridge contact ID, use it.
            const bridgeId = opp.best_route.bridge_contact?.id || null;
            const targetId = opp.target.id;

            // 2. Check existence to update or insert
            // Logic: Search for existing Opportunity for this Target via this Bridge (or lack thereof)
            const { data: existing } = await supabaseAdmin
                .from('opportunities')
                .select('id')
                .eq('account_id', accountId)
                .eq('company_id', companyId)
                .eq('target_contact_id', targetId)
                .eq('bridge_contact_id', bridgeId) // Null match handling depends on Supabase behavior (is null vs eq null) or application logic
                .maybeSingle(); // or .limit(1)

            let opportunityId = existing?.id;

            const oppPayload = {
                account_id: accountId,
                company_id: companyId,
                target_contact_id: targetId,
                bridge_contact_id: bridgeId,
                type: opp.best_route.type === 'DIRECT' ? 'intro_direct' :
                    (opp.best_route.type === 'SECOND_LEVEL' ? 'intro_second_degree' : 'intro_inferred'), // Map AI types to DB types
                status: 'suggested',
                suggested_intro_message: opp.suggested_intro_message,
                updated_at: new Date().toISOString()
            };

            if (opportunityId) {
                // Update
                await supabaseAdmin.from('opportunities').update(oppPayload).eq('id', opportunityId);
            } else {
                // Insert
                const { data: newOpp, error } = await supabaseAdmin.from('opportunities').insert(oppPayload).select().single();
                if (error) {
                    console.error("Error creating opportunity:", error);
                    continue;
                }
                opportunityId = newOpp.id;
            }

            // 3. Update Scores
            const scorePayload = {
                opportunity_id: opportunityId,
                intro_strength_score: opp.score.intro_strength_score,
                updated_at: new Date().toISOString()
            };

            // Upsert score (assuming unique constraint on opportunity_id)
            const { error: scoreError } = await supabaseAdmin.from('scores').upsert(scorePayload, { onConflict: 'opportunity_id' });
            if (scoreError) console.error("Error saving score:", scoreError);
        }
    }
}
