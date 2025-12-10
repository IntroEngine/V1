import { NextResponse } from 'next/server';
import { NetworkService } from '@/services/networkService';

async function getUserId(request: Request) {
    return 'user_1';
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

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await NetworkService.deleteConnection(userId, id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
