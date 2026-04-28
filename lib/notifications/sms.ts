import type { Order } from "@/lib/db/schema";

/**
 * Sparrow SMS — Nepal-specific transactional SMS.
 * No-op when env vars are missing so dev doesn't fail.
 */
export async function sendOwnerSms({ order }: { order: Order }) {
  const token = process.env.SPARROW_SMS_TOKEN;
  const from = process.env.SPARROW_SMS_FROM ?? "Demo";
  const to = process.env.OWNER_PHONE;
  if (!token || !to) return;

  const text = `New order #${order.orderNo} — NPR ${order.total} from ${order.customerName}, ${order.customerPhone}. Open admin to process.`;

  const url = "https://api.sparrowsms.com/v2/sms/";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        token,
        from,
        to: to.replace(/\D/g, ""),
        text,
      }).toString(),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn("Sparrow SMS failed:", res.status, body);
    }
  } catch (err) {
    console.warn("Sparrow SMS error:", err);
  }
}

export async function sendCustomerSms(phone: string, text: string) {
  const token = process.env.SPARROW_SMS_TOKEN;
  const from = process.env.SPARROW_SMS_FROM ?? "Demo";
  if (!token || !phone) return;
  try {
    await fetch("https://api.sparrowsms.com/v2/sms/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        token,
        from,
        to: phone.replace(/\D/g, ""),
        text,
      }).toString(),
    });
  } catch (err) {
    console.warn("Sparrow customer SMS error:", err);
  }
}
