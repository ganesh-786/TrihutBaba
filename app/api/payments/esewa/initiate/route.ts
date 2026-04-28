import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { orders, payments } from "@/lib/db/schema";
import { buildEsewaFields } from "@/lib/payments/esewa";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  orderId: z.string().uuid(),
  locale: z.enum(["en", "ne"]).default("en"),
});

export async function POST(req: Request) {
  try {
    const body = bodySchema.parse(await req.json());
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, body.orderId))
      .limit(1);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.paymentMethod !== "esewa") {
      return NextResponse.json(
        { error: "Order is not an eSewa order" },
        { status: 400 }
      );
    }
    if (order.status === "paid") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 400 }
      );
    }

    const merchantCode = process.env.ESEWA_MERCHANT_CODE;
    const secret = process.env.ESEWA_SECRET_KEY;
    const paymentUrl = process.env.ESEWA_PAYMENT_URL;
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    if (!merchantCode || !secret || !paymentUrl) {
      return NextResponse.json(
        { error: "eSewa credentials are not configured" },
        { status: 500 }
      );
    }

    const transactionUuid = `${order.orderNo}-${Date.now()}`;
    const totalAmount = Number(order.total);

    const fields = buildEsewaFields({
      totalAmount,
      transactionUuid,
      productCode: merchantCode,
      secret,
      successUrl: `${baseUrl}/api/payments/esewa/verify?orderId=${order.id}&locale=${body.locale}`,
      failureUrl: `${baseUrl}/${body.locale}/payment/failure`,
    });

    await db.insert(payments).values({
      orderId: order.id,
      provider: "esewa",
      transactionUuid,
      signature: fields.signature,
      amount: String(totalAmount),
      status: "initiated",
      rawPayload: fields,
    });

    return NextResponse.json({ paymentUrl, fields });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
