import { NextResponse } from 'next/server';
import { DashboardService } from '@/services/dashboardService';
import { createClient } from '@/utils/supabase/server';

const getUserId = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
}

export async function GET(request: Request) {
    try {
        const userId = await getUserId();
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
