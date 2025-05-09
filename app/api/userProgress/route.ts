import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/db/drizzle";
import { UserProgress } from "@/backend/db/schema";

// GET all user progress entries
export async function GET() {
  try {
    const allUserProgress = await db.select().from(UserProgress);
    return NextResponse.json(allUserProgress);
  } catch (error) {
    console.error("Error retrieving user progress:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST a new user progress entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log({body})
    const newUserProgress = await db.insert(UserProgress).values(body).returning();
    return NextResponse.json(newUserProgress, { status: 201 });
  } catch (error) {
    console.error("Error creating user progress entry:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
