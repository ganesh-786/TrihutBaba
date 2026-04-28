import crypto from "node:crypto";

export interface EsewaInitiateFields {
  amount: string;
  tax_amount: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  product_service_charge: string;
  product_delivery_charge: string;
  success_url: string;
  failure_url: string;
  signed_field_names: string;
  signature: string;
}

/**
 * HMAC-SHA256 base64 signature over `total_amount=...,transaction_uuid=...,product_code=...`
 * Required by eSewa ePay v2.
 */
export function generateEsewaSignature(
  secret: string,
  signString: string
): string {
  return crypto.createHmac("sha256", secret).update(signString).digest("base64");
}

export function buildEsewaFields(params: {
  totalAmount: number;
  transactionUuid: string;
  productCode: string;
  secret: string;
  successUrl: string;
  failureUrl: string;
  taxAmount?: number;
  productServiceCharge?: number;
  productDeliveryCharge?: number;
}): EsewaInitiateFields {
  const tax = params.taxAmount ?? 0;
  const service = params.productServiceCharge ?? 0;
  const delivery = params.productDeliveryCharge ?? 0;
  const amount = params.totalAmount - tax - service - delivery;
  const signString = `total_amount=${params.totalAmount},transaction_uuid=${params.transactionUuid},product_code=${params.productCode}`;
  const signature = generateEsewaSignature(params.secret, signString);

  return {
    amount: String(amount),
    tax_amount: String(tax),
    total_amount: String(params.totalAmount),
    transaction_uuid: params.transactionUuid,
    product_code: params.productCode,
    product_service_charge: String(service),
    product_delivery_charge: String(delivery),
    success_url: params.successUrl,
    failure_url: params.failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature,
  };
}

export interface EsewaResponseDecoded {
  transaction_code: string;
  status: string;
  total_amount: string;
  transaction_uuid: string;
  product_code: string;
  signed_field_names: string;
  signature: string;
}

export function decodeEsewaResponse(base64: string): EsewaResponseDecoded {
  const json = Buffer.from(base64, "base64").toString("utf-8");
  return JSON.parse(json);
}

export function verifyEsewaResponseSignature(
  payload: EsewaResponseDecoded,
  secret: string
): boolean {
  const fields = payload.signed_field_names.split(",");
  const signString = fields
    .map((f) => `${f}=${(payload as unknown as Record<string, string>)[f]}`)
    .join(",");
  const expected = generateEsewaSignature(secret, signString);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(payload.signature)
    );
  } catch {
    return false;
  }
}

/**
 * Calls eSewa transaction-status API to confirm a payment server-side.
 * Returns true only if status === "COMPLETE" and amount matches.
 */
export async function checkEsewaStatus(params: {
  productCode: string;
  totalAmount: number;
  transactionUuid: string;
  statusUrl: string;
}): Promise<{ ok: boolean; status: string; raw: unknown }> {
  const url = new URL(params.statusUrl);
  url.searchParams.set("product_code", params.productCode);
  url.searchParams.set("total_amount", String(params.totalAmount));
  url.searchParams.set("transaction_uuid", params.transactionUuid);

  const res = await fetch(url.toString(), { method: "GET", cache: "no-store" });
  if (!res.ok) return { ok: false, status: "HTTP_ERROR", raw: { code: res.status } };
  const data = (await res.json()) as { status?: string; total_amount?: number };
  return {
    ok:
      data.status === "COMPLETE" &&
      Math.abs(Number(data.total_amount ?? 0) - params.totalAmount) < 0.01,
    status: data.status ?? "UNKNOWN",
    raw: data,
  };
}
