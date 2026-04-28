import { and, asc, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "../client";
import {
  products,
  productImages,
  categories,
  type Product,
} from "../schema";

export interface ProductFilters {
  q?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc" | "name_asc";
  status?: "draft" | "active" | "archived";
  page?: number;
  pageSize?: number;
  featured?: boolean;
}

export interface ProductWithImages extends Product {
  images: { id: string; url: string; altEn: string | null; altNe: string | null }[];
  category: { id: string; slug: string; nameEn: string; nameNe: string } | null;
}

export async function listProducts(filters: ProductFilters = {}) {
  const {
    q,
    categorySlug,
    minPrice,
    maxPrice,
    sort = "newest",
    status = "active",
    page = 1,
    pageSize = 24,
    featured,
  } = filters;

  const conditions: SQL[] = [];
  conditions.push(eq(products.status, status));
  if (q) {
    conditions.push(
      or(
        ilike(products.nameEn, `%${q}%`),
        ilike(products.nameNe, `%${q}%`),
        ilike(products.descriptionEn, `%${q}%`)
      )!
    );
  }
  if (categorySlug) {
    const [cat] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);
    if (cat) conditions.push(eq(products.categoryId, cat.id));
  }
  if (typeof minPrice === "number") {
    conditions.push(sql`${products.priceNpr} >= ${minPrice}`);
  }
  if (typeof maxPrice === "number") {
    conditions.push(sql`${products.priceNpr} <= ${maxPrice}`);
  }
  if (featured) conditions.push(eq(products.featured, true));

  const orderBy =
    sort === "price_asc"
      ? asc(products.priceNpr)
      : sort === "price_desc"
        ? desc(products.priceNpr)
        : sort === "name_asc"
          ? asc(products.nameEn)
          : desc(products.createdAt);

  const offset = (page - 1) * pageSize;

  const rows = await db.query.products.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    with: {
      images: { orderBy: (i, { asc }) => [asc(i.sort)] },
      category: true,
    },
    orderBy,
    limit: pageSize,
    offset,
  });

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(products)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  return { rows: rows as unknown as ProductWithImages[], total: count, page, pageSize };
}

export async function getProductBySlug(slug: string) {
  const row = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: {
      images: { orderBy: (i, { asc }) => [asc(i.sort)] },
      category: true,
    },
  });
  return (row ?? null) as unknown as ProductWithImages | null;
}

export async function getProductById(id: string) {
  const row = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      images: { orderBy: (i, { asc }) => [asc(i.sort)] },
      category: true,
    },
  });
  return (row ?? null) as unknown as ProductWithImages | null;
}

export async function getRelatedProducts(productId: string, categoryId: string | null, limit = 4) {
  if (!categoryId) return [];
  const rows = await db.query.products.findMany({
    where: and(
      eq(products.categoryId, categoryId),
      eq(products.status, "active"),
      sql`${products.id} != ${productId}`
    ),
    with: { images: { orderBy: (i, { asc }) => [asc(i.sort)], limit: 1 } },
    limit,
    orderBy: desc(products.createdAt),
  });
  return rows as unknown as ProductWithImages[];
}

export async function deleteProductImages(productId: string) {
  await db.delete(productImages).where(eq(productImages.productId, productId));
}
