import { supabaseAdmin } from '@/config/supabase';
import { InferredRelationship, NetworkStats } from '@/types/network';

export type DashboardStats = {
    introsSuggested: number;
    introsRequested: number;
    outboundSuggested: number;
    wonDeals: number;
}

export type DashboardAction = {
    id: string;
    title: string;
    description: string;
    priority: 'High' | 'Medium';
}

export class DashboardService {

    static async getStats(userId: string): Promise<DashboardStats> {
        // 1. Capa 2: Network Matches (icp_match_score > 40)
        // Only count those that are still 'Suggested' or 'new'
        const { count: capa2Count } = await supabaseAdmin
            .from('user_connections')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gt('icp_match_score', 40);

        // 2. Capa 3: AI Inferred Relationships (Active)
        // Count statuses separately
        const { count: introSuggested } = await supabaseAdmin
            .from('inferred_relationships')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true)
            .eq('status', 'Suggested');

        const { count: introRequested } = await supabaseAdmin
            .from('inferred_relationships')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true)
            .in('status', ['Requested', 'In Progress']);

        const { count: introWon } = await supabaseAdmin
            .from('inferred_relationships')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true)
            .eq('status', 'Won');

        // 3. Outbound Suggested (Prospects New)
        const { count: outboundSuggested } = await supabaseAdmin
            .from('prospects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .in('status', ['new', 'Suggested']);

        const { count: outboundWon } = await supabaseAdmin
            .from('prospects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'Won');

        return {
            introsSuggested: (capa2Count || 0) + (introSuggested || 0),
            introsRequested: introRequested || 0,
            outboundSuggested: outboundSuggested || 0,
            wonDeals: (introWon || 0) + (outboundWon || 0)
        }
    }

    static async getRecentOpportunities(userId: string, limit = 5): Promise<any[]> {
        // Fetch Capa 2 Matches
        const { data: capa2 } = await supabaseAdmin
            .from('user_connections')
            .select('id, company_name, icp_match_score, icp_match_type')
            .eq('user_id', userId)
            .gt('icp_match_score', 40)
            .order('icp_match_score', { ascending: false })
            .limit(limit);

        // Fetch Capa 3 Inferences
        const { data: capa3 } = await supabaseAdmin
            .from('inferred_relationships')
            .select('id, target_company, confidence_score, inference_type')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('confidence_score', { ascending: false })
            .limit(limit);

        // Normalize and Merge
        const opportunities = [
            ...(capa2 || []).map(c => ({
                id: c.id,
                company: c.company_name,
                type: 'Intro', // Direct connections are always Intros
                score: c.icp_match_score,
                status: 'Suggested'
            })),
            ...(capa3 || []).map(c => ({
                id: c.id,
                company: c.target_company,
                type: ['MUTUAL_CONNECTION', 'ALUMNI'].includes(c.inference_type) ? 'Intro' : 'Outbound',
                score: c.confidence_score,
                status: 'Suggested'
            }))
        ];

        // Sort by score and take top N
        return opportunities
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
    }

    static async getRecommendedActions(userId: string): Promise<DashboardAction[]> {
        const actions: DashboardAction[] = [];

        // Action 1: New Intros?
        const { count: newIntros } = await supabaseAdmin
            .from('inferred_relationships')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true)
            .gte('confidence_score', 80);

        if (newIntros && newIntros > 0) {
            actions.push({
                id: 'a1',
                title: 'Revisar Intros Nuevas',
                description: `Tienes ${newIntros} nuevas intros con alta confianza esperando revisión.`,
                priority: 'High'
            });
        }

        // Action 2: Low Data check removed to avoid appearing as "mock data" for new users
        // Use this space for future actionable insights based on real activity

        return actions;
    }
}
