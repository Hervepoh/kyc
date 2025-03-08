import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const [total, pending, valid, rejected] = await Promise.all([
      prisma.kYCForm.count(),
      prisma.kYCForm.count({ where: { status: "PENDING" } }),
      prisma.kYCForm.count({ where: { status: "VALIDATED" } }),
      prisma.kYCForm.count({ where: { status: "REJECTED" } }),
    ]);

    return NextResponse.json({
      total,
      pending,
      valid,
      rejected,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}