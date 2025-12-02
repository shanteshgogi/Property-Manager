import { db } from "./firebase";

async function verify() {
    try {
        console.log("Attempting to connect to Firestore...");

        // Try a simple write and read operation
        const testRef = db.collection("_test").doc("connection");
        await testRef.set({
            timestamp: new Date(),
            message: "Firebase connection test"
        });

        const doc = await testRef.get();
        console.log("✓ Successfully connected to Firestore!");
        console.log("✓ Write operation successful");
        console.log("✓ Read operation successful");
        console.log("✓ Data:", doc.data());

        // Clean up test document
        await testRef.delete();
        console.log("✓ Delete operation successful");

        console.log("\n✅ Firebase is properly configured and working!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Failed to connect to Firestore:", error);
        process.exit(1);
    }
}

verify();
