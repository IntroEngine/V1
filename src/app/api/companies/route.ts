import { NextResponse } from 'next/server';
import { CompanyService } from '@/services/companyService';

// Mock Auth - replace with actual auth
const getUserId = async (req: Request) => '00000000-0000-0000-0000-000000000001'

export async function GET(request: Request) {
    try {
        const userId = await getUserId(request);
        const companies = await CompanyService.getCompanies(userId);
        return NextResponse.json(companies);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to fetch companies', details: error }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const userId = await getUserId(request);
        const body = await request.json();

        // Basic validation
        if (!body.name) {
            return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
        }

        const newCompany = await CompanyService.createCompany(userId, body);
        return NextResponse.json(newCompany);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
    }
}
