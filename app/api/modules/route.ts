import 'server-only';
import { NextRequest, NextResponse } from "next/server";
import { db } from '@/backend/db/drizzle';
import { Modules } from '@/backend/db/schema';


// GET all modules
export async function GET() {
  try {
    const allModules = await db.select().from(Modules).orderBy(Modules.title);
    return NextResponse.json(allModules);
  } catch (error) {
    console.error("Error retrieving modules:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST a new module
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newModule = await db.insert(Modules).values(body).returning();
    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}