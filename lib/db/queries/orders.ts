import { desc, eq, sql, type SQL } from "drizzle-orm";
import { db } from "../client";
import { orders, orderItems } from "../schema";

export async function listOrders(filters?: {
  status?: string;
  limit?: number;
}) {
  const where: SQL[] = [];
  if (filters?.status && filters.status !== "all") {
    where.push(sql`${orders.status} = ${filters.status}`);
  }
  return db.query.orders.findMany({
    where: where.length ? sql.join(where, sql` AND `) : undefined,
    orderBy: desc(orders.createdAt),
    limit: filters?.limit ?? 100,
  });
}

export async function getOrderByNo(orderNo: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.orderNo, orderNo),
    with: {
      items: true,
      payments: true,
    },
  });
  return order ?? null;
}

export async function getOrderById(id: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: true,
      payments: true,
    },
  });
  return order ?? null;
}

export async function getOrderItems(orderId: string) {
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}
