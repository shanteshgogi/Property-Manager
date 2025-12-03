import { db } from "./firebase.js";
import { FieldValue } from "firebase-admin/firestore";

export async function logActivity(
  entityType: string,
  entityId: string,
  action: string,
  message: string
) {
  try {
    await db.collection("activity_logs").add({
      entityType,
      entityId,
      action,
      message,
      createdAt: FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
