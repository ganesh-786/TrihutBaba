"use client";

import * as React from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface Img {
  id: string;
  url: string;
  altEn: string | null;
  altNe: string | null;
}

export function ProductGallery({
  images,
  name,
}: {
  images: Img[];
  name: string;
}) {
  const list = images.length > 0 ? images : [
    { id: "ph", url: "/placeholder-product.svg", altEn: name, altNe: name },
  ];
  const [active, setActive] = React.useState(0);

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-2xl border bg-secondary/40">
        <AnimatePresence mode="wait">
          <motion.div
            key={list[active].id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={list[active].url}
              alt={list[active].altEn ?? name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {list.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {list.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-md border transition-all",
                i === active
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-border hover:border-primary/50"
              )}
              aria-label={`Image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.altEn ?? name}
                fill
                sizes="100px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
