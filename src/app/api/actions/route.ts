import { NextResponse } from 'next/server';
import { DashboardService } from '@/services/dashboardService';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const actions = await DashboardService.getRecommendedActions(user.id);

        return NextResponse.json(actions);
    } catch (error: any) {
        console.error('Error fetching actions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
