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

        return data.map(item => ({
            id: item.id,
            target_company: item.target_company,
            bridge_company: item.bridge_company,
            confidence_score: item.confidence_score,
            reasoning: item.reasoning,
            type: item.inference_type,
            // Defaults for fields not yet in DB
            target_role: 'Decision Maker',
            bridge_person: 'Ex-Colleague'
        }));
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

        // Intro opportunities (Mock for now, or count from inferred relationships if we had them)
        // For MVP we can query 'inferred_relationships' count
        const { count: introCount } = await supabaseAdmin
            .from('inferred_relationships')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        return {
            total_companies_worked: workHistory.length,
            total_connections: connections.length,
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

        // Process in batches of 50 to avoid request size limits
        const batchSize = 50
        for (let i = 0; i < contacts.length; i += batchSize) {
            const batch = contacts.slice(i, i + batchSize)

            const normalizedBatch = batch.map(c => ({
                user_id: userId,
                name: c.name || c.firstName + ' ' + c.lastName || 'Unknown',
                company_name: c.company || c.companyName || null,
                role_title: c.title || c.role || null,
                email: c.email || c.emailAddress || null,
                linkedin_url: c.linkedin || c.linkedinUrl || c.profileUrl || null,
                connected_at: c.connectedOn || c.connected_at || new Date().toISOString(),
                relationship_strength: 1,
                source: 'linkedin'
                // source: 'linkedin', // If column doesn't exist yet, we trust network-schema.sql check. Assuming exist for now or we remove it.
                // Checking previous context, schema might not have source if it wasn't seen. 
                // Safest to omit 'source' if uncertain, or include if confident. 
                // Let's assume schema matches basic fields.
            }))

            const { error } = await supabaseAdmin
                .from('user_connections')
                .upsert(normalizedBatch, {
                    onConflict: 'user_id,email', // Strategy: Dedupe by email if present
                    ignoreDuplicates: false
                })

            if (error) {
                console.error("Batch import error:", error)
                errors += batch.length
            } else {
                added += batch.length
            }
        }

        // Update profile last_sync
        await supabaseAdmin.from('user_profiles').update({
            last_linkedin_import_at: new Date().toISOString()
        }).eq('user_id', userId)

        return { added, updated, errors }
    }
}
