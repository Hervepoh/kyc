import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const recentRequests = await prisma.kYCForm.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        contractNumber: true,
        fullName: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(recentRequests);
  } catch (error) {
    console.error("Error fetching recent requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent requests" },
      { status: 500 }
    );
  }
}