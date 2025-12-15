import { NextResponse } from 'next/server';
import { NetworkService } from '@/services/networkService';
import { InferenceService } from '@/services/inferenceService';

import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = user.id;

        const body = await request.json();
        const { contacts } = body;

        if (!Array.isArray(contacts)) {
            return NextResponse.json({ error: 'Invalid data format. Expected "contacts" array.' }, { status: 400 });
        }

        console.log(`[API] Importing ${contacts.length} contacts for user ${userId}...`);
        if (contacts.length > 0) {
            console.log("[API] Sample contact:", contacts[0]);
        }

        const result = await NetworkService.processImport(userId, contacts);

        // Trigger Inference Engine
        const inferenceResult = await InferenceService.generateInferences(userId);

        return NextResponse.json({
            success: true,
            message: `Processed ${contacts.length} contacts. Generated ${inferenceResult.created} opportunities.`,
            stats: result,
            inference: inferenceResult
        });

    } catch (error: any) {
        console.error('Error in POST /api/my-network/import:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
    }
}
