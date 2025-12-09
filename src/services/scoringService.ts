import { Opportunity, Target, Contact } from '@/db/schema';
import { openai } from '@/config/openai';
import { PROMPTS } from '@/services/ai/prompts';

export interface ScoringResult {
    scores: {
        industry_fit_score: number;
        buying_signal_score: number;
        intro_strength_score: number;
        lead_potential_score: number;
    };
    explanation: string;
}

export class ScoringService {
    static async calculateScores(opportunity: Partial<Opportunity>, target: Target, contact?: Contact): Promise<ScoringResult> {
        try {

            const context = {
                company: {
                    name: target.name,
                    industry: target.industry || 'Unknown',
                    size: target.size_range || 'Unknown'
                },
                contact: contact ? {
                    name: contact.name,
                    role: contact.current_title,
                    relation: 'Bridge/Connection'
                } : { relation: 'None (Cold Outbound)' },
                opportunity_type: opportunity.type
            };

            const completion = await openai.chat.completions.create({
                model: "gpt-4-turbo", // or gpt-4o
                messages: [
                    { role: "system", content: PROMPTS.SCORING_AGENT },
                    {
                        role: "user", content: `
Datos para analizar:
${JSON.stringify(context, null, 2)}
`
                    }
                ],
                response_format: { type: "json_object" }
            });

            const content = completion.choices[0].message.content;
            if (!content) throw new Error("No AI response");

            const result = JSON.parse(content);

            // Safety defaults
            return {
                scores: {
                    industry_fit_score: result.scores?.industry_fit_score || 0,
                    buying_signal_score: result.scores?.buying_signal_score || 0,
                    intro_strength_score: result.scores?.intro_strength_score || 0,
                    lead_potential_score: result.scores?.lead_potential_score || 0
                },
                explanation: result.explanation || "No explanation provided."
            };

        } catch (error) {
            console.error("[ScoringService] Error:", error);
            return {
                scores: {
                    industry_fit_score: 50,
                    buying_signal_score: 0,
                    intro_strength_score: 0,
                    lead_potential_score: 20
                },
                explanation: "Error in scoring calculation."
            };
        }
    }
}
