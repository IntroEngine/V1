import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { NetworkService } from '@/services/networkService';

async function getUserId(request: Request) {
    return 'user_1'; // TODO: Replace with real auth
}

export async function POST(request: Request) {
    try {
        const userId = await getUserId(request);
        const body = await request.json();

        // Validate body (or rely on Service/DB)
        const updatedProfile = await NetworkService.upsertProfile(userId, body);

        return NextResponse.json(updatedProfile);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
