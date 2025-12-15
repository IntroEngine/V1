
import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { NetworkService } from '@/services/networkService';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const stats = await NetworkService.getNetworkStats(user.id);
        return NextResponse.json(stats);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
