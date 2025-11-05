import cron from "node-cron";
import { db } from "../db";
import { units, reminders } from "../../shared/schema";
import { and, isNotNull, lte, gte, notExists, eq } from "drizzle-orm";

export function startCronJobs() {
  // Run daily at 9 AM to check for contract renewals
  cron.schedule("0 9 * * *", async () => {
    console.log("Running contract renewal check...");
    
    try {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const today = new Date();
      
      const expiringUnits = await db
        .select()
        .from(units)
        .where(
          and(
            isNotNull(units.contractEnd),
            gte(units.contractEnd, today),
            lte(units.contractEnd, thirtyDaysFromNow)
          )
        );
      
      for (const unit of expiringUnits) {
        const existingReminder = await db
          .select()
          .from(reminders)
          .where(eq(reminders.unitId, unit.id))
          .limit(1);
        
        if (existingReminder.length === 0 && unit.contractEnd) {
          const daysUntilExpiry = Math.ceil(
            (unit.contractEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          
          await db.insert(reminders).values({
            unitId: unit.id,
            message: `Contract for unit ${unit.name} expires in ${daysUntilExpiry} days (${unit.contractEnd.toLocaleDateString()})`,
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
