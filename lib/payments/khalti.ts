export interface KhaltiInitiatePayload {
  return_url: string;
  website_url: string;
  amount: number;
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
}

export interface KhaltiLookupResponse {
  pidx: string;
  total_amount: number;
  status:
    | "Completed"
    | "Pending"
    | "Refunded"
    | "Expired"
    | "User canceled"
    | "Failed";
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
  purchase_order_id?: string;
}

export async function initiateKhalti(
  baseUrl: string,
  secret: string,
  payload: KhaltiInitiatePayload
): Promise<KhaltiInitiateResponse> {
  const res = await fetch(`${baseUrl}/api/v2/epayment/initiate/`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Key ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Khalti initiate failed: ${res.status} ${text}`);
  }
  return (await res.json()) as KhaltiInitiateResponse;
}

export async function lookupKhalti(
  baseUrl: string,
  secret: string,
  pidx: string
): Promise<KhaltiLookupResponse> {
  const res = await fetch(`${baseUrl}/api/v2/epayment/lookup/`, {
    method: "POST",
    cache: "no-store",
    headers: {
      Authorization: `Key ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Khalti lookup failed: ${res.status} ${text}`);
  }
  return (await res.json()) as KhaltiLookupResponse;
}
