"use client";

import { Edit, Trash2 } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { deleteProduct } from "@/lib/actions/products";
import { showToast } from "@/components/ui/toaster";
import { useTransition } from "react";

export function ProductRowActions({
  productId,
  locale,
}: {
  productId: string;
  locale: string;
}) {
  const [pending, start] = useTransition();

  const onDelete = () => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    start(async () => {
      try {
        await deleteProduct(productId, locale);
        showToast({ title: "Deleted", variant: "success" });
      } catch (err) {
        showToast({
          title: "Delete failed",
          description: err instanceof Error ? err.message : "",
          variant: "error",
        });
      }
    });
  };

  return (
    <div className="flex justify-end gap-1">
      <Button asChild size="icon" variant="ghost">
        <Link href={`/admin/products/${productId}/edit`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onDelete}
        disabled={pending}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
