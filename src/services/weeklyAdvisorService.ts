import { openai } from '@/config/openai';
import { PROMPTS } from '@/services/ai/prompts';

export interface WeeklyActivityLog {
    intros_generated: number;
    intros_requested: number;
    responses_received: number;
    outbound_suggested: number;
    wins: number;
    losses: number;
    top_industries?: string[];
}

export interface WeeklyAdvisorResult {
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

export class WeeklyAdvisorService {
    static async generateReport(activity: WeeklyActivityLog): Promise<WeeklyAdvisorResult> {
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: PROMPTS.WEEKLY_ADVISOR_AGENT },
                    {
                        role: "user", content: `
Datos de actividades de la semana:
${JSON.stringify(activity, null, 2)}
`
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error("No AI response");

            const result = JSON.parse(content);

            return {
                summary: {
                    intros_generated: result.summary?.intros_generated || "0",
                    intros_requested: result.summary?.intros_requested || "0",
                    responses: result.summary?.responses || "0",
                    outbound_pending: result.summary?.outbound_pending || "0",
                    wins: result.summary?.wins || "0",
                    losses: result.summary?.losses || "0"
                },
                insights: result.insights || [],
                recommended_actions: result.recommended_actions || []
            };

        } catch (error) {
            console.error("[WeeklyAdvisorService] Error:", error);
            return {
                summary: {
                    intros_generated: "N/A",
                    intros_requested: "N/A",
                    responses: "N/A",
                    outbound_pending: "N/A",
                    wins: "N/A",
                    losses: "N/A"
                },
                insights: ["Error generating insights"],
                recommended_actions: []
            };
        }
    }
}
