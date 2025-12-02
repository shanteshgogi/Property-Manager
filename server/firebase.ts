import admin from "firebase-admin";

import path from "path";
import fs from "fs";

if (!admin.apps.length) {
  try {
    const serviceAccountPath = path.resolve(process.cwd(), "property-manager-f2fb9-firebase-adminsdk-fbsvc-3a8bc8e3ca.json");

    if (fs.existsSync(serviceAccountPath)) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
      });
      console.log("Firebase initialized with service account");
    } else {
      console.warn("Firebase service account file not found, falling back to default credentials");
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  } catch (error) {
    console.error("Firebase admin initialization error", error);
  }
}

export const db = admin.firestore();
