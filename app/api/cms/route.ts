
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';


export async function POST(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get('query') as string;
    if (!query) {
      return NextResponse.json(
        { message: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.findMany({
      where: {
        OR: [
          { contract:  query },
          { meter:  query }
        ]
      },
    });

    if (!customer) {
      return NextResponse.json(
        { message: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: customer }, { status: 200 });
  } catch (error) {
    console.error('Error processing CMS query:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process CMS query' },
      { status: 500 }
    );
  }
}