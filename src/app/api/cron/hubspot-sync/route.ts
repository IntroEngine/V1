import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';
import { HubSpotService } from '@/services/hubspotService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { data: accounts } = await supabaseAdmin.from('accounts').select('*').eq('is_active', true);
        if (!accounts) return NextResponse.json({ success: true, processed: 0 });

        console.log(`[Cron/HubSpot] Syncing ${accounts.length} accounts.`);

        for (const acc of accounts) {
            try {
                await HubSpotService.syncAllPendingOpportunitiesToHubSpot(acc.id);
            } catch (err) {
                console.error(`[Cron/HubSpot] Error for account ${acc.id}`, err);
            }
        }

        return NextResponse.json({ success: true, processed: accounts.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
