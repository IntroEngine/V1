
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { InferenceService } from '@/services/inferenceService';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const result = await InferenceService.generateInferences(user.id);

        return NextResponse.json({
            success: true,
            message: `Generated ${result.created} opportunities`,
            data: result
        });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to refresh opportunities' }, { status: 500 });
    }
}
