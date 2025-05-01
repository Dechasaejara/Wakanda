import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/db/drizzle";
import { Badges } from "@/backend/db/schema";

// GET all badges
export async function GET() {
  try {
    const allBadges = await db.select().from(Badges);
    return NextResponse.json(allBadges);
  } catch (error) {
    console.error("Error retrieving badges:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST a new badge
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newBadge = await db.insert(Badges).values(body).returning();
    return NextResponse.json(newBadge, { status: 201 });
  } catch (error) {
    console.error("Error creating badge:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
