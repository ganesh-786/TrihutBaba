import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { orders, payments } from "@/lib/db/schema";
import { initiateKhalti } from "@/lib/payments/khalti";

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
    if (order.paymentMethod !== "khalti") {
      return NextResponse.json(
        { error: "Order is not a Khalti order" },
        { status: 400 }
      );
    }
    if (order.status === "paid") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 400 }
      );
    }

    const secret = process.env.KHALTI_SECRET_KEY;
    const khaltiBase = process.env.KHALTI_BASE_URL ?? "https://dev.khalti.com";
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
    if (!secret) {
      return NextResponse.json(
        { error: "Khalti is not configured" },
        { status: 500 }
      );
    }

    const total = Number(order.total);

    const init = await initiateKhalti(khaltiBase, secret, {
      return_url: `${baseUrl}/api/payments/khalti/lookup?orderId=${order.id}&locale=${body.locale}`,
      website_url: baseUrl,
      amount: Math.round(total * 100),
      purchase_order_id: order.id,
      purchase_order_name: `Trihutbaba Order ${order.orderNo}`,
      customer_info: {
        name: order.customerName,
        email: order.customerEmail ?? undefined,
        phone: order.customerPhone,
      },
    });

    await db.insert(payments).values({
      orderId: order.id,
      provider: "khalti",
      pidx: init.pidx,
      amount: String(total),
      status: "initiated",
      rawPayload: init as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ paymentUrl: init.payment_url, pidx: init.pidx });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
