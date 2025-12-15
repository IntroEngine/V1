import { Opportunity, OpportunityStats } from '@/types/network';
import { supabaseAdmin } from '@/config/supabase';

export class OpportunityService {

    static async getOpportunities(userId: string): Promise<Opportunity[]> {
        // Fetch Inferred Relationships (Intros)
        const { data: inferred, error: inferredError } = await supabaseAdmin
            .from('inferred_relationships')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('confidence_score', { ascending: false });

        if (inferredError) {
            console.error('Error fetching inferred relationships:', inferredError);
            return [];
        }

        // We need to fetch the bridge contact details (the UserConnection) to show real data
        const companyNames = inferred.map(o => o.target_company).filter(Boolean);
        const { data: connections } = await supabaseAdmin
            .from('user_connections')
            .select('company_name, contact_count, relationship_strength, key_contacts')
            .eq('user_id', userId)
            .in('company_name', companyNames);

        const connMap = new Map<string, any>();
        if (connections) {
            connections.forEach(c => connMap.set(c.company_name, c));
        }

        const introOpps: Opportunity[] = inferred.map(item => {
            const conn = connMap.get(item.target_company);
            let bridgeName = 'Unknown Connection';
            let bridgeRole = 'Connection';
            let bridgeLinkedin: string | undefined; // Added variable
            let relationshipStrength = 0;

            // Priority 1: Use the contact identified by AI Inference (saved in supporting_data)
            if (item.supporting_data && item.supporting_data.bridge_contact) {
                const contact = item.supporting_data.bridge_contact;
                bridgeName = contact.name || contact.firstName || 'Unknown';
                bridgeRole = contact.title || contact.role || 'Contact';
                // Try to find LinkedIn URL in various possible fields
                bridgeLinkedin = contact.linkedin || contact.linkedin_url || contact.linkedinUrl || null;
                // Estimate strength if not directly available on contact, default to conn strength
                relationshipStrength = conn ? (conn.relationship_strength * 20) : 60;
            }
            // Priority 2: Use the first contact from the connection (Fallback)
            else if (conn && conn.key_contacts && conn.key_contacts.length > 0) {
                const contact = conn.key_contacts[0];
                bridgeName = contact.name || 'Unknown';
                bridgeRole = contact.title || 'Contact';
                bridgeLinkedin = contact.linkedin || contact.linkedin_url || contact.linkedinUrl || null;
                relationshipStrength = conn.relationship_strength * 20;
            } else if (conn) {
                bridgeName = `${conn.contact_count} Contact(s)`;
                relationshipStrength = conn.relationship_strength * 20;
            } else if (item.bridge_company) {
                // ALUMNI Case
                bridgeName = 'Network Connection';
                bridgeRole = `via ${item.bridge_company}`;
                relationshipStrength = 80;
            }

            return {
                id: item.id,
                type: 'Intro',
                targetCompany: item.target_company,
                targetCompanyId: item.id,
                targetContact: {
                    name: 'Decision Maker', // Generic for now
                    role: 'Relevant Role',
                    email: ''
                },
                // Only show bridge contact if we actually found something valid
                bridgeContact: {
                    name: bridgeName,
                    role: bridgeRole,
                    relationshipStrength: relationshipStrength,
                    linkedin: bridgeLinkedin
                },
                aiScore: item.confidence_score,
                reasoning: item.reasoning,
                status: (item.status || 'Suggested') as any, // USE REAL STATUS
                createdDate: item.generated_at ? new Date(item.generated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            };
        });


        // Fetch Prospects (Outbound)
        const { data: prospects, error: prospectError } = await supabaseAdmin
            .from('prospects')
            .select('*')
            .eq('user_id', userId)
            .neq('status', 'rejected');

        if (prospectError) {
            console.error('Error fetching prospects:', prospectError);
            // Allow partial failure
        }

        const outboundOpps: Opportunity[] = (prospects || []).map(p => {
            // Basic mapping from prospect status to Opportunity status
            let status: Opportunity['status'] = 'Suggested';
            const pStatus = p.status ? p.status.toLowerCase() : 'new';

            if (['requested', 'contacted'].includes(pStatus)) status = 'Requested';
            if (['in progress', 'replied'].includes(pStatus)) status = 'In Progress';
            if (['won', 'converted'].includes(pStatus)) status = 'Won';
            if (['lost'].includes(pStatus)) status = 'Lost';
            // If the DB has exactly our pipeline statuses, use them directly
            if (['Suggested', 'Requested', 'In Progress', 'Won', 'Lost'].includes(p.status)) {
                status = p.status as any;
            }

            return {
                id: p.id,
                type: 'Outbound',
                targetCompany: p.company_name,
                targetCompanyId: p.id,
                targetContact: {
                    name: 'Unknown',
                    role: 'Target Persona',
                    email: ''
                },
                aiScore: p.icp_score || 50,
                reasoning: p.description || 'Matched by ICP',
                status: status,
                createdDate: p.created_at ? new Date(p.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            }
        });

        // Merge and Sort
        return [...introOpps, ...outboundOpps].sort((a, b) => b.aiScore - a.aiScore);
    }

    static async getStats(userId: string): Promise<OpportunityStats> {
        // Fetch raw counts with correct breakdown
        const { count: introCount } = await supabaseAdmin
            .from('inferred_relationships')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true);

        const { count: outboundCount } = await supabaseAdmin
            .from('prospects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .neq('status', 'rejected');

        const total = (introCount || 0) + (outboundCount || 0);

        // Calculate Success Rate based on 'Won' items in DB
        const { count: wonIntros } = await supabaseAdmin
            .from('inferred_relationships')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId).eq('status', 'Won');

        const { count: wonOutbound } = await supabaseAdmin
            .from('prospects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId).eq('status', 'Won');

        const totalWon = (wonIntros || 0) + (wonOutbound || 0);
        // Simple success rate: Won / Total * 100
        const successRate = total > 0 ? Math.round((totalWon / total) * 100) : 0;

        return {
            totalOpportunities: total,
            introOpportunities: introCount || 0,
            outboundOpportunities: outboundCount || 0,
            successRate: successRate
        };
    }

    static async requestIntro(userId: string, opportunityId: string): Promise<boolean> {
        // In a real app, this would write to the DB and trigger a notification/email
        console.log(`[OpportunityService] Requesting intro for opp ${opportunityId} by user ${userId}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate latency
        return true;
    }

    static async generateOutbound(userId: string, opportunityId: string): Promise<{ subject: string, body: string }> {
        // In a real app, this would call the InferenceService/OpenAI
        console.log(`[OpportunityService] Generating outbound for opp ${opportunityId} by user ${userId}`);
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate latency

        return {
            subject: "Propuesta de colaboración - IntroEngine",
            body: "Hola,\n\nMe gustaría explorar posibles sinergias entre nuestras empresas..."
        };
    }
}
