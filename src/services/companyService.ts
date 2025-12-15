import { supabaseAdmin } from '@/config/supabase';
import { Company } from '@/types/network'; // We might need to update this type definition

// Map DB 'prospects' to frontend 'Company' type
const mapToCompany = (row: any): Company => ({
    id: row.id,
    name: row.company_name,
    domain: row.domain || '',
    industry: row.industry || 'Unknown',
    contactsCount: row.contacts_count || 0, // Requires join/count
    opportunitiesCount: row.opportunities_count || 0, // Requires join/count
    score: row.icp_score || 0,
    status: row.status === 'approved' ? 'Active' : row.status === 'rejected' ? 'Inactive' : 'Prospect',
    hubspotSynced: !!row.hubspot_id,
    hubspotId: row.hubspot_id,
    description: row.description
});

export class CompanyService {

    static async getCompanies(userId: string): Promise<Company[]> {
        const { data, error } = await supabaseAdmin
            .from('prospects')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching companies:', error);
            // Return empty array instead of throwing to avoid crashing UI for new users
            return [];
        }

        return data.map(mapToCompany);
    }

    static async createCompany(userId: string, data: Partial<Company>): Promise<Company> {
        const payload = {
            user_id: userId,
            company_name: data.name,
            domain: data.domain,
            industry: data.industry,
            status: data.status === 'Active' ? 'approved' : data.status === 'Inactive' ? 'rejected' : 'new',
            description: data.description,
            // contacts_count and opportunities_count are computed or updated separately
            updated_at: new Date().toISOString()
        };

        const { data: newProspect, error } = await supabaseAdmin
            .from('prospects')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Error creating company:', error);
            throw error;
        }

        return mapToCompany(newProspect);
    }

    static async updateCompany(userId: string, id: string, data: Partial<Company>): Promise<void> {
        const payload: any = {};
        if (data.name) payload.company_name = data.name;
        if (data.domain) payload.domain = data.domain;
        if (data.industry) payload.industry = data.industry;
        if (data.description) payload.description = data.description;
        if (data.status) payload.status = data.status === 'Active' ? 'approved' : data.status === 'Inactive' ? 'rejected' : 'new';

        payload.updated_at = new Date().toISOString();

        const { error } = await supabaseAdmin
            .from('prospects')
            .update(payload)
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating company:', error);
            throw error;
        }
    }

    static async deleteCompany(userId: string, id: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('prospects')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting company:', error);
            throw error;
        }
    }
}
