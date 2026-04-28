import { Resend } from "resend";
import type { Order, OrderItem } from "@/lib/db/schema";
import { signOrderToken } from "@/lib/order-tracking";

const resendKey = process.env.RESEND_API_KEY;
const fromAddress =
  process.env.EMAIL_FROM ?? "Trihutbaba <orders@trihutbaba.kesug.com>";
const ownerEmail = process.env.OWNER_EMAIL;

let _client: Resend | null = null;
function client() {
  if (!resendKey) return null;
  if (!_client) _client = new Resend(resendKey);
  return _client;
}

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://trihutbaba.kesug.com";

function npr(amount: string | number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function itemsTable(items: OrderItem[]) {
  return items
    .map(
      (i) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${i.nameSnapshot}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${npr(i.priceSnapshot)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${npr(Number(i.priceSnapshot) * i.qty)}</td>
        </tr>`
    )
    .join("");
}

const wrap = (title: string, body: string) => `
  <div style="font-family:Inter,Arial,sans-serif;background:#f7f7f5;padding:24px">
    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #eee">
      <div style="background:#1d6f3c;color:#fff;padding:24px">
        <div style="font-size:18px;font-weight:700">Trihutbaba Store & Machinery</div>
        <div style="font-size:14px;opacity:0.85">${title}</div>
      </div>
      <div style="padding:24px;color:#222;font-size:14px;line-height:1.5">
        ${body}
      </div>
      <div style="padding:16px;border-top:1px solid #eee;background:#fafaf7;font-size:12px;color:#888;text-align:center">
        © ${new Date().getFullYear()} Trihutbaba — Nepal
      </div>
    </div>
  </div>`;

export async function sendOwnerAlertEmail({
  order,
  items,
}: {
  order: Order;
  items: OrderItem[];
}) {
  const c = client();
  if (!c || !ownerEmail) return;
  const html = wrap(
    `New paid order #${order.orderNo}`,
    `
      <p><strong>${order.customerName}</strong> just placed an order:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#f4f4f0;text-align:left">
            <th style="padding:8px">Item</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Price</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${itemsTable(items)}</tbody>
      </table>
      <p><strong>Total: ${npr(order.total)}</strong> · ${order.paymentMethod.toUpperCase()}</p>
      <p>
        Ship to: ${order.customerName}, ${order.customerPhone}<br/>
        ${order.shippingArea}, ${order.shippingCity}, ${order.shippingDistrict}, ${order.shippingProvince}
        ${order.shippingLandmark ? `<br/>(near ${order.shippingLandmark})` : ""}
      </p>
      <p><a href="${SITE_URL}/en/admin/orders/${order.id}" style="color:#1d6f3c">Open order in admin</a></p>
    `
  );
  await c.emails.send({
    from: fromAddress,
    to: ownerEmail,
    subject: `[Trihutbaba] New order #${order.orderNo} — ${npr(order.total)}`,
    html,
  });
}

export async function sendOrderConfirmationEmail({
  order,
  items,
}: {
  order: Order;
  items: OrderItem[];
}) {
  const c = client();
  if (!c || !order.customerEmail) return;
  const html = wrap(
    `Order confirmed — #${order.orderNo}`,
    `
      <p>Hi ${order.customerName},</p>
      <p>Thanks for your order! We've received your payment and will start preparing your shipment shortly.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#f4f4f0;text-align:left">
            <th style="padding:8px">Item</th>
            <th style="padding:8px;text-align:center">Qty</th>
            <th style="padding:8px;text-align:right">Price</th>
            <th style="padding:8px;text-align:right">Total</th>
          </tr>
        </thead>
        <tbody>${itemsTable(items)}</tbody>
      </table>
      <p><strong>Total paid: ${npr(order.total)}</strong></p>
      <p><a href="${SITE_URL}/${order.locale}/account/orders/${order.orderNo}?token=${signOrderToken(order.orderNo)}" style="color:#1d6f3c">Track your order</a></p>
    `
  );
  await c.emails.send({
    from: fromAddress,
    to: order.customerEmail,
    subject: `Order #${order.orderNo} confirmed`,
    html,
  });
}

export async function sendOrderStatusEmail({
  order,
  to,
}: {
  order: Order;
  to: string;
}) {
  const c = client();
  if (!c || !order.customerEmail) return;
  const html = wrap(
    `Order #${order.orderNo} is now ${to}`,
    `
      <p>Hi ${order.customerName},</p>
      <p>Your order <strong>#${order.orderNo}</strong> status was updated to <strong>${to}</strong>.</p>
      <p><a href="${SITE_URL}/${order.locale}/account/orders/${order.orderNo}?token=${signOrderToken(order.orderNo)}" style="color:#1d6f3c">View order</a></p>
    `
  );
  await c.emails.send({
    from: fromAddress,
    to: order.customerEmail,
    subject: `Order #${order.orderNo} — ${to}`,
    html,
  });
}
