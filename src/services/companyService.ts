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
        // MOCK DATA MODE (Database not connected yet)
        console.log('Fetching mock companies for user:', userId);
        return [
            {
                id: '1',
                name: 'TechCorp SA',
                domain: 'techcorp.com',
                industry: 'Technology',
                contactsCount: 12,
                opportunitiesCount: 5,
                score: 92,
                status: 'Active',
                hubspotSynced: true,
                hubspotId: 'hs-12345',
                description: 'Leading technology solutions provider'
            },
            {
                id: '2',
                name: 'Global Solutions',
                domain: 'globalsolutions.io',
                industry: 'Consulting',
                contactsCount: 8,
                opportunitiesCount: 3,
                score: 85,
                status: 'Active',
                hubspotSynced: true,
                hubspotId: 'hs-67890'
            },
            {
                id: '3',
                name: 'InnovateX',
                domain: 'innovatex.com',
                industry: 'SaaS',
                contactsCount: 15,
                opportunitiesCount: 7,
                score: 88,
                status: 'Active',
                hubspotSynced: false
            }
        ];
    }

    static async createCompany(userId: string, data: Partial<Company>): Promise<Company> {
        // MOCK CREATE
        return {
            id: Math.random().toString(36).substr(2, 9),
            name: data.name || 'New Company',
            domain: data.domain || '',
            industry: data.industry || 'Unknown',
            contactsCount: 0,
            opportunitiesCount: 0,
            score: 0,
            status: data.status === 'Active' ? 'Active' : 'Prospect',
            hubspotSynced: false,
            description: data.description
        };
    }

    static async updateCompany(userId: string, id: string, data: Partial<Company>): Promise<void> {
        // MOCK UPDATE
        console.log(`Mock updated company ${id}`, data);
    }

    static async deleteCompany(userId: string, id: string): Promise<void> {
        // MOCK DELETE
        console.log(`Mock deleted company ${id}`);
    }
}
