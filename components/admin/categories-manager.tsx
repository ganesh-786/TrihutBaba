"use client";

import * as React from "react";
import { useTransition } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toaster";
import { saveCategory, deleteCategory } from "@/lib/actions/categories";
import type { Category } from "@/lib/db/schema";

export function CategoriesManager({
  locale,
  initial,
}: {
  locale: string;
  initial: Category[];
}) {
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [pending, start] = useTransition();

  const onSave = (e: React.FormEvent<HTMLFormElement>, cat?: Category) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      try {
        await saveCategory(
          {
            id: cat?.id,
            slug: (fd.get("slug") as string) || undefined,
            nameEn: fd.get("nameEn") as string,
            nameNe: fd.get("nameNe") as string,
            descriptionEn: (fd.get("descriptionEn") as string) || null,
            descriptionNe: (fd.get("descriptionNe") as string) || null,
            sort: Number(fd.get("sort") || 0),
          },
          locale
        );
        showToast({ title: "Saved", variant: "success" });
        setEditing(null);
        setCreating(false);
      } catch (err) {
        showToast({
          title: "Save failed",
          description: err instanceof Error ? err.message : "",
          variant: "error",
        });
      }
    });
  };

  const onDelete = (id: string) => {
    if (!confirm("Delete this category? Products in it will be uncategorized.")) return;
    start(async () => {
      try {
        await deleteCategory(id, locale);
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
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)} disabled={creating}>
          <Plus className="h-4 w-4" /> New category
        </Button>
      </div>

      {creating && (
        <div className="rounded-xl border bg-card p-4">
          <form onSubmit={(e) => onSave(e)} className="grid gap-3 sm:grid-cols-2">
            <Input name="nameEn" placeholder="Name (English)" required />
            <Input name="nameNe" placeholder="Name (नेपाली)" required />
            <Input name="slug" placeholder="slug (auto)" />
            <Input name="sort" type="number" placeholder="Sort order" defaultValue="0" />
            <Input name="descriptionEn" placeholder="Description (EN)" className="sm:col-span-2" />
            <Input name="descriptionNe" placeholder="विवरण (NE)" className="sm:col-span-2" />
            <div className="flex gap-2 sm:col-span-2">
              <Button type="submit" disabled={pending}>
                <Save className="h-4 w-4" /> Save
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreating(false)}
              >
                <X className="h-4 w-4" /> Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Name (EN)</th>
              <th className="px-4 py-3 font-medium">Name (NE)</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Sort</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {initial.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                  No categories yet.
                </td>
              </tr>
            ) : (
              initial.map((c) =>
                editing?.id === c.id ? (
                  <tr key={c.id} className="border-b last:border-0 bg-secondary/30">
                    <td colSpan={5} className="p-3">
                      <form onSubmit={(e) => onSave(e, c)} className="grid gap-2 sm:grid-cols-4">
                        <Input name="nameEn" defaultValue={c.nameEn} required />
                        <Input name="nameNe" defaultValue={c.nameNe} required />
                        <Input name="slug" defaultValue={c.slug} />
                        <Input name="sort" type="number" defaultValue={c.sort} />
                        <div className="flex gap-2 sm:col-span-4">
                          <Button type="submit" size="sm" disabled={pending}>
                            <Save className="h-4 w-4" /> Save
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setEditing(null)}
                          >
                            <X className="h-4 w-4" /> Cancel
                          </Button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr key={c.id} className="border-b last:border-0">
                    <td className="px-4 py-3 font-medium">{c.nameEn}</td>
                    <td className="px-4 py-3">{c.nameNe}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.slug}</td>
                    <td className="px-4 py-3">{c.sort}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditing(c)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => onDelete(c.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
