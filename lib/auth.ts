import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "./db/client";
import { users, type User } from "./db/schema";
import { createSupabaseServerClient } from "./supabase/server";

export async function getCurrentSession() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    return authUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const authUser = await getCurrentSession();
  if (!authUser) return null;

  try {
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.authId, authUser.id))
      .limit(1);

    if (existing) return existing;

    const [created] = await db
      .insert(users)
      .values({
        authId: authUser.id,
        email: authUser.email ?? null,
        name: authUser.user_metadata?.full_name ?? null,
        phone: authUser.phone ?? null,
        role: "customer",
      })
      .returning();

    return created;
  } catch {
    return null;
  }
}

export async function requireAdmin(locale: string = "en") {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    redirect(`/${locale}/admin/login`);
  }
  return user;
}

export async function requireUser(locale: string = "en") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/account/login`);
  }
  return user;
}
