// app/api/cms/[contract]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(
  req: NextRequest
) {
  // Récupérer le segment dynamique de l’URL
  const url = new URL(req.url);
  const contract = url.pathname.split('/').pop(); // ou utiliser une RegExp plus robuste

  if (!contract) {
    return NextResponse.json({ error: 'Contract Number is required' }, { status: 400 });
  }

  try {
    const result = await prisma.customer.findFirst({
      where: { contract }
    });

    if (!result) {
      return NextResponse.json(
        { success: false, exists: false, error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, exists: true, data: result }, { status: 200 });

  } catch (error) {
    console.error('Error processing KYC form:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process KYC form' },
      { status: 500 }
    );
  }
}
