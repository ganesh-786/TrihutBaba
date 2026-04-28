"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/toaster";
import { updateOrderStatus } from "@/lib/actions/orders";

const nextStatuses: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled", "refunded"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

const labels: Record<string, string> = {
  paid: "Mark paid",
  processing: "Start processing",
  shipped: "Mark shipped",
  delivered: "Mark delivered",
  cancelled: "Cancel order",
  refunded: "Mark refunded",
};

const variants: Record<string, "default" | "outline" | "destructive"> = {
  paid: "default",
  processing: "default",
  shipped: "default",
  delivered: "default",
  cancelled: "destructive",
  refunded: "outline",
};

export function OrderStatusActions({
  orderId,
  currentStatus,
  locale,
}: {
  orderId: string;
  currentStatus: string;
  locale: string;
}) {
  const [pending, start] = useTransition();
  const options = nextStatuses[currentStatus] ?? [];

  const update = (s: string) => {
    if (s === "cancelled" && !confirm("Cancel this order?")) return;
    start(async () => {
      try {
        await updateOrderStatus(
          orderId,
          s as Parameters<typeof updateOrderStatus>[1],
          locale
        );
        showToast({ title: "Status updated", variant: "success" });
      } catch (err) {
        showToast({
          title: "Update failed",
          description: err instanceof Error ? err.message : "",
          variant: "error",
        });
      }
    });
  };

  if (options.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">No status changes available.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((s) => (
        <Button
          key={s}
          size="sm"
          variant={variants[s] ?? "outline"}
          disabled={pending}
          onClick={() => update(s)}
        >
          {labels[s] ?? s}
        </Button>
      ))}
    </div>
  );
}
