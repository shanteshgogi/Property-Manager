import cron from "node-cron";
import { db } from "../firebase";
import { FieldValue } from "firebase-admin/firestore";

export function startCronJobs() {
  // Run daily at 9 AM to check for contract renewals
  cron.schedule("0 9 * * *", async () => {
    console.log("Running contract renewal check...");

    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

      const today = new Date();

      const unitsSnapshot = await db.collection("units")
        .where("contractEnd", ">=", today)
        .where("contractEnd", "<=", thirtyDaysFromNow)
        .get();

      const expiringUnits = unitsSnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as any));

      for (const unit of expiringUnits) {
        if (!unit.contractEnd) continue;

        // Convert Firestore Timestamp to Date if needed
        const contractEnd = unit.contractEnd.toDate ? unit.contractEnd.toDate() : new Date(unit.contractEnd);

        const existingReminderSnapshot = await db.collection("reminders")
          .where("unitId", "==", unit.id)
          .limit(1)
          .get();

        if (existingReminderSnapshot.empty) {
          const daysUntilExpiry = Math.ceil(
            (contractEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );

          await db.collection("reminders").add({
            unitId: unit.id,
            message: `Contract for unit ${unit.name} expires in ${daysUntilExpiry} days (${contractEnd.toLocaleDateString()})`,
            createdAt: FieldValue.serverTimestamp(),
          });

          console.log(`Created reminder for unit ${unit.name}`);
        }
      }

      console.log(`Contract renewal check complete. Found ${expiringUnits.length} units expiring soon.`);
    } catch (error) {
      console.error("Error in contract renewal check:", error);
    }
  });

  console.log("Cron jobs started");
}
