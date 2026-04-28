"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error";

interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toast: (input: Omit<ToastItem, "id">) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <Toaster />");
  return ctx;
}

export function Toaster() {
  const [items, setItems] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback(
    (input: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      setItems((cur) => [...cur, { ...input, id }]);
      setTimeout(() => {
        setItems((cur) => cur.filter((i) => i.id !== id));
      }, 4000);
    },
    [setItems]
  );

  React.useEffect(() => {
    (window as unknown as { __toast?: typeof toast }).__toast = toast;
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastPrimitives.Provider swipeDirection="right">
        {items.map((item) => (
          <ToastPrimitives.Root
            key={item.id}
            className={cn(
              "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-right-full",
              item.variant === "success" && "border-emerald-200 bg-emerald-50",
              item.variant === "error" && "border-destructive/30 bg-red-50",
              (!item.variant || item.variant === "default") &&
                "border-border bg-card"
            )}
          >
            <div className="grid gap-1">
              {item.title && (
                <ToastPrimitives.Title className="text-sm font-semibold">
                  {item.title}
                </ToastPrimitives.Title>
              )}
              {item.description && (
                <ToastPrimitives.Description className="text-sm opacity-90">
                  {item.description}
                </ToastPrimitives.Description>
              )}
            </div>
            <ToastPrimitives.Close className="absolute right-2 top-2 rounded-md p-1 opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </ToastPrimitives.Close>
          </ToastPrimitives.Root>
        ))}
        <ToastPrimitives.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-auto sm:right-4 sm:top-4 sm:flex-col md:max-w-[420px]" />
      </ToastPrimitives.Provider>
    </ToastContext.Provider>
  );
}

export function showToast(input: Omit<ToastItem, "id">) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { __toast?: (i: Omit<ToastItem, "id">) => void };
  w.__toast?.(input);
}
