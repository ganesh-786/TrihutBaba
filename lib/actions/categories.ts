"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { categories } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().optional(),
  nameEn: z.string().min(1),
  nameNe: z.string().min(1),
  descriptionEn: z.string().optional().nullable(),
  descriptionNe: z.string().optional().nullable(),
  parentId: z.string().uuid().nullable().optional(),
  imageUrl: z.string().url().optional().nullable(),
  sort: z.coerce.number().int().optional(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export async function saveCategory(input: CategoryInput, locale = "en") {
  await requireAdmin(locale);
  const data = categorySchema.parse(input);
  const slug = data.slug?.trim() || slugify(data.nameEn);

  if (data.id) {
    await db
      .update(categories)
      .set({
        slug,
        nameEn: data.nameEn,
        nameNe: data.nameNe,
        descriptionEn: data.descriptionEn ?? null,
        descriptionNe: data.descriptionNe ?? null,
        parentId: data.parentId ?? null,
        imageUrl: data.imageUrl ?? null,
        sort: data.sort ?? 0,
      })
      .where(eq(categories.id, data.id));
  } else {
    await db.insert(categories).values({
      slug,
      nameEn: data.nameEn,
      nameNe: data.nameNe,
      descriptionEn: data.descriptionEn ?? null,
      descriptionNe: data.descriptionNe ?? null,
      parentId: data.parentId ?? null,
      imageUrl: data.imageUrl ?? null,
      sort: data.sort ?? 0,
    });
  }

  revalidatePath(`/${locale}/admin/categories`);
  revalidatePath(`/${locale}/categories`);
  revalidatePath(`/${locale}`);
  return { ok: true };
}

export async function deleteCategory(id: string, locale = "en") {
  await requireAdmin(locale);
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath(`/${locale}/admin/categories`);
  revalidatePath(`/${locale}/categories`);
  return { ok: true };
}
