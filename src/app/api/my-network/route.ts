import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { NetworkService } from '@/services/networkService';
import { supabaseAdmin } from '@/config/supabase';

// Helper to get user ID (In a real app, use Supabase Auth helpers)
async function getUserId(request: Request) {
    // For now, if we are in dev/demo mode, we might want to hardcode a user ID
    // or try to get it from a header.
    // Let's assume there's a header strictly for this demo if auth isn't fully set up,
    // OR try to get it from the session if headers are passed.

    // TEMPORARY: Hardcoded for development to match the seed data or "user_1"
    // In production, we MUST verify the session token.
    return 'user_1';
}

export async function GET(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [profile, workHistory, connections, stats] = await Promise.all([
            NetworkService.getProfile(userId),
            NetworkService.getWorkHistory(userId),
            NetworkService.getConnections(userId),
            NetworkService.getNetworkStats(userId)
        ]);

        return NextResponse.json({
            profile,
            workHistory,
            connections,
            stats
        });

    } catch (error: any) {
        console.error('Error in GET /api/my-network:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
