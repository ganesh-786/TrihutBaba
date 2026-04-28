import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  nameEn: string;
  nameNe: string;
  price: number;
  image: string;
  qty: number;
  stockQty: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
  setOpen: (open: boolean) => void;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hydrated: false,
      setOpen: (open) => set({ isOpen: open }),
      add: (item, qty = 1) => {
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === item.productId
                ? {
                    ...i,
                    qty: Math.min(i.qty + qty, item.stockQty || 999),
                  }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              { ...item, qty: Math.max(1, Math.min(qty, item.stockQty || 999)) },
            ],
          });
        }
      },
      remove: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      setQty: (productId, qty) =>
        set({
          items: get()
            .items.map((i) =>
              i.productId === productId
                ? { ...i, qty: Math.max(1, Math.min(qty, i.stockQty || 999)) }
                : i
            )
            .filter((i) => i.qty > 0),
        }),
      clear: () => set({ items: [] }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "trihutbaba-cart",
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

export const cartSelectors = {
  count: (s: CartState) => s.items.reduce((sum, i) => sum + i.qty, 0),
  subtotal: (s: CartState) =>
    s.items.reduce((sum, i) => sum + i.price * i.qty, 0),
};
