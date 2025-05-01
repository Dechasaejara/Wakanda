import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/db/drizzle";
import { Leaderboard } from "@/backend/db/schema";

// GET all leaderboard entries
export async function GET() {
  try {
    const allLeaderboard = await db.select().from(Leaderboard);
    return NextResponse.json(allLeaderboard);
  } catch (error) {
    console.error("Error retrieving leaderboard:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST a new leaderboard entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newLeaderboard = await db.insert(Leaderboard).values(body).returning();
    return NextResponse.json(newLeaderboard, { status: 201 });
  } catch (error) {
    console.error("Error creating leaderboard entry:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
