"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { products, productImages } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";

const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).optional(),
  nameEn: z.string().min(2),
  nameNe: z.string().min(1),
  descriptionEn: z.string().optional().nullable(),
  descriptionNe: z.string().optional().nullable(),
  shortDescriptionEn: z.string().optional().nullable(),
  shortDescriptionNe: z.string().optional().nullable(),
  priceNpr: z.coerce.number().min(0),
  compareAtPrice: z.coerce.number().min(0).nullable().optional(),
  sku: z.string().optional().nullable(),
  stockQty: z.coerce.number().int().min(0),
  categoryId: z.string().uuid().nullable().optional(),
  brand: z.string().optional().nullable(),
  weightKg: z.coerce.number().min(0).nullable().optional(),
  status: z.enum(["draft", "active", "archived"]),
  featured: z.coerce.boolean().optional(),
  seoTitleEn: z.string().optional().nullable(),
  seoTitleNe: z.string().optional().nullable(),
  seoDescriptionEn: z.string().optional().nullable(),
  seoDescriptionNe: z.string().optional().nullable(),
  keywords: z.array(z.string()).optional(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        altEn: z.string().optional().nullable(),
        altNe: z.string().optional().nullable(),
      })
    )
    .optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export async function saveProduct(input: ProductInput, locale = "en") {
  await requireAdmin(locale);
  const data = productSchema.parse(input);
  const slug = data.slug?.trim() || slugify(data.nameEn);

  return await db.transaction(async (tx) => {
    let productId: string;

    if (data.id) {
      await tx
        .update(products)
        .set({
          slug,
          nameEn: data.nameEn,
          nameNe: data.nameNe,
          descriptionEn: data.descriptionEn ?? null,
          descriptionNe: data.descriptionNe ?? null,
          shortDescriptionEn: data.shortDescriptionEn ?? null,
          shortDescriptionNe: data.shortDescriptionNe ?? null,
          priceNpr: String(data.priceNpr),
          compareAtPrice:
            data.compareAtPrice != null ? String(data.compareAtPrice) : null,
          sku: data.sku ?? null,
          stockQty: data.stockQty,
          categoryId: data.categoryId ?? null,
          brand: data.brand ?? null,
          weightKg: data.weightKg != null ? String(data.weightKg) : null,
          status: data.status,
          featured: !!data.featured,
          seoTitleEn: data.seoTitleEn ?? null,
          seoTitleNe: data.seoTitleNe ?? null,
          seoDescriptionEn: data.seoDescriptionEn ?? null,
          seoDescriptionNe: data.seoDescriptionNe ?? null,
          keywords: data.keywords ?? null,
          updatedAt: new Date(),
        })
        .where(eq(products.id, data.id));
      productId = data.id;
    } else {
      const [row] = await tx
        .insert(products)
        .values({
          slug,
          nameEn: data.nameEn,
          nameNe: data.nameNe,
          descriptionEn: data.descriptionEn ?? null,
          descriptionNe: data.descriptionNe ?? null,
          shortDescriptionEn: data.shortDescriptionEn ?? null,
          shortDescriptionNe: data.shortDescriptionNe ?? null,
          priceNpr: String(data.priceNpr),
          compareAtPrice:
            data.compareAtPrice != null ? String(data.compareAtPrice) : null,
          sku: data.sku ?? null,
          stockQty: data.stockQty,
          categoryId: data.categoryId ?? null,
          brand: data.brand ?? null,
          weightKg: data.weightKg != null ? String(data.weightKg) : null,
          status: data.status,
          featured: !!data.featured,
          seoTitleEn: data.seoTitleEn ?? null,
          seoTitleNe: data.seoTitleNe ?? null,
          seoDescriptionEn: data.seoDescriptionEn ?? null,
          seoDescriptionNe: data.seoDescriptionNe ?? null,
          keywords: data.keywords ?? null,
        })
        .returning({ id: products.id });
      productId = row.id;
    }

    if (data.images) {
      await tx.delete(productImages).where(eq(productImages.productId, productId));
      if (data.images.length) {
        await tx.insert(productImages).values(
          data.images.map((img, i) => ({
            productId,
            url: img.url,
            altEn: img.altEn ?? null,
            altNe: img.altNe ?? null,
            sort: i,
          }))
        );
      }
    }

    revalidatePath(`/${locale}/admin/products`);
    revalidatePath(`/${locale}/products/${slug}`);
    revalidatePath(`/${locale}/products`);
    revalidatePath(`/${locale}`);

    return { id: productId, slug };
  });
}

export async function deleteProduct(id: string, locale = "en") {
  await requireAdmin(locale);
  await db.delete(products).where(eq(products.id, id));
  revalidatePath(`/${locale}/admin/products`);
  revalidatePath(`/${locale}/products`);
  return { ok: true };
}
