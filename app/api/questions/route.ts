import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/db/drizzle";
import { Questions } from "@/backend/db/schema";


// GET all questions
export async function GET() {
  try {
    const allQuestions = await db.select().from(Questions);
    return NextResponse.json(allQuestions);
  } catch (error) {
    console.error("Error retrieving questions:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST a new question
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newQuestion = await db.insert(Questions).values(body).returning();
    return NextResponse.json(newQuestion, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
