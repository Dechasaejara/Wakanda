import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/db/drizzle";
import { Lessons } from "@/backend/db/schema";

// GET all lessons
export async function GET() {
  try {
    const allLessons = await db.select().from(Lessons);
    return NextResponse.json(allLessons);
  } catch (error) {
    console.error("Error retrieving lessons:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST a new lesson
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newLesson = await db.insert(Lessons).values(body).returning();
    return NextResponse.json(newLesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
