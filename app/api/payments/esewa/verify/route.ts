import { NextResponse } from "next/server";
import { eq, sql, and } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, orderItems, payments, products } from "@/lib/db/schema";
import {
  decodeEsewaResponse,
  verifyEsewaResponseSignature,
  checkEsewaStatus,
} from "@/lib/payments/esewa";
import { onOrderPaid } from "@/lib/notifications/orders";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const data = url.searchParams.get("data");
  const orderId = url.searchParams.get("orderId");
  const locale = url.searchParams.get("locale") ?? "en";
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  if (!data || !orderId) {
    return NextResponse.redirect(`${baseUrl}/${locale}/payment/failure`);
  }

  try {
    const decoded = decodeEsewaResponse(data);
    const secret = process.env.ESEWA_SECRET_KEY!;
    const statusUrl = process.env.ESEWA_STATUS_URL!;
    const merchantCode = process.env.ESEWA_MERCHANT_CODE!;

    if (!verifyEsewaResponseSignature(decoded, secret)) {
      return NextResponse.redirect(`${baseUrl}/${locale}/payment/failure`);
    }

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
        `${baseUrl}/${locale}/payment/success?orderNo=${order.orderNo}&method=esewa`
      );
    }

    if (Math.abs(Number(decoded.total_amount) - Number(order.total)) > 0.01) {
      return NextResponse.redirect(`${baseUrl}/${locale}/payment/failure`);
    }

    const remoteCheck = await checkEsewaStatus({
      productCode: merchantCode,
      totalAmount: Number(order.total),
      transactionUuid: decoded.transaction_uuid,
      statusUrl,
    });
    if (!remoteCheck.ok) {
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
          providerTxnId: decoded.transaction_code,
          rawPayload: { decoded, remote: remoteCheck.raw },
          verifiedAt: new Date(),
        })
        .where(
          and(
            eq(payments.orderId, orderId),
            eq(payments.transactionUuid, decoded.transaction_uuid)
          )
        );

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
      `${baseUrl}/${locale}/payment/success?orderNo=${order.orderNo}&method=esewa`
    );
  } catch (err) {
    console.error("eSewa verify error", err);
    return NextResponse.redirect(`${baseUrl}/${locale}/payment/failure`);
  }
}
