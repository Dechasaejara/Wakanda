import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/db/drizzle";
import { ChallengeQuestions } from "@/backend/db/schema";

// GET all challenge questions
export async function GET() {
  try {
    const allChallengeQuestions = await db.select().from(ChallengeQuestions);
    return NextResponse.json(allChallengeQuestions);
  } catch (error) {
    console.error("Error retrieving challenge questions:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST a new challenge question
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newChallengeQuestion = await db.insert(ChallengeQuestions).values(body).returning();
    return NextResponse.json(newChallengeQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating challenge question:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
