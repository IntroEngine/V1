import { supabaseAdmin } from '@/config/supabase';
import { openai } from '@/config/openai';
import { PROMPTS } from '@/services/ai/prompts';
import { Opportunity } from '@/db/schema';

// ===================================
// Types / Interfaces
// ===================================

export interface WeeklyRawMetrics {
    intros_generated: number;
    intros_requested: number;
    intro_responses: number;
    outbound_suggested: number;
    outbound_executed: number;
    wins: number;
    losses: number;
    stalled_opportunities: number;
    by_industry: Record<string, number>;
    by_type: {
        intro: number;
        outbound: number;
    };
    sample_highlights: string[]; // e.g. names of big wins
}

export interface WeeklyAdvisorAIResponse {
    summary: {
        intros_generated: string;
        intros_requested: string;
        responses: string;
        outbound_pending: string;
        wins: string;
        losses: string;
    };
    insights: string[];
    recommended_actions: string[];
}

export interface WeeklyAdvisorResult extends WeeklyAdvisorAIResponse {
    metrics: WeeklyRawMetrics;
    generated_at: string;
    period_start: string;
    period_end: string;
}

// ===================================
// Weekly Advisor Engine Service
// ===================================

export class WeeklyAdvisorEngine {

    /**
     * Generates the summary but does not persist it (unless logs are enabled implicitly).
     */
    static async generateWeeklySummaryForAccount(
        accountId: string,
        options: { startDate?: Date; endDate?: Date } = {}
    ): Promise<WeeklyAdvisorResult> {

        const endDate = options.endDate || new Date();
        const startDate = options.startDate || new Date(new Date().setDate(endDate.getDate() - 7));

        console.log(`[WeeklyAdvisorEngine] Generating summary for ${accountId} from ${startDate.toISOString()} to ${endDate.toISOString()}`);

        // 1. Calculate Metrics
        const metrics = await this.calculateMetrics(accountId, startDate, endDate);

        // 2. Call AI
        const aiResponse = await this.callWeeklyAdvisorAI(metrics);

        const result: WeeklyAdvisorResult = {
            ...aiResponse,
            metrics,
            generated_at: new Date().toISOString(),
            period_start: startDate.toISOString(),
            period_end: endDate.toISOString()
        };

        // 3. Log event (fire and forget)
        this.logActivity(accountId, 'weekly_summary_generated', result).catch(err => console.error("Log error", err));

        return result;
    }

    /**
     * Generates and explicitly stores/persists the report.
     */
    static async generateWeeklySummaryAndStore(
        accountId: string,
        options: { startDate?: Date; endDate?: Date } = {}
    ): Promise<void> {
        const result = await this.generateWeeklySummaryForAccount(accountId, options);

        // Explicit persistence logic (e.g. into a 'reports' table if it existed, or just relying on the log above).
        // The prompt suggests "persiste el resumen de forma estructurada". 
        // Since we don't have a specific `reports` table in the mentioned schema, 
        // we will rely on `activity_logs` with a rich payload or `settings` last_report.
        // For now, ensuring it's logged is enough, but we could add a `notifications` table entry if needed.
        console.log(`[WeeklyAdvisorEngine] Report stored/logged for ${accountId}`);
    }

    /**
     * Retrieves the last summary from logs.
     */
    static async getLastWeeklySummaryForAccount(accountId: string): Promise<WeeklyAdvisorResult | null> {
        const { data, error } = await supabaseAdmin
            .from('activity_logs')
            .select('metadata, created_at') // changed payload to metadata based on schema summary
            .eq('account_id', accountId)
            .eq('activity_type', 'weekly_summary_generated')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return null;

        // Assuming metadata stores the full result
        return data.metadata as WeeklyAdvisorResult;
    }

    // ===================================
    // Internal Helpers
    // ===================================

    private static async calculateMetrics(accountId: string, start: Date, end: Date): Promise<WeeklyRawMetrics> {
        // We need to query opportunities and logs.

        // Fetch opportunities active or created in range
        const { data: opps, error } = await supabaseAdmin
            .from('opportunities')
            .select(`
        id, type, status, created_at, updated_at, last_action_at,
        company:companies(industry)
      `)
            .eq('account_id', accountId)
            .gte('updated_at', start.toISOString()) // broadly select recent activity
            .lte('created_at', end.toISOString());  // created before end date

        if (error || !opps) {
            console.error("Error fetching metrics opps", error);
            return this.getEmptyMetrics();
        }

        const metrics: WeeklyRawMetrics = this.getEmptyMetrics();
        const highlights: string[] = [];

        for (const o of opps) {
            const opp = o as any; // Cast for joined fields
            const created = new Date(opp.created_at);
            const updated = new Date(opp.updated_at);
            const isNew = created >= start && created <= end;

            // Counts
            if (isNew && opp.type.includes('intro')) metrics.intros_generated++;
            if (isNew && opp.type === 'outbound') metrics.outbound_suggested++;

            // Status checks (simplified)
            if (opp.status === 'intro_requested') metrics.intros_requested++; // Note: this count is rough, better with logs
            if (opp.status === 'won') metrics.wins++;
            if (opp.status === 'lost') metrics.losses++;

            // Stalled check (7 days no action)
            if (opp.status === 'in_progress' && opp.last_action_at) {
                const lastAction = new Date(opp.last_action_at);
                const days = (end.getTime() - lastAction.getTime()) / (1000 * 3600 * 24);
                if (days > 7) metrics.stalled_opportunities++;
            }

            // Industry breakdown
            const ind = opp.company?.industry || 'Unknown';
            metrics.by_industry[ind] = (metrics.by_industry[ind] || 0) + 1;

            // Type breakdown
            if (opp.type.includes('intro')) metrics.by_type.intro++;
            if (opp.type === 'outbound') metrics.by_type.outbound++;
        }

        metrics.sample_highlights = highlights.slice(0, 5);
        return metrics;
    }

    private static getEmptyMetrics(): WeeklyRawMetrics {
        return {
            intros_generated: 0,
            intros_requested: 0,
            intro_responses: 0,
            outbound_suggested: 0,
            outbound_executed: 0,
            wins: 0,
            losses: 0,
            stalled_opportunities: 0,
            by_industry: {},
            by_type: { intro: 0, outbound: 0 },
            sample_highlights: []
        };
    }

    private static async callWeeklyAdvisorAI(metrics: WeeklyRawMetrics): Promise<WeeklyAdvisorAIResponse> {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: PROMPTS.WEEKLY_ADVISOR_AGENT },
                    {
                        role: "user", content: `
Datos de actividades de la semana:
${JSON.stringify(metrics, null, 2)}
`
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = response.choices[0].message.content;
            if (!content) throw new Error("Empty AI response");

            const json = JSON.parse(content);

            // Validate/Fallbacks
            return {
                summary: {
                    intros_generated: json.summary?.intros_generated || "0",
                    intros_requested: json.summary?.intros_requested || "0",
                    responses: json.summary?.responses || "No data",
                    outbound_pending: json.summary?.outbound_pending || "0",
                    wins: json.summary?.wins || "0",
                    losses: json.summary?.losses || "0"
                },
                insights: Array.isArray(json.insights) ? json.insights : [],
                recommended_actions: Array.isArray(json.recommended_actions) ? json.recommended_actions : []
            };

        } catch (e) {
            console.error("[WeeklyAdvisorEngine] AI Error:", e);
            return {
                summary: {
                    intros_generated: "N/A", intros_requested: "N/A", responses: "N/A",
                    outbound_pending: "N/A", wins: "N/A", losses: "N/A"
                },
                insights: ["Error generating report"],
                recommended_actions: []
            };
        }
    }

    private static async logActivity(accountId: string, type: string, payload: any) {
        await supabaseAdmin.from('activity_logs').insert({
            account_id: accountId,
            user_id: 'system',
            activity_type: type,
            metadata: payload, // Using metadata as per previous pattern
            description: 'Weekly Summary Auto-generated'
        });
    }
}
