import { Opportunity, OpportunityStats } from '@/types/network';

export class OpportunityService {

    static async getOpportunities(userId: string): Promise<Opportunity[]> {
        // MOCK DATA
        return [
            {
                id: '1',
                type: 'Intro',
                targetCompany: 'TechCorp SA',
                targetCompanyId: '1',
                targetContact: {
                    name: 'Juan Pérez',
                    role: 'Chief Technology Officer',
                    email: 'juan.perez@techcorp.com'
                },
                bridgeContact: {
                    name: 'Ana García',
                    role: 'VP of Sales at Global Solutions',
                    relationshipStrength: 92
                },
                aiScore: 95,
                reasoning: 'Ana has a strong relationship with Juan from their time at Tech Summit 2024. Both work in enterprise tech sales.',
                status: 'Suggested',
                createdDate: '2024-12-08'
            },
            {
                id: '2',
                type: 'Outbound',
                targetCompany: 'InnovateX',
                targetCompanyId: '3',
                targetContact: {
                    name: 'Carlos Ruiz',
                    role: 'Engineering Director',
                    email: 'carlos.ruiz@innovatex.com'
                },
                aiScore: 82,
                reasoning: 'InnovateX recently announced Series B funding. Carlos is actively hiring for engineering roles, indicating growth phase.',
                status: 'In Progress',
                createdDate: '2024-12-05'
            },
            {
                id: '3',
                type: 'Intro',
                targetCompany: 'Alpha Logistics',
                targetCompanyId: '4',
                targetContact: {
                    name: 'María López',
                    role: 'Product Manager',
                    email: 'maria.lopez@alphalog.com'
                },
                bridgeContact: {
                    name: 'David Martínez',
                    role: 'Senior Developer at Beta Systems',
                    relationshipStrength: 78
                },
                aiScore: 88,
                reasoning: 'David and María worked together at a previous company. María is now leading product initiatives at Alpha Logistics.',
                status: 'Requested',
                createdDate: '2024-12-07'
            },
            {
                id: '4',
                type: 'Outbound',
                targetCompany: 'Beta Systems',
                targetCompanyId: '5',
                targetContact: {
                    name: 'Laura Fernández',
                    role: 'Head of Marketing',
                    email: 'laura.fernandez@betasys.net'
                },
                aiScore: 71,
                reasoning: 'Beta Systems is expanding into new markets. Laura recently posted about looking for partnership opportunities.',
                status: 'Suggested',
                createdDate: '2024-12-06'
            },
            {
                id: '5',
                type: 'Intro',
                targetCompany: 'Global Solutions',
                targetCompanyId: '2',
                targetContact: {
                    name: 'Pedro Sánchez',
                    role: 'CEO',
                    email: 'pedro.sanchez@globalsolutions.io'
                },
                bridgeContact: {
                    name: 'Juan Pérez',
                    role: 'CTO at TechCorp SA',
                    relationshipStrength: 85
                },
                aiScore: 92,
                reasoning: 'Juan and Pedro are both in the enterprise software space and have mutual connections from industry events.',
                status: 'Won',
                createdDate: '2024-11-28'
            }
        ];
    }

    static async getStats(userId: string): Promise<OpportunityStats> {
        return {
            totalOpportunities: 47,
            introOpportunities: 28,
            outboundOpportunities: 19,
            successRate: 34
        };
    }
}
