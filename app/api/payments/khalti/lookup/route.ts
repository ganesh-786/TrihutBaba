import { NextResponse } from "next/server";
import { eq, sql, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, orderItems, payments, products } from "@/lib/db/schema";
import { lookupKhalti } from "@/lib/payments/khalti";
import { onOrderPaid } from "@/lib/notifications/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pidx = url.searchParams.get("pidx");
  const orderId = url.searchParams.get("orderId");
  const locale = url.searchParams.get("locale") ?? "en";
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  if (!pidx || !orderId) {
    return NextResponse.redirect(`${baseUrl}/${locale}/payment/failure`);
  }

  try {
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);
    if (!order) {
      return NextResponse.redirect(`${baseUrl}/${locale}/payment/failure`);
    }
    if (order.status === "paid") {
      return NextResponse.redirect(
        `${baseUrl}/${locale}/payment/success?orderNo=${order.orderNo}&method=khalti`
      );
    }

    const secret = process.env.KHALTI_SECRET_KEY!;
    const khaltiBase = process.env.KHALTI_BASE_URL ?? "https://dev.khalti.com";

    const lookup = await lookupKhalti(khaltiBase, secret, pidx);

    if (lookup.status !== "Completed") {
      await db
        .update(payments)
        .set({
          status: lookup.status === "Pending" ? "pending" : "failed",
          rawPayload: lookup as unknown as Record<string, unknown>,
        })
        .where(and(eq(payments.orderId, orderId), eq(payments.pidx, pidx)));
      return NextResponse.redirect(`${baseUrl}/${locale}/payment/failure`);
    }

    if (lookup.purchase_order_id && lookup.purchase_order_id !== order.id) {
      return NextResponse.redirect(`${baseUrl}/${locale}/payment/failure`);
    }
    const verifiedAmount = lookup.total_amount / 100;
    if (Math.abs(verifiedAmount - Number(order.total)) > 0.01) {
      return NextResponse.redirect(`${baseUrl}/${locale}/payment/failure`);
    }

    await db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set({
          status: "paid",
          paymentStatus: "completed",
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      await tx
        .update(payments)
        .set({
          status: "completed",
          providerTxnId: lookup.transaction_id,
          rawPayload: lookup as unknown as Record<string, unknown>,
          verifiedAt: new Date(),
        })
        .where(and(eq(payments.orderId, orderId), eq(payments.pidx, pidx)));

      const items = await tx
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, orderId));
      for (const it of items) {
        if (it.productId) {
          await tx
            .update(products)
            .set({ stockQty: sql`${products.stockQty} - ${it.qty}` })
            .where(eq(products.id, it.productId));
        }
      }
    });

    await onOrderPaid(orderId).catch((e) => console.error("notify error", e));

    return NextResponse.redirect(
      `${baseUrl}/${locale}/payment/success?orderNo=${order.orderNo}&method=khalti`
    );
  } catch (err) {
    console.error("Khalti lookup error", err);
    return NextResponse.redirect(`${baseUrl}/${locale}/payment/failure`);
  }
}
