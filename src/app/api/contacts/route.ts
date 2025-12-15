import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { ContactService } from '@/services/contactService';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log(`[API/Contacts] Fetching for user: ${user.id}`);
        const contacts = await ContactService.getContacts(user.id);

        const mappedContacts = contacts.map(c => ({
            id: c.id,
            firstName: c.first_name || 'Unknown',
            lastName: c.last_name || '',
            email: c.email || '',
            company: (c as any).company_name || 'Unknown',
            companyId: c.company_id,
            role: c.title || c.role || 'Connection',
            seniority: 'IC',
            relationshipStrength: 20, // TODO: Store this in DB or separate table
            introPotential: 0,
            lastContactDate: c.created_at,
            hubspotSynced: !!c.hubspot_contact_id,
            linkedinUrl: c.linkedin_url,
            phone: c.phone
        }));

        return NextResponse.json(mappedContacts);

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}

async function resolveCompanyId(supabase: any, userId: string, companyName: string): Promise<string | null> {
    if (!companyName) return null;

    // 1. Check if exists
    const { data: existing } = await supabase
        .from('prospects')
        .select('id')
        .eq('user_id', userId)
        .ilike('company_name', companyName)
        .maybeSingle();

    if (existing) return existing.id;

    // 2. Create if not
    const { data: newCompany, error } = await supabase
        .from('prospects')
        .insert({
            user_id: userId,
            company_name: companyName,
            status: 'new',
            source: 'contact_creation'
        })
        .select('id')
        .single();

    if (error) {
        console.error('Error creating company:', error);
        return null;
    }
    return newCompany.id;
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Resolve Company ID
        const companyId = await resolveCompanyId(supabase, user.id, body.company);

        // Prepare Payload
        const payload = {
            first_name: body.firstName,
            last_name: body.lastName,
            email: body.email,
            title: body.role, // role maps to title in DB schema used by ContactService
            role: body.role, // keeping both for safety if schema varies
            linkedin_url: body.linkedinUrl || body.linkedin,
            phone: body.phone,
            company_id: companyId,
            source: 'manual'
        };

        const newContact = await ContactService.createContact(user.id, payload);

        if (!newContact) {
            return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
        }

        return NextResponse.json({ success: true, contact: newContact });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const contactId = body.id;

        if (!contactId) {
            return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
        }

        // Resolve Company ID (if changed)
        const companyId = await resolveCompanyId(supabase, user.id, body.company);

        const payload: any = {
            first_name: body.firstName,
            last_name: body.lastName,
            email: body.email,
            title: body.role,
            role: body.role,
            linkedin_url: body.linkedinUrl || body.linkedin,
            phone: body.phone
        };

        if (companyId) payload.company_id = companyId;

        const updated = await ContactService.updateContact(user.id, contactId, payload);

        if (!updated) {
            return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
        }

        return NextResponse.json({ success: true, contact: updated });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const contactId = searchParams.get('id');
        const deleteAll = searchParams.get('all') === 'true';

        if (deleteAll) {
            const { error } = await supabase
                .from('contacts')
                .delete()
                .eq('user_id', user.id);

            if (error) throw error;
            return NextResponse.json({ success: true, message: 'All contacts deleted' });
        }

        if (contactId) {
            const success = await ContactService.deleteContact(user.id, contactId);
            if (!success) {
                return NextResponse.json({ error: 'Failed to delete contact' }, { status: 500 });
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: 'Failed to delete contacts' }, { status: 500 });
    }
}
