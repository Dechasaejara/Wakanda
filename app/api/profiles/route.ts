import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/db/drizzle";
import { Profiles } from "@/backend/db/schema";

// GET all profiles
export async function GET() {
  try {
    const allProfiles = await db.select().from(Profiles);
    return NextResponse.json(allProfiles);
  } catch (error) {
    console.error("Error retrieving profiles:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST a new profile
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newProfile = await db.insert(Profiles).values(body).returning();
    return NextResponse.json(newProfile, { status: 201 });
  } catch (error) {
    console.error("Error creating profile:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
