import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/backend/db/drizzle";
import { Users } from "@/backend/db/schema";

// GET a single user by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await db
      .select()
      .from(Users)
      .where(eq(Users.code, (await params).id));
    if (!user.length)
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    return NextResponse.json(user[0]);
  } catch (error) {
    console.error("Error retrieving user:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// PUT (update) a user by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const updatedUser = await db
      .update(Users)
      .set(body)
      .where(eq(Users.code, (await params).id))
      .returning();
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// DELETE a user by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await db.delete(Users).where(eq(Users.code, (await params).id));
    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 204 }
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
