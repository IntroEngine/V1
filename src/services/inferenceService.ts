import { supabaseAdmin } from '@/config/supabase';
import { UserConnection, WorkHistory } from '@/types/network';

type InferredRelationship = {
    user_id: string;
    target_company: string;
    bridge_company?: string;
    inference_type: 'ALUMNI' | 'INDUSTRY' | 'GEOGRAPHY' | 'MUTUAL_CONNECTION';
    confidence_score: number;
    reasoning: string;
    is_active: boolean;
    generated_at: string;
};

export class InferenceService {

    /**
     * Main entry point to generate inferences for a user.
     * Triggers analysis based on current connections and work history.
     */
    static async generateInferences(userId: string): Promise<{ created: number }> {
        console.log(`[InferenceService] Starting analysis for user ${userId}`);

        // 1. Fetch User Context
        const [connections, workHistory] = await Promise.all([
            this.getUserConnections(userId),
            this.getUserWorkHistory(userId)
        ]);

        if (connections.length === 0) {
            console.log("[InferenceService] No connections found. Skipping analysis.");
            return { created: 0 };
        }

        // 2. Run Inference Strategies
        // Strategy A: "Former Colleagues" Logic (Alumni)
        // Ensure we find connections who worked at the same company as the user (implicit in "ex-colleague" connection type)
        // OR explicit match of connection.company_name == workHistory.company_name

        // Strategy B: "Direct Access" (Current Role)
        // If a connection works at a target company now.
        // For this MVP, since we don't have a rigid "Target List", we will treat ALL strong connections at reputable companies as opportunities.
        // Or better: filter for Companies that look interesting (mock heuristic).

        const inferences: InferredRelationship[] = [];

        // --- Logic: Direct Connect (Strong Connections) ---
        // "You know someone at Company X"
        connections.forEach(conn => {
            // Filter: Only consider strong relationships (>= 3) and valid companies
            if (conn.relationship_strength >= 3 && conn.company_name) {
                inferences.push({
                    user_id: userId,
                    target_company: conn.company_name,
                    bridge_company: undefined, // Direct
                    inference_type: 'MUTUAL_CONNECTION', // or DIRECT if we had it in enum. Schema says MUTUAL_CONNECTION is closest for "I know a guy"
                    confidence_score: 80 + (conn.relationship_strength * 4), // Base 80, up to 100
                    reasoning: `Strong connection with ${conn.contact_count > 0 ? 'contacts' : 'a contact'} at ${conn.company_name}`,
                    is_active: true,
                    generated_at: new Date().toISOString()
                });
            }
        });

        // --- Logic: Alumni (Shared Past) ---
        // "You worked at Google. This person works at Apple but used to work at Google." 
        // (This requires scraping past history of connections, which we might not have fully parsed yet from "raw_data" or "key_contacts").
        // Simplified Alumni: "You worked at X. We found a connection who is now at Y, but we know they are 'ex-colleague'."
        // This implies an intro path to Y via shared history at X.

        workHistory.forEach(job => {
            const colleagues = connections.filter(c =>
                // Logic: A connection created manually as 'ex-colleague'
                c.connection_type === 'ex-colleague' ||
                // Or if we had deeper data, check matching past companies.
                // For now, use the 'connection_type' field.
                c.tags?.includes(job.company_name) // Hacky tag matching
            );

            colleagues.forEach(colleague => {
                if (colleague.company_name && colleague.company_name !== job.company_name) {
                    // They are at a NEW company now. Opportunity!
                    inferences.push({
                        user_id: userId,
                        target_company: colleague.company_name,
                        bridge_company: job.company_name, // The shared context
                        inference_type: 'ALUMNI',
                        confidence_score: 85,
                        reasoning: `Former colleague from ${job.company_name} is now at ${colleague.company_name}`,
                        is_active: true,
                        generated_at: new Date().toISOString()
                    });
                }
            });
        });

        // 3. Deduplicate and Persist
        // We might generate multiple paths to the same company. Pick the best one?
        // For MVP, simple dedupe by Target Company.
        const bestInferences = this.deduplicateByCompany(inferences);

        if (bestInferences.length > 0) {
            // Clear old active inferences (optional, or just upsert)
            // await supabaseAdmin.from('inferred_relationships').delete().eq('user_id', userId);

            const { error } = await supabaseAdmin
                .from('inferred_relationships')
                .upsert(bestInferences, { onConflict: 'id' as any }); // Schema doesn't have unique constraint on target_company yet, relying on ID or new inserts.

            // Note: Schema has no unique constraint on (user_id, target_company). 
            // Better to delete old ones or check existence. 
            // Let's delete old active ones to refresh the list for now. Since ID is UUID gen.

            // Safe approach: Delete all for user before inserting new snapshot logic
            await supabaseAdmin.from('inferred_relationships').delete().eq('user_id', userId);

            const { error: insertError } = await supabaseAdmin
                .from('inferred_relationships')
                .insert(bestInferences);

            if (insertError) console.error("Error saving inferences:", insertError);
        }

        console.log(`[InferenceService] Generated ${bestInferences.length} opportunities`);
        return { created: bestInferences.length };
    }

    private static async getUserConnections(userId: string): Promise<UserConnection[]> {
        const { data } = await supabaseAdmin.from('user_connections').select('*').eq('user_id', userId);
        return (data as UserConnection[]) || [];
    }

    private static async getUserWorkHistory(userId: string): Promise<WorkHistory[]> {
        const { data } = await supabaseAdmin.from('user_work_history').select('*').eq('user_id', userId);
        return (data as WorkHistory[]) || [];
    }

    private static deduplicateByCompany(items: InferredRelationship[]): InferredRelationship[] {
        const map = new Map<string, InferredRelationship>();
        items.forEach(item => {
            const existing = map.get(item.target_company);
            if (!existing || item.confidence_score > existing.confidence_score) {
                map.set(item.target_company, item);
            }
        });
        return Array.from(map.values());
    }
}
