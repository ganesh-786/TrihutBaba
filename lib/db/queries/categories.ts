import { asc, eq } from "drizzle-orm";
import { db } from "../client";
import { categories, type Category } from "../schema";

export async function listCategories() {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sort), asc(categories.nameEn));
  return rows;
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const [row] = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1);
  return row ?? null;
}
