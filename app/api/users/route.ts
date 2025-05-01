import "server-only";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/backend/db/drizzle";
import { Users } from "@/backend/db/schema";


// GET all users
export async function GET() {
  try {
    const allUsers = await db.select().from(Users).orderBy(Users.code);
    return NextResponse.json(allUsers);
  } catch (error) {
    console.error("Error retrieving users:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}

// POST a new user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newUser = await db.insert(Users).values(body).returning();
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
