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
    // Using a valid UUID to avoid Postgres "invalid input syntax for type uuid" error
    return '00000000-0000-0000-0000-000000000001';
}

export async function GET(request: Request) {
    try {
        const userId = await getUserId(request);
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
        console.warn('Error in GET /api/my-network (Returning Mock Data):', error);

        // Fallback Mock Data for Demo/Dev when DB connection fails (e.g. missing Service Role Key)
        return NextResponse.json({
            profile: {
                user_id: 'mock-user',
                current_company: 'Demo Company',
                current_title: 'Product Owner',
                current_location: 'Madrid, Spain',
                industries_expertise: ['SaaS', 'B2B'],
                strengths_tags: ['Product', 'Strategy'],
                profile_completeness: 45
            },
            workHistory: [],
            connections: [],
            stats: {
                total_companies_worked: 0,
                total_connections: 0,
                total_industries: 2,
                total_intro_opportunities: 0,
                profile_completeness: 45
            },
            opportunities: [
                {
                    id: 'mock-1',
                    target_company: 'Acme Corp',
                    target_role: 'VP Engineering',
                    bridge_company: 'TechCorp SA',
                    bridge_person: 'Sarah Smith',
                    confidence_score: 95,
                    reasoning: 'Strong alumni connection found via TechCorp SA',
                    type: 'ALUMNI'
                },
                {
                    id: 'mock-2',
                    target_company: 'Globex Inc',
                    target_role: 'CTO',
                    bridge_company: 'StartupHub',
                    bridge_person: 'Mike Jones',
                    confidence_score: 85,
                    reasoning: 'Mutual industry event participation',
                    type: 'INDUSTRY'
                }
            ]
        });
    }
}
