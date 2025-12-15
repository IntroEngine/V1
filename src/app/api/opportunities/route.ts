import { NextResponse } from 'next/server';
import { OpportunityService } from '@/services/opportunityService';
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
