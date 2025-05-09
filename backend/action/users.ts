// write server action to get all users

import { db } from "../db/drizzle";
import { Users } from "../db/schema";

import { eq } from "drizzle-orm";
export const getUserByCode = async (code: string) => {
  const user = await db.select().from(Users).where(eq(Users.code, code));
  if (!user.length) {
    throw new Error("User not found");
  }
  return user[0];
};


