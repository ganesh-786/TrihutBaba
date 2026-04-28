/**
 * Promote a Supabase auth user to admin in the local users table.
 *
 * Usage:
 *   DATABASE_URL=... npx tsx scripts/promote-admin.ts you@example.com
 *
 * The user must have signed up in Supabase Auth first (via /admin/login or Supabase dashboard).
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../lib/db/client";
import { users } from "../lib/db/schema";
import { getSupabaseAdmin } from "../lib/supabase/admin";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: tsx scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  const authUser = data.users.find((u) => u.email === email);
  if (!authUser) {
    console.error(`No Supabase auth user found for ${email}.`);
    console.error("Sign them up first via /admin/login or the Supabase dashboard.");
    process.exit(1);
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.authId, authUser.id))
    .limit(1);
  if (existing) {
    await db
      .update(users)
      .set({ role: "admin", updatedAt: new Date() })
      .where(eq(users.id, existing.id));
  } else {
    await db.insert(users).values({
      authId: authUser.id,
      email: authUser.email ?? null,
      name: (authUser.user_metadata?.full_name as string | undefined) ?? null,
      role: "admin",
    });
  }
  console.log(`OK: ${email} is now an admin.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
