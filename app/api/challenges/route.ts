import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/db/drizzle";
import { Challenges } from "@/backend/db/schema";

// GET all challenges
export async function GET() {
  try {
    const allChallenges = await db.select().from(Challenges);
    return NextResponse.json(allChallenges);
  } catch (error) {
    console.error("Error retrieving challenges:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST a new challenge
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newChallenge = await db.insert(Challenges).values(body).returning();
    return NextResponse.json(newChallenge, { status: 201 });
  } catch (error) {
    console.error("Error creating challenge:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
