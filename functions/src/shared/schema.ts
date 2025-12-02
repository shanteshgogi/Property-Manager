import { z } from "zod";

export const insertPropertySchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
});

export const insertUnitSchema = z.object({
  name: z.string().min(1, "Name is required"),
  propertyId: z.string().min(1, "Property ID is required"),
  deposit: z.number().int().nonnegative(),
  floor: z.number().int(),
  rent: z.number().int().nonnegative(),
  maintenance: z.number().int().nonnegative(),
  contractStart: z.string().optional().nullable(),
  contractEnd: z.string().optional().nullable(),
});

export const insertTenantSchema = z.object({
  status: z.string().default("Active"),
  name: z.string().min(1, "Name is required"),
  unitId: z.string().optional().nullable(),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().nullable(),
  aadhar: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  extraDetails: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  dob: z.string().optional().nullable(),
  workDetails: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  idImageUrl: z.string().optional().nullable(),
});

export const insertTransactionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  transactionType: z.string().min(1, "Transaction Type is required"),
  isIncome: z.boolean(),
  amount: z.coerce.number().nonnegative({
    message: "Amount must be a valid positive number"
  }).transform((v) => v.toString()),
  date: z.string().min(1, "Date is required"),
  paidBy: z.string().optional().nullable(),
  receiptUrl: z.string().optional().nullable(),
  unitId: z.string().min(1, "Unit ID is required"),
});

export const insertReminderSchema = z.object({
  unitId: z.string().min(1, "Unit ID is required"),
  message: z.string().min(1, "Message is required"),
});

export const insertActivityLogSchema = z.object({
  entityType: z.string(),
  entityId: z.string(),
  action: z.string(),
  message: z.string(),
});

export type Property = z.infer<typeof insertPropertySchema> & { id: string; createdAt: Date };
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Unit = z.infer<typeof insertUnitSchema> & { id: string; createdAt: Date; updatedAt: Date };
export type InsertUnit = z.infer<typeof insertUnitSchema>;

export type Tenant = z.infer<typeof insertTenantSchema> & { id: string; createdAt: Date; updatedAt: Date };
export type InsertTenant = z.infer<typeof insertTenantSchema>;

export type Transaction = z.infer<typeof insertTransactionSchema> & { id: string; createdAt: Date; updatedAt: Date };
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Reminder = z.infer<typeof insertReminderSchema> & { id: string; createdAt: Date };
export type InsertReminder = z.infer<typeof insertReminderSchema>;

export type ActivityLog = z.infer<typeof insertActivityLogSchema> & { id: string; createdAt: Date };
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
