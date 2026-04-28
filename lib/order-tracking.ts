import crypto from "node:crypto";

function getSecret() {
  const s = process.env.ORDER_TRACKING_SECRET;
  if (!s) throw new Error("ORDER_TRACKING_SECRET missing");
  return s;
}

export function signOrderToken(orderNo: string): string {
  const ts = Date.now();
  const data = `${orderNo}.${ts}`;
  const sig = crypto
    .createHmac("sha256", getSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${sig}`;
}

export function verifyOrderToken(token: string): {
  ok: boolean;
  orderNo?: string;
} {
  try {
    const [orderNo, ts, sig] = token.split(".");
    if (!orderNo || !ts || !sig) return { ok: false };
    const expected = crypto
      .createHmac("sha256", getSecret())
      .update(`${orderNo}.${ts}`)
      .digest("base64url");
    const ok =
      sig.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    return ok ? { ok: true, orderNo } : { ok: false };
  } catch {
    return { ok: false };
  }
}
