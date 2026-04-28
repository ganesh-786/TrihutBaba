"use server";

import { requireAdmin } from "@/lib/auth";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BUCKET = "products";

export async function uploadProductImage(
  formData: FormData,
  locale = "en"
): Promise<{ url: string }> {
  await requireAdmin(locale);
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided");

  const supabase = getSupabaseAdmin();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const key = `products/${crypto.randomUUID()}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(key, new Uint8Array(arrayBuffer), {
      contentType: file.type,
      upsert: false,
    });
  if (error) throw error;

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return { url: pub.publicUrl };
}
