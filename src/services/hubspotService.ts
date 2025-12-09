import { supabaseAdmin } from '@/config/supabase';

// ==========================================
// Types & Interfaces
// ==========================================

export interface CompanyRecord {
    id: string;
    account_id: string;
    name: string;
    domain?: string;
    industry?: string;
    size_bucket?: string;
    country?: string;
    hubspot_company_id?: string;
}

export interface ContactRecord {
    id: string;
    account_id: string;
    full_name: string;
    email?: string;
    current_title?: string; // Schema uses current_title usually
    hubspot_contact_id?: string;
    company_id?: string;
}

export interface OpportunityRecord {
    id: string;
    account_id: string;
    company_id: string;
    type: string; // 'intro_direct', 'outbound', etc.
    status: string; // 'suggested', 'in_progress', etc.
    target_contact_id?: string;
    bridge_contact_id?: string;
    hubspot_deal_id?: string;
    suggested_intro_message?: string;
    suggested_outbound_message?: string;
    last_action_at?: string;
}

// ==========================================
// HubSpot Service
// ==========================================

export class HubSpotService {
    private static BASE_URL = 'https://api.hubapi.com';

    /**
     * Syncs a single opportunity to HubSpot (Deal + Company + Contact).
     */
    static async syncOpportunityToHubSpot(accountId: string, opportunityId: string): Promise<void> {
        console.log(`[HubSpotService] Syncing Opp ${opportunityId} needed...`);

        try {
            // 1. Fetch Context
            const { opportunity, company, targetContact } = await this.getOpportunityWithContext(accountId, opportunityId);

            if (!company) {
                console.error(`[HubSpotService] Missing company for opp ${opportunityId}`);
                return;
            }

            // 2. Ensure Company in HS
            const hubspotCompanyId = await this.ensureHubSpotCompany(accountId, company);

            // 3. Ensure Target Contact in HS (if exists)
            let hubspotContactId: string | undefined;
            if (targetContact) {
                hubspotContactId = await this.ensureHubSpotContact(accountId, targetContact, hubspotCompanyId);
            }

            // 4. Create/Update Deal in HS
            const hubspotDealId = await this.createOrUpdateHubSpotDeal(accountId, opportunity, hubspotCompanyId, hubspotContactId);

            // 5. Update local Opportunity with Deal ID
            if (opportunity.hubspot_deal_id !== hubspotDealId) {
                await this.updateOpportunityHubSpotDealId(opportunity.id, hubspotDealId);
                console.log(`[HubSpotService] Linked Opp ${opportunityId} to Deal ${hubspotDealId}`);
            } else {
                console.log(`[HubSpotService] Opp ${opportunityId} synced successfully.`);
            }

        } catch (error) {
            console.error(`[HubSpotService] Sync failed for opp ${opportunityId}:`, error);
            // Don't rethrow to protect batch processes
        }
    }

    /**
     * Batch sync wrapper.
     */
    static async syncOpportunitiesBatchToHubSpot(accountId: string, opportunityIds: string[]): Promise<void> {
        console.log(`[HubSpotService] Batch syncing ${opportunityIds.length} opportunities...`);
        for (const id of opportunityIds) {
            await this.syncOpportunityToHubSpot(accountId, id);
        }
    }

    /**
     * Syncs all pending opportunities (no deal ID) for an account.
     */
    static async syncAllPendingOpportunitiesToHubSpot(accountId: string): Promise<void> {
        const { data: opps, error } = await supabaseAdmin
            .from('opportunities')
            .select('id')
            .eq('account_id', accountId)
            .is('hubspot_deal_id', null)
            .neq('status', 'lost'); // Maybe skip lost if they never synced

        if (error) {
            console.error("[HubSpotService] Pending fetch error:", error);
            return;
        }

        if (opps && opps.length > 0) {
            console.log(`[HubSpotService] Found ${opps.length} pending opportunities.`);
            const ids = opps.map(o => o.id);
            await this.syncOpportunitiesBatchToHubSpot(accountId, ids);
        }
    }

    /**
     * Updates internal status based on external HubSpot Deal ID change.
     */
    static async updateOpportunityStatusFromHubSpot(accountId: string, hubspotDealId: string, newStatus: string): Promise<void> {
        // This requires mapping back from HS Stage -> Internal Status
        // Or just identifying the deal. For now, assuming direct status mapping passed by webhook handler.
        console.log(`[HubSpotService] Updating status for deal ${hubspotDealId} to ${newStatus}`);

        // In reality, you'd map "Closed Won" -> "won" here if 'newStatus' is raw HS stage name.
        // Leaving that logic for the webhook handler or a mapper here.

        const { error } = await supabaseAdmin
            .from('opportunities')
            .update({ status: newStatus, last_action_at: new Date().toISOString() })
            .eq('hubspot_deal_id', hubspotDealId)
            .eq('account_id', accountId);

        if (error) console.error("[HubSpotService] Status update failed:", error);
    }

    // ==========================================
    // Internal HubSpot Helpers
    // ==========================================

    private static async ensureHubSpotCompany(accountId: string, company: CompanyRecord): Promise<string> {
        const apiKey = await this.getHubSpotApiKeyForAccount(accountId);

        // 1. Check if we already have ID
        if (company.hubspot_company_id) {
            // Optional: Update basic fields
            await this.hubspotRequest(apiKey, `/crm/v3/objects/companies/${company.hubspot_company_id}`, 'PATCH', {
                properties: {
                    name: company.name,
                    domain: company.domain,
                    industry: company.industry
                }
            });
            return company.hubspot_company_id;
        }

        // 2. Search by Domain (if available)
        if (company.domain) {
            const searchRes = await this.hubspotRequest(apiKey, `/crm/v3/objects/companies/search`, 'POST', {
                filterGroups: [{
                    filters: [{ propertyName: 'domain', operator: 'EQ', value: company.domain }]
                }]
            });

            if (searchRes.results && searchRes.results.length > 0) {
                const existsId = searchRes.results[0].id;
                await this.updateCompanyHubSpotId(company.id, existsId);
                return existsId;
            }
        }

        // 3. Create
        const createRes = await this.hubspotRequest(apiKey, `/crm/v3/objects/companies`, 'POST', {
            properties: {
                name: company.name,
                domain: company.domain,
                industry: company.industry,
                description: "Synced from IntroEngine"
            }
        });

        const newId = createRes.id;
        await this.updateCompanyHubSpotId(company.id, newId);
        return newId;
    }

    private static async ensureHubSpotContact(accountId: string, contact: ContactRecord, hubspotCompanyId?: string): Promise<string> {
        const apiKey = await this.getHubSpotApiKeyForAccount(accountId);

        // 1. Check ID
        if (contact.hubspot_contact_id) {
            // Optional update
            return contact.hubspot_contact_id;
        }

        // 2. Search by Email
        if (contact.email) {
            const searchRes = await this.hubspotRequest(apiKey, `/crm/v3/objects/contacts/search`, 'POST', {
                filterGroups: [{
                    filters: [{ propertyName: 'email', operator: 'EQ', value: contact.email }]
                }]
            });

            if (searchRes.results && searchRes.results.length > 0) {
                const existsId = searchRes.results[0].id;
                await this.updateContactHubSpotId(contact.id, existsId);
                return existsId;
            }
        }

        // 3. Create
        // Split name naive
        const [firstname, ...rest] = contact.full_name.split(' ');
        const lastname = rest.join(' ');

        const createRes = await this.hubspotRequest(apiKey, `/crm/v3/objects/contacts`, 'POST', {
            properties: {
                email: contact.email,
                firstname: firstname || contact.full_name,
                lastname: lastname,
                jobtitle: contact.current_title
            }
        });

        const newId = createRes.id;
        await this.updateContactHubSpotId(contact.id, newId);

        // 4. Associate to Company
        if (hubspotCompanyId) {
            await this.hubspotRequest(apiKey, `/crm/v3/objects/companies/${hubspotCompanyId}/associations/contacts/${newId}/company_to_contact`, 'PUT', {});
        }

        return newId;
    }

    private static async createOrUpdateHubSpotDeal(
        accountId: string,
        opportunity: OpportunityRecord,
        hubspotCompanyId: string,
        hubspotContactId?: string
    ): Promise<string> {
        const apiKey = await this.getHubSpotApiKeyForAccount(accountId);

        // Properties mapping
        const dealStage = this.mapOpportunityStatusToHubSpotStage(opportunity.status);
        const pipeline = 'default'; // TODO: make configurable
        const dealName = `IntroEngine Opp - ${opportunity.type} - ${new Date().toISOString().split('T')[0]}`;

        const properties = {
            dealname: dealName,
            dealstage: dealStage,
            pipeline: pipeline,
            description: opportunity.suggested_intro_message || opportunity.suggested_outbound_message || "Generated by IntroEngine"
        };

        let dealId = opportunity.hubspot_deal_id;

        if (dealId) {
            // Update
            await this.hubspotRequest(apiKey, `/crm/v3/objects/deals/${dealId}`, 'PATCH', { properties });
        } else {
            // Create
            const createRes = await this.hubspotRequest(apiKey, `/crm/v3/objects/deals`, 'POST', { properties });
            dealId = createRes.id;

            // Associations
            if (hubspotCompanyId) {
                await this.hubspotRequest(apiKey, `/crm/v3/objects/companies/${hubspotCompanyId}/associations/deals/${dealId}/company_to_deal`, 'PUT', {});
            }
            if (hubspotContactId) {
                await this.hubspotRequest(apiKey, `/crm/v3/objects/contacts/${hubspotContactId}/associations/deals/${dealId}/contact_to_deal`, 'PUT', {});
            }
        }

        return dealId!;
    }

    // ==========================================
    // DB & Utils
    // ==========================================

    private static async getOpportunityWithContext(accountId: string, opportunityId: string) {
        const { data: opp } = await supabaseAdmin
            .from('opportunities')
            .select('*')
            .eq('id', opportunityId)
            .eq('account_id', accountId)
            .single();

        if (!opp) return { opportunity: null, company: null, targetContact: null };

        const { data: company } = await supabaseAdmin
            .from('companies')
            .select('*')
            .eq('id', opp.company_id)
            .single();

        let targetContact = null;
        if (opp.target_contact_id) {
            const { data } = await supabaseAdmin.from('contacts').select('*').eq('id', opp.target_contact_id).single();
            targetContact = data;
        }

        return {
            opportunity: opp as OpportunityRecord,
            company: company as CompanyRecord,
            targetContact: targetContact as ContactRecord
        };
    }

    private static async updateCompanyHubSpotId(id: string, hsId: string) {
        await supabaseAdmin.from('companies').update({ hubspot_company_id: hsId }).eq('id', id);
    }

    private static async updateContactHubSpotId(id: string, hsId: string) {
        await supabaseAdmin.from('contacts').update({ hubspot_contact_id: hsId }).eq('id', id);
    }

    private static async updateOpportunityHubSpotDealId(id: string, hsId: string) {
        await supabaseAdmin.from('opportunities').update({ hubspot_deal_id: hsId }).eq('id', id);
    }

    private static mapOpportunityStatusToHubSpotStage(status: string): string {
        // Basic mapping, needs adjustment to match real HS account pipeline
        switch (status) {
            case 'suggested': return 'appointmentscheduled'; // "Prospecting" usually mapped here or custom
            case 'intro_requested': return 'qualifiedtobuy';
            case 'in_progress': return 'presentationscheduled';
            case 'won': return 'closedwon';
            case 'lost': return 'closedlost';
            default: return 'appointmentscheduled';
        }
    }

    private static async getHubSpotApiKeyForAccount(accountId: string): Promise<string> {
        // TODO: Fetch from Settings or encrypted Store
        // For now, returning global env or mock
        const key = process.env.HUBSPOT_ACCESS_TOKEN;
        if (!key) throw new Error("Missing HubSpot Configuration");
        return key;
    }

    private static async hubspotRequest(token: string, endpoint: string, method: string, body: any): Promise<any> {
        const url = `${this.BASE_URL}${endpoint}`;

        // Simple fetch wrapper
        // In prod, use a limiter or retry logic
        const res = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`HubSpot API Error [${res.status}]: ${err}`);
        }

        return res.json();
    }
}
