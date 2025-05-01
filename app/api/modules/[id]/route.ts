import 'server-only';
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from '@/backend/db/drizzle';
import { Modules } from '@/backend/db/schema';


// GET a single module by ID
export async function GET(req: NextRequest, { params }: { params: { id: number } }) {
  try {
    const module = await db.select().from(Modules).where(eq(Modules.id, params.id));
    if (!module.length) return NextResponse.json({ message: "Module not found" }, { status: 404 });
    return NextResponse.json(module[0]);
  } catch (error) {
    console.error("Error retrieving module:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// PUT (update) a module by ID
export async function PUT(req: NextRequest, { params }: { params: { id: number } }) {
  try {
    const body = await req.json();
    const updatedModule = await db.update(Modules).set(body).where(eq(Modules.id, params.id)).returning();
    return NextResponse.json(updatedModule);
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// DELETE a module by ID
export async function DELETE(req: NextRequest, { params }: { params: { id: number } }) {
  try {
    await db.delete(Modules).where(eq(Modules.id, params.id));
    return NextResponse.json({ message: "Module deleted successfully" }, { status: 204 });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}