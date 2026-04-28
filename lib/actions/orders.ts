"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth";
import { onOrderStatusChanged } from "@/lib/notifications/orders";

const allowedTransitions: Record<string, string[]> = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled", "refunded"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: ["refunded"],
  cancelled: [],
  refunded: [],
};

export async function updateOrderStatus(
  orderId: string,
  newStatus:
    | "pending"
    | "paid"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded",
  locale = "en"
) {
  await requireAdmin(locale);
  const id = z.string().uuid().parse(orderId);

  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order) throw new Error("Order not found");

  const allowed = allowedTransitions[order.status] ?? [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot move ${order.status} → ${newStatus}`);
  }

  await db
    .update(orders)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(orders.id, id));

  if (newStatus !== "pending" && newStatus !== "paid") {
    await onOrderStatusChanged(id, newStatus).catch(() => null);
  }

  revalidatePath(`/${locale}/admin/orders`);
  revalidatePath(`/${locale}/admin/orders/${id}`);
  revalidatePath(`/${locale}/account`);
  return { ok: true };
}
