import { NextResponse } from 'next/server';
import { DashboardService } from '@/services/dashboardService';

// Mock Auth - replace with actual auth in prod
const getUserId = async (req: Request) => '00000000-0000-0000-0000-000000000001'

export async function GET(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [stats, opportunities, actions] = await Promise.all([
            DashboardService.getStats(userId),
            DashboardService.getRecentOpportunities(userId),
            DashboardService.getRecommendedActions(userId)
        ]);

        return NextResponse.json({
            stats,
            opportunities,
            actions
        });

    } catch (error: any) {
        console.error('Error in GET /api/dashboard/stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
