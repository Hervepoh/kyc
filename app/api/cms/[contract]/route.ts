
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';


export async function POST(request: NextRequest, { params }: { params: { contract: string } }) {
  try {
    const { contract } = params;

    if (!contract) {
      return NextResponse.json({ error: 'Contract Number  is required' }, { status: 400 });
  }
    // Create the KYC form entry with related data
    const result = await prisma.customer.findFirst({
        where: { contract: contract}
    });
    
    if (!result) {
      return NextResponse.json(
        { success: false,  exists: !!result, error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, exists: !!result , data: result }, { status: 200 });
  } catch (error) {
    console.error('Error processing KYC form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process KYC form' },
      { status: 500 }
    );
  }
}