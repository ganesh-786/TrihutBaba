import {
  pgTable,
  text,
  uuid,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["customer", "admin"]);

export const productStatus = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

export const orderStatus = pgEnum("order_status", [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
]);

export const paymentMethod = pgEnum("payment_method", [
  "esewa",
  "khalti",
  "cod",
]);

export const paymentStatus = pgEnum("payment_status", [
  "initiated",
  "pending",
  "completed",
  "failed",
  "refunded",
]);

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").unique(),
    phone: text("phone"),
    name: text("name"),
    role: userRole("role").notNull().default("customer"),
    locale: text("locale").notNull().default("en"),
    authId: uuid("auth_id").unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
    authIdx: index("users_auth_idx").on(t.authId),
  })
);

export const addresses = pgTable("addresses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  label: text("label"),
  recipient: text("recipient").notNull(),
  phone: text("phone").notNull(),
  province: text("province").notNull(),
  district: text("district").notNull(),
  city: text("city").notNull(),
  area: text("area").notNull(),
  landmark: text("landmark"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    nameEn: text("name_en").notNull(),
    nameNe: text("name_ne").notNull(),
    descriptionEn: text("description_en"),
    descriptionNe: text("description_ne"),
    parentId: uuid("parent_id"),
    imageUrl: text("image_url"),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("categories_slug_idx").on(t.slug),
    parentIdx: index("categories_parent_idx").on(t.parentId),
  })
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    nameEn: text("name_en").notNull(),
    nameNe: text("name_ne").notNull(),
    descriptionEn: text("description_en"),
    descriptionNe: text("description_ne"),
    shortDescriptionEn: text("short_description_en"),
    shortDescriptionNe: text("short_description_ne"),
    priceNpr: numeric("price_npr", { precision: 12, scale: 2 }).notNull(),
    compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 2 }),
    sku: text("sku").unique(),
    stockQty: integer("stock_qty").notNull().default(0),
    categoryId: uuid("category_id").references(() => categories.id, {
      onDelete: "set null",
    }),
    brand: text("brand"),
    weightKg: numeric("weight_kg", { precision: 8, scale: 2 }),
    status: productStatus("status").notNull().default("draft"),
    featured: boolean("featured").notNull().default(false),
    seoTitleEn: text("seo_title_en"),
    seoTitleNe: text("seo_title_ne"),
    seoDescriptionEn: text("seo_description_en"),
    seoDescriptionNe: text("seo_description_ne"),
    keywords: text("keywords").array(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("products_slug_idx").on(t.slug),
    statusIdx: index("products_status_idx").on(t.status),
    categoryIdx: index("products_category_idx").on(t.categoryId),
    featuredIdx: index("products_featured_idx").on(t.featured),
  })
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    altEn: text("alt_en"),
    altNe: text("alt_ne"),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    productIdx: index("product_images_product_idx").on(t.productId),
  })
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderNo: text("order_no").notNull().unique(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    status: orderStatus("status").notNull().default("pending"),
    paymentMethod: paymentMethod("payment_method").notNull(),
    paymentStatus: paymentStatus("payment_status")
      .notNull()
      .default("initiated"),
    subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull(),
    shippingFee: numeric("shipping_fee", { precision: 12, scale: 2 })
      .notNull()
      .default("0"),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("NPR"),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email"),
    customerPhone: text("customer_phone").notNull(),
    shippingProvince: text("shipping_province").notNull(),
    shippingDistrict: text("shipping_district").notNull(),
    shippingCity: text("shipping_city").notNull(),
    shippingArea: text("shipping_area").notNull(),
    shippingLandmark: text("shipping_landmark"),
    notes: text("notes"),
    locale: text("locale").notNull().default("en"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    statusIdx: index("orders_status_idx").on(t.status),
    userIdx: index("orders_user_idx").on(t.userId),
    orderNoIdx: uniqueIndex("orders_order_no_idx").on(t.orderNo),
    createdIdx: index("orders_created_idx").on(t.createdAt),
  })
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, {
      onDelete: "set null",
    }),
    nameSnapshot: text("name_snapshot").notNull(),
    slugSnapshot: text("slug_snapshot"),
    imageSnapshot: text("image_snapshot"),
    priceSnapshot: numeric("price_snapshot", {
      precision: 12,
      scale: 2,
    }).notNull(),
    qty: integer("qty").notNull(),
  },
  (t) => ({
    orderIdx: index("order_items_order_idx").on(t.orderId),
  })
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: paymentMethod("provider").notNull(),
    providerTxnId: text("provider_txn_id"),
    transactionUuid: text("transaction_uuid"),
    pidx: text("pidx"),
    signature: text("signature"),
    amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
    status: paymentStatus("status").notNull().default("initiated"),
    rawPayload: jsonb("raw_payload"),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orderIdx: index("payments_order_idx").on(t.orderId),
    txnIdx: index("payments_txn_idx").on(t.transactionUuid),
    pidxIdx: index("payments_pidx_idx").on(t.pidx),
  })
);

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  orders: many(orders),
}));

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: "parent_child",
  }),
  children: many(categories, { relationName: "parent_child" }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
  payments: many(payments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductImage = typeof productImages.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;
export type Address = typeof addresses.$inferSelect;

export const dbSql = sql;
