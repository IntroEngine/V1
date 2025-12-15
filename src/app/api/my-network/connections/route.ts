import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { NetworkService } from '@/services/networkService';

import { createClient } from '@/utils/supabase/server';

async function getUserId(request: Request) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
        throw new Error("Unauthorized");
    }
    return user.id;
}

export async function GET(request: Request) {
    try {
        const userId = await getUserId(request);
        const connections = await NetworkService.getConnections(userId);
        return NextResponse.json(connections);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userId = await getUserId(request);
        const body = await request.json();
        const result = await NetworkService.addConnection(userId, body);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const userId = await getUserId(request);
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const result = await NetworkService.updateConnection(userId, id, data);
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const userId = await getUserId(request);
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const deleteAll = searchParams.get('all') === 'true';

        if (deleteAll) {
            const supabase = await createClient();
            const { error } = await supabase
                .from('user_connections')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await NetworkService.deleteConnection(userId, id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
