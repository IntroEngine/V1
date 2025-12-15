
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { NetworkService } from '@/services/networkService';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { contacts } = body;

        if (!contacts || !Array.isArray(contacts)) {
            return NextResponse.json({ error: 'Invalid payload: contacts array required' }, { status: 400 });
        }

        console.log(`Processing bulk import for user ${user.id} with ${contacts.length} contacts`);

        // Use NetworkService.processImport which handles:
        // 1. Company creation (prospects)
        // 2. Contact creation linked to company
        // 3. UserConnections aggregation
        const result = await NetworkService.processImport(user.id, contacts);

        return NextResponse.json({
            success: true,
            message: `Processed ${contacts.length} contacts`,
            stats: result
        });

    } catch (error: any) {
        console.error('Bulk import error:', error);
        return NextResponse.json({
            error: 'Failed to process import',
            details: error.message
        }, { status: 500 });
    }
}
