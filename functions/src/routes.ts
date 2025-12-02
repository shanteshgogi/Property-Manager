import type { Express } from "express";
import express from "express";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "./firebase.js";
import { logActivity } from "./lib/activityLogger.js";
import {
  insertPropertySchema,
  insertUnitSchema,
  insertTenantSchema,
  insertTransactionSchema,
} from "./shared/schema.js";
import { upload } from "./lib/fileUpload.js";
import { generateCSV } from "./lib/csvExport.js";

export function registerRoutes(app: Express): void {
  // Serve uploaded files statically
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  });
  app.use("/uploads", express.static("uploads"));

  // Helper to convert Firestore doc to object with ID and Dates
  const toObject = (doc: any) => {
    const data = doc.data();
    const result: any = { id: doc.id, ...data };

    // Convert Timestamps to Dates
    for (const key in result) {
      if (result[key] && typeof result[key].toDate === 'function') {
        result[key] = result[key].toDate();
      }
    }
    return result;
  };

  // ============ PROPERTIES ============

  app.get("/api/properties", async (req, res) => {
    try {
      const snapshot = await db.collection("properties").get();
      const allProperties = snapshot.docs.map(toObject);
      res.json(allProperties);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const doc = await db.collection("properties").doc(req.params.id).get();

      if (!doc.exists) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Property not found" } });
      }

      res.json(toObject(doc));
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const validated = insertPropertySchema.parse(req.body);
      const docRef = await db.collection("properties").add({
        ...validated,
        createdAt: FieldValue.serverTimestamp(),
      });

      const newProperty = toObject(await docRef.get());

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
      const docRef = db.collection("properties").doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Property not found" } });
      }

      await docRef.update(validated);
      const updated = toObject(await docRef.get());

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
      const docRef = db.collection("properties").doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Property not found" } });
      }

      await docRef.delete();

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  // ============ UNITS ============

  app.get("/api/units", async (req, res) => {
    try {
      const { propertyId } = req.query;
      let query = db.collection("units");

      if (propertyId) {
        // @ts-ignore
        query = query.where("propertyId", "==", propertyId as string);
      }

      const snapshot = await query.get();
      const allUnits = snapshot.docs.map(toObject);
      res.json(allUnits);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.get("/api/units/:id", async (req, res) => {
    try {
      const doc = await db.collection("units").doc(req.params.id).get();

      if (!doc.exists) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Unit not found" } });
      }

      res.json(toObject(doc));
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.post("/api/units", async (req, res) => {
    try {
      const validated = insertUnitSchema.parse(req.body);
      const docRef = await db.collection("units").add({
        ...validated,
        contractStart: validated.contractStart ? new Date(validated.contractStart) : null,
        contractEnd: validated.contractEnd ? new Date(validated.contractEnd) : null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const newUnit = toObject(await docRef.get());

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
      const docRef = db.collection("units").doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Unit not found" } });
      }

      await docRef.update({
        ...validated,
        contractStart: validated.contractStart ? new Date(validated.contractStart) : null,
        contractEnd: validated.contractEnd ? new Date(validated.contractEnd) : null,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const updated = toObject(await docRef.get());

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
      const docRef = db.collection("units").doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Unit not found" } });
      }

      await docRef.delete();

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  // ============ TENANTS ============

  app.get("/api/tenants", async (req, res) => {
    try {
      const { status, unitId } = req.query;
      let query = db.collection("tenants");

      if (status) {
        // @ts-ignore
        query = query.where("status", "==", status as string);
      }
      if (unitId) {
        // @ts-ignore
        query = query.where("unitId", "==", unitId as string);
      }

      const snapshot = await query.get();
      const allTenants = snapshot.docs.map(toObject);
      res.json(allTenants);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.get("/api/tenants/:id", async (req, res) => {
    try {
      const doc = await db.collection("tenants").doc(req.params.id).get();

      if (!doc.exists) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Tenant not found" } });
      }

      res.json(toObject(doc));
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.post("/api/tenants", async (req, res) => {
    try {
      const validated = insertTenantSchema.parse(req.body);
      const docRef = await db.collection("tenants").add({
        ...validated,
        dob: validated.dob ? new Date(validated.dob) : null,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const newTenant = toObject(await docRef.get());

      if (newTenant.unitId) {
        const unitDoc = await db.collection("units").doc(newTenant.unitId).get();
        if (unitDoc.exists) {
          const unit = toObject(unitDoc);
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
      const docRef = db.collection("tenants").doc(req.params.id);
      const oldDoc = await docRef.get();

      if (!oldDoc.exists) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Tenant not found" } });
      }

      const oldTenant = toObject(oldDoc);

      await docRef.update({
        ...validated,
        dob: validated.dob ? new Date(validated.dob) : null,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const updated = toObject(await docRef.get());

      if (oldTenant.unitId !== updated.unitId) {
        if (updated.unitId) {
          const unitDoc = await db.collection("units").doc(updated.unitId).get();
          if (unitDoc.exists) {
            const unit = toObject(unitDoc);
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
      const docRef = db.collection("tenants").doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Tenant not found" } });
      }

      await docRef.delete();

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  // ============ TRANSACTIONS ============

  app.get("/api/transactions", async (req, res) => {
    try {
      const { unitId, isIncome, startDate, endDate } = req.query;
      let query = db.collection("transactions").orderBy("date", "desc");

      if (unitId) {
        // @ts-ignore
        query = query.where("unitId", "==", unitId as string);
      }
      if (isIncome !== undefined) {
        // @ts-ignore
        query = query.where("isIncome", "==", isIncome === "true");
      }
      if (startDate) {
        // @ts-ignore
        query = query.where("date", ">=", new Date(startDate as string));
      }
      if (endDate) {
        // @ts-ignore
        query = query.where("date", "<=", new Date(endDate as string));
      }

      const snapshot = await query.get();
      const allTransactions = snapshot.docs.map(toObject);
      res.json(allTransactions);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  app.get("/api/transactions/:id", async (req, res) => {
    try {
      const doc = await db.collection("transactions").doc(req.params.id).get();

      if (!doc.exists) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Transaction not found" } });
      }

      res.json(toObject(doc));
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
      const docRef = await db.collection("transactions").add({
        ...validated,
        date: new Date(validated.date),
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const newTransaction = toObject(await docRef.get());

      const unitDoc = await db.collection("units").doc(newTransaction.unitId).get();
      if (unitDoc.exists) {
        const unit = toObject(unitDoc);
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
      const docRef = db.collection("transactions").doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Transaction not found" } });
      }

      await docRef.update({
        ...validated,
        date: new Date(validated.date),
        updatedAt: FieldValue.serverTimestamp(),
      });

      const updated = toObject(await docRef.get());

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
      const docRef = db.collection("transactions").doc(req.params.id);
      const doc = await docRef.get();

      if (!doc.exists) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Transaction not found" } });
      }

      await docRef.delete();

      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  // ============ DASHBOARD / CALCULATIONS ============

  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const { propertyId, startDate, endDate } = req.query;

      let transactionsQuery = db.collection("transactions");

      if (propertyId) {
        const unitsSnapshot = await db.collection("units").where("propertyId", "==", propertyId as string).get();
        // @ts-ignore
        const unitIds = unitsSnapshot.docs.map(doc => doc.id);

        if (unitIds.length > 0) {
          if (unitIds.length <= 10) {
            // @ts-ignore
            transactionsQuery = transactionsQuery.where("unitId", "in", unitIds);
          } else {
            // Fallback: fetch all and filter in memory
          }
        } else {
          return res.json({ totalIncome: 0, totalExpense: 0, netBalance: 0, occupancyRate: 0, totalUnits: 0, occupiedUnits: 0 });
        }
      }

      if (startDate) {
        // @ts-ignore
        transactionsQuery = transactionsQuery.where("date", ">=", new Date(startDate as string));
      }
      if (endDate) {
        // @ts-ignore
        transactionsQuery = transactionsQuery.where("date", "<=", new Date(endDate as string));
      }

      const snapshot = await transactionsQuery.get();
      let allTransactions = snapshot.docs.map(toObject);

      if (propertyId) {
        const unitsSnapshot = await db.collection("units").where("propertyId", "==", propertyId as string).get();
        const unitIds = unitsSnapshot.docs.map((doc: any) => doc.id);
        if (unitIds.length > 10) {
          // Filter in memory if we couldn't use 'in' query
          allTransactions = allTransactions.filter((t: any) => unitIds.includes(t.unitId));
        }
      }

      const totalIncome = allTransactions
        .filter((t: any) => t.isIncome)
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

      const totalExpense = allTransactions
        .filter((t: any) => !t.isIncome)
        .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0);

      let unitsQuery = db.collection("units");
      if (propertyId) {
        // @ts-ignore
        unitsQuery = unitsQuery.where("propertyId", "==", propertyId as string);
      }
      const unitsSnapshot = await unitsQuery.get();
      const allUnits = unitsSnapshot.docs.map(toObject);

      const tenantsSnapshot = await db.collection("tenants").where("status", "==", "Active").get();
      const activeTenants = tenantsSnapshot.docs.map(toObject);

      const occupiedUnits = activeTenants.filter((t: any) =>
        allUnits.some((u: any) => u.id === t.unitId)
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

      let query = db.collection("activity_logs").orderBy("createdAt", "desc");

      if (entityType) {
        // @ts-ignore
        query = query.where("entityType", "==", entityType as string);
      }
      if (entityId) {
        // @ts-ignore
        query = query.where("entityId", "==", entityId as string);
      }

      if (limit) {
        query = query.limit(parseInt(limit as string));
      } else {
        query = query.limit(10);
      }

      const snapshot = await query.get();
      const logs = snapshot.docs.map(toObject);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: { code: "INTERNAL_ERROR", message: error.message } });
    }
  });

  // ============ REMINDERS ============

  app.get("/api/reminders", async (req, res) => {
    try {
      const snapshot = await db.collection("reminders").orderBy("createdAt", "desc").get();
      const allReminders = snapshot.docs.map(toObject);
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
      let query = db.collection("tenants");

      if (status) {
        // @ts-ignore
        query = query.where("status", "==", status as string);
      }
      if (unitId) {
        // @ts-ignore
        query = query.where("unitId", "==", unitId as string);
      }

      const snapshot = await query.get();
      const data = snapshot.docs.map(toObject);
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
      let query = db.collection("transactions").orderBy("date", "desc");

      if (unitId) {
        // @ts-ignore
        query = query.where("unitId", "==", unitId as string);
      }
      if (isIncome !== undefined) {
        // @ts-ignore
        query = query.where("isIncome", "==", isIncome === "true");
      }
      if (startDate) {
        // @ts-ignore
        query = query.where("date", ">=", new Date(startDate as string));
      }
      if (endDate) {
        // @ts-ignore
        query = query.where("date", "<=", new Date(endDate as string));
      }

      const snapshot = await query.get();
      const data = snapshot.docs.map(toObject);
      const headers = ["id", "name", "transactionType", "isIncome", "amount", "date", "paidBy", "unitId"];
      const csv = generateCSV(data, headers);

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=transactions.csv");
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: { code: "EXPORT_ERROR", message: error.message } });
    }
  });

}
