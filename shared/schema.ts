import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, boolean, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const units = pgTable("units", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
  deposit: integer("deposit").notNull(),
  floor: integer("floor").notNull(),
  rent: integer("rent").notNull(),
  maintenance: integer("maintenance").notNull(),
  contractStart: timestamp("contract_start"),
  contractEnd: timestamp("contract_end"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  status: text("status").notNull().default("Active"),
  name: text("name").notNull(),
  unitId: varchar("unit_id").references(() => units.id, { onDelete: "set null" }),
  phone: text("phone").notNull(),
  email: text("email"),
  aadhar: text("aadhar"),
  address: text("address"),
  extraDetails: text("extra_details"),
  emergencyContact: text("emergency_contact"),
  dob: timestamp("dob"),
  workDetails: text("work_details"),
  gender: text("gender"),
  idImageUrl: text("id_image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  transactionType: text("transaction_type").notNull(),
  isIncome: boolean("is_income").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull(),
  paidBy: text("paid_by"),
  receiptUrl: text("receipt_url"),
  unitId: varchar("unit_id").notNull().references(() => units.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const reminders = pgTable("reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  unitId: varchar("unit_id").notNull().references(() => units.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  action: text("action").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

export const insertUnitSchema = createInsertSchema(units).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  contractStart: z.union([z.coerce.date(), z.literal("")]).transform((v) => v === "" ? undefined : v).optional().nullable(),
  contractEnd: z.union([z.coerce.date(), z.literal("")]).transform((v) => v === "" ? undefined : v).optional().nullable(),
});

export const insertTenantSchema = createInsertSchema(tenants).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  dob: z.union([z.coerce.date(), z.literal("")]).transform((v) => v === "" ? undefined : v).optional(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  date: z.union([z.coerce.date(), z.string()]).transform((v) => typeof v === 'string' && v !== "" ? new Date(v) : v),
  amount: z.union([z.string(), z.number()]).transform((v) => {
    if (typeof v === 'string') {
      const parsed = parseFloat(v);
      if (isNaN(parsed)) return 0;
      return parsed.toString();
    }
    return v.toString();
  }).refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, {
    message: "Amount must be a valid positive number"
  }),
});

export const insertReminderSchema = createInsertSchema(reminders).omit({
  id: true,
  createdAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Unit = typeof units.$inferSelect;
export type InsertUnit = z.infer<typeof insertUnitSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Reminder = typeof reminders.$inferSelect;
export type InsertReminder = z.infer<typeof insertReminderSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
