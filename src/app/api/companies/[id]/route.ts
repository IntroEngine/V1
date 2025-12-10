import { NextResponse } from 'next/server';
import { CompanyService } from '@/services/companyService';

// Mock Auth - replace with actual auth
const getUserId = async (req: Request) => '00000000-0000-0000-0000-000000000001'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId(request);
        const body = await request.json();

        await CompanyService.updateCompany(userId, params.id, body);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to update company' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId(request);

        await CompanyService.deleteCompany(userId, params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
    }
}
