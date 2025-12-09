import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';
import { RelationshipEngine } from '@/services/relationshipEngine';
import { OutboundEngine } from '@/services/outboundEngine';
import { ScoringEngine } from '@/services/scoringEngine';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { data: accounts } = await supabaseAdmin.from('accounts').select('*').eq('is_active', true);
        if (!accounts) return NextResponse.json({ success: true, processed: 0 });

        console.log(`[Cron/Opportunities] Processing ${accounts.length} accounts.`);

        for (const acc of accounts) {
            try {
                console.log(`[Cron/Opportunities] Processing Account: ${acc.id}`);

                // 1. Recalculate Relationships (Intros)
                await RelationshipEngine.recalculateIntroOpportunitiesForAccount(acc.id);

                // 2. Geneate Outbound (where intros missing)
                await OutboundEngine.autoGenerateOutboundForAccount(acc.id);

                // 3. Score everything
                await ScoringEngine.scoreAllOpportunitiesForAccount(acc.id);

            } catch (err) {
                console.error(`[Cron/Opportunities] Error for account ${acc.id}`, err);
            }
        }

        return NextResponse.json({ success: true, processed: accounts.length });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
