import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { db } from "./db";
import {  properties,
  units,
  tenants,
  transactions,
  reminders,
  activityLogs,
  insertPropertySchema,
  insertUnitSchema,
  insertTenantSchema,
  insertTransactionSchema,
} from "../shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { upload } from "./lib/fileUpload";
import { logActivity } from "./lib/activityLogger";
import { generateCSV } from "./lib/csvExport";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded files statically
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });
  app.use("/uploads", express.static("uploads"));

  // ============ PROPERTIES ============
  
  app.get("/api/properties", async (req, res) => {
    try {
      const allProperties = await db.select().from(properties);
      res.json(allProperties);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const [property] = await db
        .select()
        .from(properties)
        .where(eq(properties.id, req.params.id));
      
      if (!property) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Property not found" } });
      }
      
      res.json(property);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const validated = insertPropertySchema.parse(req.body);
      const [newProperty] = await db.insert(properties).values(validated).returning();
      
      await logActivity("property", newProperty.id, "property_created", `Property "${newProperty.name}" created`);
      
      res.status(201).json(newProperty);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.errors } });
      }
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.put("/api/properties/:id", async (req, res) => {
    try {
      const validated = insertPropertySchema.parse(req.body);
      const [updated] = await db
        .update(properties)
        .set(validated)
        .where(eq(properties.id, req.params.id))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Property not found" } });
      }
      
      await logActivity("property", updated.id, "property_updated", `Property "${updated.name}" updated`);
      
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.errors } });
      }
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const [deleted] = await db
        .delete(properties)
        .where(eq(properties.id, req.params.id))
        .returning();
      
      if (!deleted) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Property not found" } });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  // ============ UNITS ============
  
  app.get("/api/units", async (req, res) => {
    try {
      const { propertyId } = req.query;
      let query = db.select().from(units);
      
      if (propertyId) {
        query = query.where(eq(units.propertyId, propertyId as string)) as any;
      }
      
      const allUnits = await query;
      res.json(allUnits);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.get("/api/units/:id", async (req, res) => {
    try {
      const [unit] = await db
        .select()
        .from(units)
        .where(eq(units.id, req.params.id));
      
      if (!unit) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Unit not found" } });
      }
      
      res.json(unit);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.post("/api/units", async (req, res) => {
    try {
      const validated = insertUnitSchema.parse(req.body);
      const [newUnit] = await db.insert(units).values(validated).returning();
      
      await logActivity("unit", newUnit.id, "unit_created", `Unit "${newUnit.name}" created`);
      await logActivity("property", newUnit.propertyId, "unit_added", `Unit "${newUnit.name}" added to property`);
      
      res.status(201).json(newUnit);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.errors } });
      }
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.put("/api/units/:id", async (req, res) => {
    try {
      const validated = insertUnitSchema.parse(req.body);
      const [updated] = await db
        .update(units)
        .set({ ...validated, updatedAt: new Date() })
        .where(eq(units.id, req.params.id))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Unit not found" } });
      }
      
      await logActivity("unit", updated.id, "unit_updated", `Unit "${updated.name}" updated`);
      
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.errors } });
      }
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.delete("/api/units/:id", async (req, res) => {
    try {
      const [deleted] = await db
        .delete(units)
        .where(eq(units.id, req.params.id))
        .returning();
      
      if (!deleted) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Unit not found" } });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  // ============ TENANTS ============
  
  app.get("/api/tenants", async (req, res) => {
    try {
      const { status, unitId } = req.query;
      let query = db.select().from(tenants);
      
      const conditions = [];
      if (status) conditions.push(eq(tenants.status, status as string));
      if (unitId) conditions.push(eq(tenants.unitId, unitId as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const allTenants = await query;
      res.json(allTenants);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.get("/api/tenants/:id", async (req, res) => {
    try {
      const [tenant] = await db
        .select()
        .from(tenants)
        .where(eq(tenants.id, req.params.id));
      
      if (!tenant) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Tenant not found" } });
      }
      
      res.json(tenant);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.post("/api/tenants", async (req, res) => {
    try {
      const validated = insertTenantSchema.parse(req.body);
      const [newTenant] = await db.insert(tenants).values(validated).returning();
      
      if (newTenant.unitId) {
        const [unit] = await db.select().from(units).where(eq(units.id, newTenant.unitId));
        if (unit) {
          await logActivity("unit", newTenant.unitId, "tenant_added", `Tenant "${newTenant.name}" added to unit ${unit.name}`);
        }
      }
      
      res.status(201).json(newTenant);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.errors } });
      }
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.put("/api/tenants/:id", async (req, res) => {
    try {
      const validated = insertTenantSchema.parse(req.body);
      const [oldTenant] = await db.select().from(tenants).where(eq(tenants.id, req.params.id));
      
      const [updated] = await db
        .update(tenants)
        .set({ ...validated, updatedAt: new Date() })
        .where(eq(tenants.id, req.params.id))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Tenant not found" } });
      }
      
      if (oldTenant.unitId !== updated.unitId) {
        if (updated.unitId) {
          const [unit] = await db.select().from(units).where(eq(units.id, updated.unitId));
          if (unit) {
            await logActivity("unit", updated.unitId, "tenant_moved", `Tenant "${updated.name}" moved to unit ${unit.name}`);
          }
        }
      }
      
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.errors } });
      }
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.delete("/api/tenants/:id", async (req, res) => {
    try {
      const [deleted] = await db
        .delete(tenants)
        .where(eq(tenants.id, req.params.id))
        .returning();
      
      if (!deleted) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Tenant not found" } });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  // ============ TRANSACTIONS ============
  
  app.get("/api/transactions", async (req, res) => {
    try {
      const { unitId, isIncome, startDate, endDate } = req.query;
      let query = db.select().from(transactions).orderBy(desc(transactions.date));
      
      const conditions = [];
      if (unitId) conditions.push(eq(transactions.unitId, unitId as string));
      if (isIncome !== undefined) conditions.push(eq(transactions.isIncome, isIncome === "true"));
      if (startDate) conditions.push(gte(transactions.date, new Date(startDate as string)));
      if (endDate) conditions.push(lte(transactions.date, new Date(endDate as string)));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const allTransactions = await query;
      res.json(allTransactions);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const [transaction] = await db
        .select()
        .from(transactions)
        .where(eq(transactions.id, req.params.id));
      
      if (!transaction) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Transaction not found" } });
      }
      
      res.json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const data = req.body;
      
      if (data.transactionType === "Rent" || data.transactionType === "Deposit") {
        data.isIncome = true;
      }
      
      const validated = insertTransactionSchema.parse(data);
      const [newTransaction] = await db.insert(transactions).values(validated).returning();
      
      const [unit] = await db.select().from(units).where(eq(units.id, newTransaction.unitId));
      if (unit) {
        const amount = parseFloat(newTransaction.amount);
        await logActivity(
          "unit",
          newTransaction.unitId,
          "transaction_added",
          `${newTransaction.isIncome ? "Income" : "Expense"} of ₹${amount.toLocaleString()} - ${newTransaction.name}`
        );
      }
      
      res.status(201).json(newTransaction);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.errors } });
      }
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const data = req.body;
      
      if (data.transactionType === "Rent" || data.transactionType === "Deposit") {
        data.isIncome = true;
      }
      
      const validated = insertTransactionSchema.parse(data);
      const [updated] = await db
        .update(transactions)
        .set({ ...validated, updatedAt: new Date() })
        .where(eq(transactions.id, req.params.id))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Transaction not found" } });
      }
      
      res.json(updated);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid input", details: error.errors } });
      }
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const [deleted] = await db
        .delete(transactions)
        .where(eq(transactions.id, req.params.id))
        .returning();
      
      if (!deleted) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Transaction not found" } });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  // ============ DASHBOARD / CALCULATIONS ============
  
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const { propertyId, startDate, endDate } = req.query;
      
      let transactionsQuery = db.select().from(transactions);
      const conditions = [];
      
      if (propertyId) {
        const propertyUnits = await db.select().from(units).where(eq(units.propertyId, propertyId as string));
        const unitIds = propertyUnits.map(u => u.id);
        if (unitIds.length > 0) {
          conditions.push(sql`${transactions.unitId} IN ${unitIds}`);
        } else {
          return res.json({ totalIncome: 0, totalExpense: 0, netBalance: 0, occupancyRate: 0 });
        }
      }
      
      if (startDate) conditions.push(gte(transactions.date, new Date(startDate as string)));
      if (endDate) conditions.push(lte(transactions.date, new Date(endDate as string)));
      
      if (conditions.length > 0) {
        transactionsQuery = transactionsQuery.where(and(...conditions)) as any;
      }
      
      const allTransactions = await transactionsQuery;
      
      const totalIncome = allTransactions
        .filter(t => t.isIncome)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const totalExpense = allTransactions
        .filter(t => !t.isIncome)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      let unitsQuery = db.select().from(units);
      if (propertyId) {
        unitsQuery = unitsQuery.where(eq(units.propertyId, propertyId as string)) as any;
      }
      const allUnits = await unitsQuery;
      
      const activeTenants = await db
        .select()
        .from(tenants)
        .where(eq(tenants.status, "Active"));
      
      const occupiedUnits = activeTenants.filter(t => 
        allUnits.some(u => u.id === t.unitId)
      ).length;
      
      const occupancyRate = allUnits.length > 0 
        ? Math.round((occupiedUnits / allUnits.length) * 100) 
        : 0;
      
      res.json({
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
        occupancyRate,
        totalUnits: allUnits.length,
        occupiedUnits,
      });
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  // ============ ACTIVITY LOGS ============
  
  app.get("/api/activity-logs", async (req, res) => {
    try {
      const { entityType, entityId, limit } = req.query;
      
      let query = db.select().from(activityLogs).orderBy(desc(activityLogs.createdAt));
      
      const conditions = [];
      if (entityType) conditions.push(eq(activityLogs.entityType, entityType as string));
      if (entityId) conditions.push(eq(activityLogs.entityId, entityId as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      if (limit) {
        query = query.limit(parseInt(limit as string)) as any;
      } else {
        query = query.limit(10) as any;
      }
      
      const logs = await query;
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  // ============ REMINDERS ============
  
  app.get("/api/reminders", async (req, res) => {
    try {
      const allReminders = await db.select().from(reminders).orderBy(desc(reminders.createdAt));
      res.json(allReminders);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  // ============ FILE UPLOAD ============
  
  app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: { code: "NO_FILE", message: "No file uploaded" } });
      }
      
      res.json({
        url: `/uploads/${req.file.filename}`,
        filename: req.file.filename,
        size: req.file.size,
        mime: req.file.mimetype,
      });
    } catch (error: any) {
      res.status(500).json({ error: { code: "UPLOAD_ERROR", message: error.message } });
    }
  });

  // ============ CSV EXPORT ============
  
  app.get("/api/export/tenants", async (req, res) => {
    try {
      const { status, unitId } = req.query;
      let query = db.select().from(tenants);
      
      const conditions = [];
      if (status) conditions.push(eq(tenants.status, status as string));
      if (unitId) conditions.push(eq(tenants.unitId, unitId as string));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const data = await query;
      const headers = ["id", "name", "status", "phone", "email", "unitId", "gender", "dob", "workDetails"];
      const csv = generateCSV(data, headers);
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=tenants.csv");
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: { code: "EXPORT_ERROR", message: error.message } });
    }
  });

  app.get("/api/export/transactions", async (req, res) => {
    try {
      const { unitId, isIncome, startDate, endDate } = req.query;
      let query = db.select().from(transactions).orderBy(desc(transactions.date));
      
      const conditions = [];
      if (unitId) conditions.push(eq(transactions.unitId, unitId as string));
      if (isIncome !== undefined) conditions.push(eq(transactions.isIncome, isIncome === "true"));
      if (startDate) conditions.push(gte(transactions.date, new Date(startDate as string)));
      if (endDate) conditions.push(lte(transactions.date, new Date(endDate as string)));
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }
      
      const data = await query;
      const headers = ["id", "name", "transactionType", "isIncome", "amount", "date", "paidBy", "unitId"];
      const csv = generateCSV(data, headers);
      
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: { code: "EXPORT_ERROR", message: error.message } });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
