"use server";

import { z } from "zod";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, orderItems, products, payments } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { generateOrderNo } from "@/lib/utils";

const checkoutSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().min(7),
  province: z.string().min(1),
  district: z.string().min(1),
  city: z.string().min(1),
  area: z.string().min(1),
  landmark: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  paymentMethod: z.enum(["esewa", "khalti", "cod"]),
  locale: z.enum(["en", "ne"]),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        qty: z.number().int().min(1),
      })
    )
    .min(1),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export interface CheckoutResult {
  orderId: string;
  orderNo: string;
  paymentMethod: "esewa" | "khalti" | "cod";
  total: number;
}

export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const data = checkoutSchema.parse(input);
  const user = await getCurrentUser();

  return await db.transaction(async (tx) => {
    const productIds = data.items.map((i) => i.productId);
    const dbProducts = await tx
      .select()
      .from(products)
      .where(sql`${products.id} = ANY(${sql.raw(`ARRAY[${productIds.map((id) => `'${id}'`).join(",")}]::uuid[]`)})`);

    if (dbProducts.length !== productIds.length) {
      throw new Error("One or more products are no longer available.");
    }

    let subtotal = 0;
    const items: {
      productId: string;
      nameSnapshot: string;
      slugSnapshot: string;
      priceSnapshot: string;
      qty: number;
    }[] = [];
    for (const it of data.items) {
      const p = dbProducts.find((x) => x.id === it.productId)!;
      if (p.status !== "active") {
        throw new Error(`Product "${p.nameEn}" is not available.`);
      }
      if (p.stockQty < it.qty) {
        throw new Error(`Not enough stock for "${p.nameEn}".`);
      }
      const linePrice = Number(p.priceNpr);
      subtotal += linePrice * it.qty;
      items.push({
        productId: p.id,
        nameSnapshot: data.locale === "ne" ? p.nameNe : p.nameEn,
        slugSnapshot: p.slug,
        priceSnapshot: String(linePrice),
        qty: it.qty,
      });
    }

    const shippingFee = subtotal >= 5000 ? 0 : 150;
    const total = subtotal + shippingFee;
    const orderNo = generateOrderNo();

    const [order] = await tx
      .insert(orders)
      .values({
        orderNo,
        userId: user?.id ?? null,
        status: "pending",
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentMethod === "cod" ? "pending" : "initiated",
        subtotal: String(subtotal),
        shippingFee: String(shippingFee),
        total: String(total),
        currency: "NPR",
        customerName: data.customerName,
        customerEmail: data.customerEmail || null,
        customerPhone: data.customerPhone,
        shippingProvince: data.province,
        shippingDistrict: data.district,
        shippingCity: data.city,
        shippingArea: data.area,
        shippingLandmark: data.landmark || null,
        notes: data.notes || null,
        locale: data.locale,
      })
      .returning({ id: orders.id, orderNo: orders.orderNo, total: orders.total });

    await tx
      .insert(orderItems)
      .values(items.map((it) => ({ ...it, orderId: order.id })));

    await tx.insert(payments).values({
      orderId: order.id,
      provider: data.paymentMethod,
      amount: String(total),
      status: "initiated",
    });

    if (data.paymentMethod === "cod") {
      await tx
        .update(orders)
        .set({ status: "paid", paymentStatus: "completed", updatedAt: new Date() })
        .where(eq(orders.id, order.id));
      for (const it of items) {
        await tx
          .update(products)
          .set({ stockQty: sql`${products.stockQty} - ${it.qty}` })
          .where(eq(products.id, it.productId));
      }
    }

    return {
      orderId: order.id,
      orderNo: order.orderNo,
      paymentMethod: data.paymentMethod,
      total,
    };
  });
}
