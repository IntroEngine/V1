import { NextResponse } from 'next/server';
import { OpportunityService } from '@/services/opportunityService';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { opportunityId } = body;

        if (!opportunityId) {
            return NextResponse.json({ error: 'Opportunity ID is required' }, { status: 400 });
        }

        const success = await OpportunityService.requestIntro(user.id, opportunityId);

        return NextResponse.json({ success });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to request intro' }, { status: 500 });
    }
}
