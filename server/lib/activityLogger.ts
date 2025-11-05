import { db } from "../db";
import { activityLogs, type InsertActivityLog } from "../../shared/schema";

export async function logActivity(
  entityType: string,
  entityId: string,
  action: string,
  message: string
) {
  try {
    await db.insert(activityLogs).values({
      entityType,
      entityId,
      action,
      message,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
