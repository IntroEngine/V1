import { NextResponse } from 'next/server';
import { OpportunityService } from '@/services/opportunityService';

// Mock Auth
const getUserId = async (req: Request) => '00000000-0000-0000-0000-000000000001'

export async function GET(request: Request) {
    try {
        const userId = await getUserId(request);
        const opportunities = await OpportunityService.getOpportunities(userId);
        const stats = await OpportunityService.getStats(userId);

        return NextResponse.json({
            opportunities,
            stats
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch opportunities' }, { status: 500 });
    }
}
