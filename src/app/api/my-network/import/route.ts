import { NextResponse } from 'next/server';
import { NetworkService } from '@/services/networkService';
import { InferenceService } from '@/services/inferenceService';

// Mock Auth - replace with actual auth in prod
const getUserId = async (req: Request) => '00000000-0000-0000-0000-000000000001'

export async function POST(request: Request) {
    try {
        const userId = await getUserId(request);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { contacts } = body;

        if (!Array.isArray(contacts)) {
            return NextResponse.json({ error: 'Invalid data format. Expected "contacts" array.' }, { status: 400 });
        }

        console.log(`[API] Importing ${contacts.length} contacts for user ${userId}...`);

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
