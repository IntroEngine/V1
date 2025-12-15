import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { NetworkService } from '@/services/networkService';
import { createClient } from '@/utils/supabase/server';

// Helper to get user ID
async function getUserId() {
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

        const [profile, workHistory, connections, stats, opportunities] = await Promise.all([
            NetworkService.getProfile(userId),
            NetworkService.getWorkHistory(userId),
            NetworkService.getConnections(userId),
            NetworkService.getNetworkStats(userId),
            NetworkService.getOpportunities(userId)
        ]);

        return NextResponse.json({
            profile,
            workHistory,
            connections,
            stats,
            opportunities
        });

    } catch (error: any) {
        console.error('Error in GET /api/my-network:', error);
        return NextResponse.json({
            error: 'Failed to fetch network data',
            details: error.message
        }, { status: 500 });
    }
}
