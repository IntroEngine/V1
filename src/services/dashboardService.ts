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
        // 1. Intros Suggested: Active inferred relationships of type ALUMNI or MUTUAL_CONNECTION
        const { count: introCount } = await supabaseAdmin
            .from('inferred_relationships')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true)
            .in('inference_type', ['ALUMNI', 'MUTUAL_CONNECTION']);

        // 2. Intros Requested (Mock for now, or check a separate table/status if it existed)
        // For MVP we don't have a 'requests' table, so we return 0 or mock.
        const introsRequested = 0;

        // 3. Outbound Suggested (Mock or from 'prospects' table if populated)
        const { count: outboundCount } = await supabaseAdmin
            .from('prospects')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('status', 'new');

        // 4. Won Deals (Mock)
        const wonDeals = 0;

        return {
            introsSuggested: introCount || 0,
            introsRequested,
            outboundSuggested: outboundCount || 0,
            wonDeals
        }
    }

    static async getRecentOpportunities(userId: string, limit = 5): Promise<any[]> {
        const { data } = await supabaseAdmin
            .from('inferred_relationships')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('confidence_score', { ascending: false })
            .limit(limit);

        if (!data) return [];

        return data.map(item => ({
            id: item.id,
            company: item.target_company,
            type: 'Intro', // Inferred are mostly Intros for now
            score: item.confidence_score,
            status: 'Suggested' // Default status for new inferences
        }));
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

        // Action 2: Low Data?
        const { count: connections } = await supabaseAdmin
            .from('user_connections')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (!connections || connections < 10) {
            actions.push({
                id: 'a2',
                title: 'Importar Contactos',
                description: 'Importa más contactos de LinkedIn para generar mejores oportunidades.',
                priority: 'High'
            });
        }

        return actions;
    }
}
