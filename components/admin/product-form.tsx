"use client";

import * as React from "react";
import { useTransition } from "react";
import { Trash2, Upload, ImageIcon } from "lucide-react";
import { useRouter } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/toaster";
import { saveProduct, type ProductInput } from "@/lib/actions/products";
import { uploadProductImage } from "@/lib/actions/uploads";
import type { Category } from "@/lib/db/schema";
import type { ProductWithImages } from "@/lib/db/queries/products";

interface Props {
  locale: string;
  categories: Category[];
  product?: ProductWithImages | null;
}

interface ImageItem {
  url: string;
  altEn?: string | null;
  altNe?: string | null;
}

export function ProductForm({ locale, categories, product }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [images, setImages] = React.useState<ImageItem[]>(
    product?.images.map((i) => ({
      url: i.url,
      altEn: i.altEn,
      altNe: i.altNe,
    })) ?? []
  );
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement | null>(null);

  const onUpload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { url } = await uploadProductImage(fd, locale);
      setImages((cur) => [...cur, { url, altEn: "", altNe: "" }]);
    } catch (err) {
      showToast({
        title: "Upload failed",
        description:
          err instanceof Error
            ? err.message
            : "Configure Supabase Storage bucket 'products'",
        variant: "error",
      });
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const input: ProductInput = {
      id: product?.id,
      slug: (fd.get("slug") as string) || undefined,
      nameEn: fd.get("nameEn") as string,
      nameNe: fd.get("nameNe") as string,
      descriptionEn: fd.get("descriptionEn") as string,
      descriptionNe: fd.get("descriptionNe") as string,
      shortDescriptionEn: fd.get("shortDescriptionEn") as string,
      shortDescriptionNe: fd.get("shortDescriptionNe") as string,
      priceNpr: Number(fd.get("priceNpr")),
      compareAtPrice: fd.get("compareAtPrice")
        ? Number(fd.get("compareAtPrice"))
        : null,
      sku: (fd.get("sku") as string) || null,
      stockQty: Number(fd.get("stockQty")),
      categoryId: (fd.get("categoryId") as string) || null,
      brand: (fd.get("brand") as string) || null,
      weightKg: fd.get("weightKg") ? Number(fd.get("weightKg")) : null,
      status: fd.get("status") as "draft" | "active" | "archived",
      featured: fd.get("featured") === "on",
      seoTitleEn: (fd.get("seoTitleEn") as string) || null,
      seoTitleNe: (fd.get("seoTitleNe") as string) || null,
      seoDescriptionEn: (fd.get("seoDescriptionEn") as string) || null,
      seoDescriptionNe: (fd.get("seoDescriptionNe") as string) || null,
      keywords: ((fd.get("keywords") as string) || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      images,
    };

    start(async () => {
      try {
        await saveProduct(input, locale);
        showToast({
          title: product ? "Product updated" : "Product created",
          variant: "success",
        });
        router.push("/admin/products");
      } catch (err) {
        showToast({
          title: "Save failed",
          description: err instanceof Error ? err.message : "",
          variant: "error",
        });
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Basics (bilingual)
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="nameEn">Name (English) *</Label>
            <Input id="nameEn" name="nameEn" defaultValue={product?.nameEn} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nameNe">Name (Nepali) *</Label>
            <Input id="nameNe" name="nameNe" defaultValue={product?.nameNe} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={product?.slug}
              placeholder="auto-generated from name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" name="sku" defaultValue={product?.sku ?? ""} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="shortDescriptionEn">Short description (EN)</Label>
            <Input
              id="shortDescriptionEn"
              name="shortDescriptionEn"
              defaultValue={product?.shortDescriptionEn ?? ""}
              maxLength={160}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="shortDescriptionNe">Short description (NE)</Label>
            <Input
              id="shortDescriptionNe"
              name="shortDescriptionNe"
              defaultValue={product?.shortDescriptionNe ?? ""}
              maxLength={160}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="descriptionEn">Description (EN)</Label>
            <Textarea
              id="descriptionEn"
              name="descriptionEn"
              rows={6}
              defaultValue={product?.descriptionEn ?? ""}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="descriptionNe">Description (NE)</Label>
            <Textarea
              id="descriptionNe"
              name="descriptionNe"
              rows={6}
              defaultValue={product?.descriptionNe ?? ""}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Pricing & inventory
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="priceNpr">Price (NPR) *</Label>
            <Input
              id="priceNpr"
              name="priceNpr"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.priceNpr ?? ""}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="compareAtPrice">Compare-at price</Label>
            <Input
              id="compareAtPrice"
              name="compareAtPrice"
              type="number"
              step="0.01"
              min="0"
              defaultValue={product?.compareAtPrice ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="stockQty">Stock qty *</Label>
            <Input
              id="stockQty"
              name="stockQty"
              type="number"
              min="0"
              defaultValue={product?.stockQty ?? 0}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="brand">Brand</Label>
            <Input id="brand" name="brand" defaultValue={product?.brand ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="weightKg">Weight (kg)</Label>
            <Input
              id="weightKg"
              name="weightKg"
              type="number"
              step="0.01"
              defaultValue={product?.weightKg ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="categoryId">Category</Label>
            <select
              id="categoryId"
              name="categoryId"
              defaultValue={product?.categoryId ?? ""}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">— None —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Images
          </h2>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onUpload(file);
              if (e.target) e.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Uploading..." : "Upload image"}
          </Button>
        </div>

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border-2 border-dashed py-10 text-sm text-muted-foreground">
            <ImageIcon className="mb-2 h-8 w-8 opacity-50" />
            <p>No images yet. Upload at least one for the product page.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6">
            {images.map((img, i) => (
              <div
                key={img.url}
                className="group relative aspect-square overflow-hidden rounded-md border bg-secondary"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() =>
                    setImages((cur) => cur.filter((_, j) => j !== i))
                  }
                  className="absolute right-1 top-1 rounded-md bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          SEO
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="seoTitleEn">SEO title (EN)</Label>
            <Input
              id="seoTitleEn"
              name="seoTitleEn"
              maxLength={70}
              defaultValue={product?.seoTitleEn ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="seoTitleNe">SEO title (NE)</Label>
            <Input
              id="seoTitleNe"
              name="seoTitleNe"
              maxLength={70}
              defaultValue={product?.seoTitleNe ?? ""}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="seoDescriptionEn">Meta description (EN)</Label>
            <Textarea
              id="seoDescriptionEn"
              name="seoDescriptionEn"
              maxLength={160}
              rows={2}
              defaultValue={product?.seoDescriptionEn ?? ""}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="seoDescriptionNe">Meta description (NE)</Label>
            <Textarea
              id="seoDescriptionNe"
              name="seoDescriptionNe"
              maxLength={160}
              rows={2}
              defaultValue={product?.seoDescriptionNe ?? ""}
            />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              name="keywords"
              defaultValue={product?.keywords?.join(", ") ?? ""}
              placeholder="agriculture, tractor, seeds"
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Status
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              defaultValue={product?.status ?? "draft"}
              className="flex h-10 w-44 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
              className="h-4 w-4 rounded border-input"
            />
            Featured on home page
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/products")}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? "Saving..." : product ? "Update product" : "Create product"}
        </Button>
      </div>
    </form>
  );
}
