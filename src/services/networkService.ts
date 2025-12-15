import { supabaseAdmin } from '@/config/supabase';
import {
    UserProfile,
    WorkHistory,
    UserConnection,
    NetworkStats,
    WorkHistoryFormData,
    ConnectionFormData,
    ProfileFormData,
    RELATIONSHIP_STRENGTH_LABELS
} from '@/types/network';

export class NetworkService {

    // ============================================
    // USER PROFILE
    // ============================================

    static async getProfile(userId: string): Promise<UserProfile | null> {
        const { data, error } = await supabaseAdmin
            .from('user_profiles')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error fetching profile:', error);
            throw error;
        }

        return data as UserProfile | null;
    }

    static async upsertProfile(userId: string, data: Partial<ProfileFormData>): Promise<UserProfile> {
        // First check if profile exists to merge or create
        const existing = await this.getProfile(userId);

        const payload: any = {
            user_id: userId,
            updated_at: new Date().toISOString(),
            ...data
        };

        // Recalculate completeness (simple logic, or call DB function)
        // We'll trust the DB trigger or recalculate here if needed.
        // For now let's use the DB function if we can, or just update the fields.

        const { data: result, error } = await supabaseAdmin
            .from('user_profiles')
            .upsert(payload)
            .select()
            .single();

        if (error) {
            console.error('Error upserting profile:', error);
            throw error;
        }

        // Trigger completeness calculation
        await supabaseAdmin.rpc('calculate_profile_completeness', { p_user_id: userId });

        // Fetch again to get updated scores
        return this.getProfile(userId) as Promise<UserProfile>;
    }

    // ============================================
    // WORK HISTORY
    // ============================================

    static async getWorkHistory(userId: string): Promise<WorkHistory[]> {
        const { data, error } = await supabaseAdmin
            .from('user_work_history')
            .select('*')
            .eq('user_id', userId)
            .order('is_current', { ascending: false }) // Current jobs first
            .order('end_date', { ascending: false, nullsFirst: true });

        if (error) throw error;
        return data as WorkHistory[];
    }

    static async addWorkHistory(userId: string, data: WorkHistoryFormData): Promise<WorkHistory> {
        const { data: result, error } = await supabaseAdmin
            .from('user_work_history')
            .insert({
                user_id: userId,
                ...data
            })
            .select()
            .single();

        if (error) throw error;

        // Update profile completeness
        await supabaseAdmin.rpc('calculate_profile_completeness', { p_user_id: userId });

        return result as WorkHistory;
    }

    static async updateWorkHistory(userId: string, id: string, data: Partial<WorkHistoryFormData>): Promise<WorkHistory> {
        const { data: result, error } = await supabaseAdmin
            .from('user_work_history')
            .update(data)
            .eq('id', id)
            .eq('user_id', userId) // Security check
            .select()
            .single();

        if (error) throw error;

        // Update profile completeness
        await supabaseAdmin.rpc('calculate_profile_completeness', { p_user_id: userId });

        return result as WorkHistory;
    }

    static async deleteWorkHistory(userId: string, id: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('user_work_history')
            .delete()
            .eq('id', id)
            .eq('user_id', userId); // Security check

        if (error) throw error;

        // Update profile completeness
        await supabaseAdmin.rpc('calculate_profile_completeness', { p_user_id: userId });
    }

    // ============================================
    // CONNECTIONS
    // ============================================

    static async getConnections(userId: string): Promise<UserConnection[]> {
        const { data, error } = await supabaseAdmin
            .from('user_connections')
            .select('*')
            .eq('user_id', userId)
            .order('relationship_strength', { ascending: false });

        if (error) throw error;
        return data as UserConnection[];
    }

    static async addConnection(userId: string, data: ConnectionFormData): Promise<UserConnection> {
        const { data: result, error } = await supabaseAdmin
            .from('user_connections')
            .insert({
                user_id: userId,
                ...data
            })
            .select()
            .single();

        if (error) throw error;

        // Update profile completeness
        await supabaseAdmin.rpc('calculate_profile_completeness', { p_user_id: userId });

        return result as UserConnection;
    }

    static async updateConnection(userId: string, id: string, data: Partial<ConnectionFormData>): Promise<UserConnection> {
        const { data: result, error } = await supabaseAdmin
            .from('user_connections')
            .update(data)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return result as UserConnection;
    }

    static async deleteConnection(userId: string, id: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('user_connections')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;

        // Update profile completeness
        await supabaseAdmin.rpc('calculate_profile_completeness', { p_user_id: userId });
    }

    // ============================================
    // STATS
    // ============================================

    // ============================================
    // OPPORTUNITIES
    // ============================================

    static async getOpportunities(userId: string): Promise<any[]> {
        const { data, error } = await supabaseAdmin
            .from('inferred_relationships')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('confidence_score', { ascending: false });

        if (error) {
            console.error('Error fetching opportunities:', error);
            return [];
        }

        // We need to fetch the bridge contact details (the UserConnection)
        // Optimization: Fetch all relevant connections in one go
        const companyNames = data.map(o => o.target_company).filter(Boolean);
        const { data: connections } = await supabaseAdmin
            .from('user_connections')
            .select('company_name, contact_count, relationship_strength, key_contacts')
            .eq('user_id', userId)
            .in('company_name', companyNames);

        const connMap = new Map<string, any>();
        if (connections) {
            connections.forEach(c => connMap.set(c.company_name, c));
        }

        return data.map(item => {
            const conn = connMap.get(item.target_company);
            // Construct meaningful bridge contact info
            let bridgeName = 'Unknown Connection';
            let bridgeRole = 'Connection';

            // Priority 1: Use the contact identified by AI Inference (e.g. the ICP match)
            if (item.supporting_data && item.supporting_data.bridge_contact) {
                bridgeName = item.supporting_data.bridge_contact.name || item.supporting_data.bridge_contact.firstName || 'Unknown';
                bridgeRole = item.supporting_data.bridge_contact.title || item.supporting_data.bridge_contact.role || 'Contact';
            }
            // Priority 2: Use the first contact from the connection
            else if (conn && conn.key_contacts && conn.key_contacts.length > 0) {
                const contact = conn.key_contacts[0];
                bridgeName = contact.name || 'Unknown';
                bridgeRole = contact.title || 'Contact';
            } else if (conn) {
                bridgeName = `${conn.contact_count} Contact(s)`;
            }

            return {
                id: item.id,
                type: item.inference_type === 'MUTUAL_CONNECTION' ? 'Intro' : 'Outbound', // Map inference type to UI type
                targetCompany: item.target_company,
                targetCompanyId: 'unknown', // We don't have this yet linked easily

                // Construct Target Contact (The person we want to meet)
                // For now, this is hypothetical/placeholder until we have enrichment
                targetContact: {
                    name: 'Decision Maker',
                    role: 'Relevant Role',
                    email: 'To be enriched'
                },

                // Construct Bridge Contact (The person who introduces us)
                bridgeContact: {
                    name: bridgeName,
                    role: bridgeRole,
                    relationshipStrength: conn ? (conn.relationship_strength * 20) : 0 // Convert 1-5 to 0-100 scale roughly equivalent
                },

                aiScore: item.confidence_score,
                reasoning: item.reasoning,
                status: 'Suggested', // Default
                createdDate: item.generated_at
            };
        });
    }

    static async getNetworkStats(userId: string): Promise<NetworkStats> {
        // Fetch all data in parallel
        const [profile, workHistory, connections] = await Promise.all([
            this.getProfile(userId),
            this.getWorkHistory(userId),
            this.getConnections(userId)
        ]);

        // Calculate stats
        const uniqueIndustries = new Set<string>();
        if (profile?.industries_expertise) {
            profile.industries_expertise.forEach(i => uniqueIndustries.add(i));
        }
        workHistory.forEach(w => {
            if (w.company_industry) uniqueIndustries.add(w.company_industry);
        });

        // Get true count of connections (bypass 1000 limit of the array)
        const { count: trueConnectionCount } = await supabaseAdmin
            .from('user_connections')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        // Intro opportunities count
        const { count: introCount } = await supabaseAdmin
            .from('inferred_relationships')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        return {
            total_companies_worked: workHistory.length,
            total_connections: trueConnectionCount || connections.length, // Fallback to array length
            total_industries: uniqueIndustries.size,
            total_intro_opportunities: introCount || 0,
            profile_completeness: profile?.profile_completeness || 0
        };
    }
    // ============================================
    // IMPORT
    // ============================================

    static async processImport(userId: string, contacts: any[]): Promise<{ added: number; updated: number; errors: number }> {
        let added = 0
        let updated = 0
        let errors = 0

        // 1. Group contacts by Company Name
        const companyMap = new Map<string, any[]>();

        contacts.forEach(c => {
            const companyName = c.company || c.companyName || c['Company Name'] || null;
            if (companyName) {
                if (!companyMap.has(companyName)) {
                    companyMap.set(companyName, []);
                }
                companyMap.get(companyName)!.push(c);
            }
        });

        // 2. Process Companies (Prospects) - Batch Operations
        const companies = Array.from(companyMap.keys());
        const companyIdMap = new Map<string, string>(); // Name -> UUID

        // Upsert companies into 'prospects'
        // We do this in chunks to avoid massive payloads
        const companyBatchSize = 50;
        for (let i = 0; i < companies.length; i += companyBatchSize) {
            const batchNames = companies.slice(i, i + companyBatchSize);

            const prospectsPayload = batchNames.map(name => ({
                user_id: userId,
                company_name: name,
                status: 'new', // Default status for imported companies
                source: 'linkedin_import',
                updated_at: new Date().toISOString()
            }));

            // Upsert (on conflict do nothing or update? update to get ID)
            const { data: upsertedCompanies, error: prospectError } = await supabaseAdmin
                .from('prospects')
                .upsert(prospectsPayload, {
                    onConflict: 'user_id,company_name',
                    ignoreDuplicates: false
                })
                .select('id, company_name'); // Need IDs

            if (prospectError) {
                console.error("Error upserting companies:", prospectError);
                errors += batchNames.length;
            } else if (upsertedCompanies) {
                upsertedCompanies.forEach(c => {
                    companyIdMap.set(c.company_name, c.id);
                });
            }
        }

        // 3. Process Contacts & User Connections
        // We will do both: 
        // A) Populate 'contacts' table (New Request)
        // B) Populate 'user_connections' (Legacy/Current View) 

        const contactPayloads: any[] = [];
        const connectionPayloads: any[] = [];

        for (const [companyName, people] of companyMap.entries()) {
            const companyId = companyIdMap.get(companyName);

            // Prepare 'contacts' payloads
            people.forEach(p => {
                const firstName = p.firstName || (p.name ? p.name.split(' ')[0] : 'Unknown');
                const lastName = p.lastName || (p.name ? p.name.split(' ').slice(1).join(' ') : '');

                contactPayloads.push({
                    user_id: userId,
                    company_id: companyId || null, // Link to prospect if exists
                    first_name: firstName,
                    last_name: lastName,
                    email: p.email || p.emailAddress || null,
                    linkedin_url: p.linkedin || p.linkedinUrl || null,
                    title: p.title || p.position || p.role || null,
                    source: 'linkedin',
                    created_at: new Date().toISOString()
                });
            });

            // Prepare 'user_connections' payload (Legacy)
            const keyContacts = people.map(p => {
                let role = p.title || p.position || p.role || null;
                if (role && (role.toLowerCase() === 'connection' || role.toLowerCase() === 'member')) {
                    role = null;
                }
                return {
                    name: p.name || p.firstName + ' ' + p.lastName || 'Unknown',
                    role: role,
                    email: p.email || p.emailAddress || null,
                    linkedin: p.linkedin || p.linkedinUrl || null,
                    connected_at: p.connectedOn || p.connected_at || null
                };
            });

            connectionPayloads.push({
                user_id: userId,
                company_name: companyName,
                relationship_strength: 1,
                contact_count: people.length,
                key_contacts: keyContacts,
                source: 'linkedin',
                connection_type: 'other',
                updated_at: new Date().toISOString()
            });
        }

        // Batch Insert Contacts
        const contactBatchSize = 100;
        for (let i = 0; i < contactPayloads.length; i += contactBatchSize) {
            const batch = contactPayloads.slice(i, i + contactBatchSize);
            const { error } = await supabaseAdmin
                .from('contacts')
                .upsert(batch, { onConflict: 'user_id,email', ignoreDuplicates: true }); // Avoid dupe emails

            if (error) {
                console.error("Error inserting contacts batch:", error);
                // Don't fail the whole import, just log
            } else {
                added += batch.length;
            }
        }

        // Batch Insert User Connections (Legacy)
        // Keep this to ensure "My Network" view still works
        for (let i = 0; i < connectionPayloads.length; i += 50) {
            const batch = connectionPayloads.slice(i, i + 50);
            await supabaseAdmin
                .from('user_connections')
                .upsert(batch, { onConflict: 'user_id,company_name' });
        }

        // 4. Update profile last_sync
        await supabaseAdmin.from('user_profiles').update({
            last_sync_at: new Date().toISOString()
        }).eq('user_id', userId);

        return { added, updated, errors };
    }
}

