import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';
import { WeeklyAdvisorEngine } from '@/services/weeklyAdvisorEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { data: accounts } = await supabaseAdmin.from('accounts').select('*').eq('is_active', true);
        if (!accounts) return NextResponse.json({ success: true, processed: 0 });

        console.log(`[Cron/Advisor] Generating reports for ${accounts.length} accounts.`);

        for (const acc of accounts) {
            try {
                await WeeklyAdvisorEngine.generateWeeklySummaryAndStore(acc.id);
            } catch (err) {
                console.error(`[Cron/Advisor] Error for account ${acc.id}`, err);
            }
        }

        return NextResponse.json({ success: true, processed: accounts.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
