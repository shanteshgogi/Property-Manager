import * as functions from "firebase-functions/v2";
import express from "express";
import admin from "firebase-admin";

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

// Import routes
import { registerRoutes } from "./routes.js";

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Register routes
registerRoutes(app);

// Export as Cloud Function
export const api = functions.https.onRequest(
    {
        region: "us-central1",
        memory: "512MiB",
        timeoutSeconds: 60,
        maxInstances: 10,
    },
    app
);
