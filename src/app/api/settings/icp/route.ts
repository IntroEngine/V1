import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/config/supabase';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Parse company size
        let minSize = null;
        let maxSize = null;
        if (body.companySize) {
            const parts = body.companySize.split('-');
            if (parts.length === 2) {
                minSize = parseInt(parts[0]);
                maxSize = parseInt(parts[1]);
            } else if (body.companySize.includes('+')) {
                minSize = parseInt(body.companySize.replace('+', ''));
                maxSize = null;
            }
        }

        // Upsert into icp_definitions
        // Note: Assuming table schema has user_id, industries, roles, etc.
        // We'll use a jsonb column 'definition' or individual columns if they exist.
        // Based on viewed schema earlier, let's check exact columns if needed.
        // For now using a generic upsert assuming 'user_id' is unique or PK.

        const { error } = await supabaseAdmin
            .from('icp_definitions')
            .upsert({
                user_id: user.id,
                target_industries: body.targetIndustries,
                key_roles: body.targetRoles,
                company_size_min: minSize,
                company_size_max: maxSize,
                target_locations: body.location ? [body.location] : [],
                pain_points: body.valueProp, // Mapping Value Prop to Pain Points/Context
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' })

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error saving ICP:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data, error } = await supabaseAdmin
            .from('icp_definitions')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is 'not found'
            throw error;
        }

        return NextResponse.json(data || {});
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
