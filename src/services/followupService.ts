import { EnrichedOpportunity } from '@/db/schema';
import { openai } from '@/config/openai';
import { PROMPTS } from '@/services/ai/prompts';

export interface FollowUpResult {
    followups: {
        bridge_contact?: string;
        prospect?: string;
        outbound?: string;
    };
}

export class FollowUpService {
    static async generateFollowUps(opportunity: EnrichedOpportunity, daysWaiting: number): Promise<FollowUpResult> {
        try {

            const context = {
                opportunity_json: {
                    id: opportunity.id,
                    type: opportunity.type,
                    status: opportunity.status,
                    company: opportunity.target?.name,
                    contact: opportunity.contact?.name
                },
                days_waiting: daysWaiting
            };

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: PROMPTS.FOLLOWUP_AGENT },
                    {
                        role: "user", content: `
Estado de la oportunidad:
${JSON.stringify(context.opportunity_json)}

Días sin respuesta:
${context.days_waiting}
`
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error("No AI response");

            const result = JSON.parse(content);

            return {
                followups: {
                    bridge_contact: result.followups?.bridge_contact,
                    prospect: result.followups?.prospect,
                    outbound: result.followups?.outbound
                }
            };

        } catch (error) {
            console.error("[FollowUpService] Error:", error);
            return {
                followups: {}
            };
        }
    }
}
