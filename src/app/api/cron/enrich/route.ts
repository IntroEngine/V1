import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';
import { EnrichmentService } from '@/services/enrichmentService';

export const dynamic = 'force-dynamic'; // Ensure not cached

export async function GET(request: Request) {
    try {
        // 1. Get Active Accounts
        const { data: accounts, error } = await supabaseAdmin
            .from('accounts')
            .select('*')
            .eq('is_active', true);

        if (error || !accounts) {
            console.error("[Cron/Enrich] Failed to fetch accounts", error);
            return NextResponse.json({ error: 'Database error' }, { status: 500 });
        }

        console.log(`[Cron/Enrich] Starting enrichment for ${accounts.length} accounts.`);

        // 2. Iterate
        for (const acc of accounts) {
            try {
                await EnrichmentService.enrichAccountData(acc.id);
            } catch (err) {
                console.error(`[Cron/Enrich] Error for account ${acc.id}`, err);
            }
        }

        return NextResponse.json({ success: true, processed: accounts.length });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
