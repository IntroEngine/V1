
import { supabaseAdmin } from '@/config/supabase';

export interface Contact {
    id: string;
    user_id: string;
    company_id?: string;
    first_name: string;
    last_name: string;
    email?: string;
    linkedin_url?: string;
    phone?: string;
    title?: string;
    role?: string;
    source?: string;
    hubspot_contact_id?: string;
    created_at?: string;
    updated_at?: string;
    // Joined fields
    company_name?: string;
}

export class ContactService {
    static async getContacts(userId: string): Promise<Contact[]> {
        const { data, error } = await supabaseAdmin
            .from('contacts')
            .select(`
                *,
                prospects (
                    company_name,
                    domain
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching contacts:', error);
            return [];
        }

        return data.map((item: any) => ({
            ...item,
            company_name: item.prospects?.company_name || '',
            company_domain: item.prospects?.domain || ''
        }));
    }

    static async createContact(userId: string, data: Partial<Contact>): Promise<Contact | null> {
        // Prepare payload
        const payload: any = {
            user_id: userId,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            linkedin_url: data.linkedin_url,
            phone: data.phone,
            title: data.title,
            role: data.role,
            source: data.source || 'manual',
            company_id: data.company_id
        };

        const { data: newContact, error } = await supabaseAdmin
            .from('contacts')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Error creating contact:', error);
            // If unique constraint violation on email, maybe update?
            // For now, return null or throw
            return null;
        }

        return newContact;
    }

    // Add batch create for import
    static async createContactsBatch(userId: string, contacts: Partial<Contact>[]): Promise<void> {
        if (!contacts.length) return;

        const payload = contacts.map(c => ({
            user_id: userId,
            first_name: c.first_name,
            last_name: c.last_name,
            email: c.email,
            linkedin_url: c.linkedin_url,
            phone: c.phone,
            title: c.title,
            role: c.role,
            source: c.source || 'manual',
            company_id: c.company_id
        }));

        const { error } = await supabaseAdmin
            .from('contacts')
            .upsert(payload, { onConflict: 'user_id,email', ignoreDuplicates: true }); // Handle dupes gracefully

        if (error) {
            console.error('Error batch creating contacts:', error);
        }
    }

    static async updateContact(userId: string, contactId: string, data: Partial<Contact>): Promise<Contact | null> {
        const payload: any = { ...data };
        delete payload.id; // Protect ID
        delete payload.user_id; // Protect Owner
        delete payload.company_name; // Joined field
        delete payload.company_domain; // Joined field
        payload.updated_at = new Date().toISOString();

        const { data: updated, error } = await supabaseAdmin
            .from('contacts')
            .update(payload)
            .eq('id', contactId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) {
            console.error('Error updating contact:', error);
            return null;
        }

        return updated;
    }

    static async deleteContact(userId: string, contactId: string): Promise<boolean> {
        const { error } = await supabaseAdmin
            .from('contacts')
            .delete()
            .eq('id', contactId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting contact:', error);
            return false;
        }
        return true;
    }
}
