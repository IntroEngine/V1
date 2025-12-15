import { NextResponse } from 'next/server';
import { CompanyService } from '@/services/companyService';

import { createClient } from '@/utils/supabase/server';

const getUserId = async () => {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const userId = await getUserId();
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
        const userId = await getUserId();

        await CompanyService.deleteCompany(userId, params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete company' }, { status: 500 });
    }
}
