/**
 * Hooks fired after order status transitions. Phase 5 implementation:
 * sends email (Resend) to owner + customer and SMS (Sparrow) to owner.
 * Safe to call without configured creds — failures are swallowed.
 */
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, orderItems } from "@/lib/db/schema";
import { sendOrderConfirmationEmail, sendOwnerAlertEmail } from "./email";
import { sendOwnerSms } from "./sms";

export async function onOrderPaid(orderId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return;
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  await Promise.all([
    sendOwnerAlertEmail({ order, items }).catch(() => null),
    order.customerEmail
      ? sendOrderConfirmationEmail({ order, items }).catch(() => null)
      : null,
    sendOwnerSms({ order }).catch(() => null),
  ]);
}

export async function onOrderStatusChanged(
  orderId: string,
  to: "processing" | "shipped" | "delivered" | "cancelled" | "refunded"
) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) return;
  if (order.customerEmail) {
    const { sendOrderStatusEmail } = await import("./email");
    await sendOrderStatusEmail({ order, to }).catch(() => null);
  }
}
