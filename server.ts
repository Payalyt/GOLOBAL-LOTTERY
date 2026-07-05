import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import dotenv from "dotenv";

dotenv.config();

// Initialize Firebase App for Server-side Firestore operations
const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const configData = JSON.parse(fs.readFileSync(configPath, "utf8"));

const firebaseConfig = {
  apiKey: configData.apiKey,
  authDomain: configData.authDomain,
  projectId: configData.projectId,
  storageBucket: configData.storageBucket,
  messagingSenderId: configData.messagingSenderId,
  appId: configData.appId,
  measurementId: configData.measurementId
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp, configData.firestoreDatabaseId);

// Function to credit user balance and log approved deposit on backend
async function creditUserBalance(email: string, amount: number, paymentId: string) {
  try {
    const id = 'DEP-' + Math.floor(1000 + Math.random() * 9000);
    const newReq = {
      email: email,
      amount: amount,
      gateway: 'NOWPayments Crypto',
      transactionId: paymentId,
      details: 'Automatic crypto payment via NOWPayments',
      id,
      date: new Date().toLocaleDateString('en-GB'),
      status: 'Approved'
    };
    
    // Save to depositRequests
    const depRef = doc(db, 'depositRequests', id);
    await setDoc(depRef, newReq);
    
    // Update user balance
    const userRef = doc(db, 'users', email.toLowerCase());
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const uData = userSnap.data();
      const currentBalance = uData.balance || 0;
      const newBal = parseFloat((currentBalance + amount).toFixed(2));
      await setDoc(userRef, { balance: newBal }, { merge: true });
      console.log(`[NOWPayments IPN] Successfully credited ${amount} USD to ${email}. New balance: ${newBal}`);
      return true;
    } else {
      console.error(`[NOWPayments IPN] User ${email} not found in Firestore database.`);
      return false;
    }
  } catch (err) {
    console.error(`[NOWPayments IPN] Error updating database:`, err);
    return false;
  }
}

// Cryptographic signature verification for NOWPayments IPN
function verifyNowPaymentsSignature(payload: any, signature: string, ipnSecret: string): boolean {
  try {
    if (!signature || !ipnSecret) return false;
    
    // Attempt 1: Sort alphabetically by key and stringify
    const sortedPayload: any = {};
    Object.keys(payload).sort().forEach(key => {
      sortedPayload[key] = payload[key];
    });
    const stringifiedSorted = JSON.stringify(sortedPayload);
    const hmacSorted = crypto.createHmac('sha512', ipnSecret);
    hmacSorted.update(stringifiedSorted);
    const calculatedSigSorted = hmacSorted.digest('hex');
    if (calculatedSigSorted === signature) return true;
    
    // Attempt 2: Direct unsorted stringify (in case keys are already sorted or formatted by the payload serializer)
    const stringifiedRaw = JSON.stringify(payload);
    const hmacRaw = crypto.createHmac('sha512', ipnSecret);
    hmacRaw.update(stringifiedRaw);
    const calculatedSigRaw = hmacRaw.digest('hex');
    if (calculatedSigRaw === signature) return true;
    
    return false;
  } catch (err) {
    console.error("[NOWPayments IPN] Error verifying signature:", err);
    return false;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use raw and json body parsing
  app.use(express.json());

  // Health check API
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 1. CREATE PAYMENT INVOICE ENDPOINT
  app.post("/api/nowpayments/create-payment", async (req, res) => {
    try {
      const { amount, email } = req.body;
      
      if (!amount || !email) {
        return res.status(400).json({ error: "Missing required fields: amount and email" });
      }

      const apiKey = process.env.NOWPAYMENTS_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "NOWPayments API Key is not configured on the server." });
      }

      // Generate dynamic callback, success, and cancel URLs based on incoming request host
      const host = req.get('host');
      const protocol = req.headers['x-forwarded-proto'] === 'https' || req.secure ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}`;

      // Unique order ID format combining timestamp and customer email
      const orderId = `NP_${Date.now()}_${email.replace(/\s/g, "")}`;

      const payload = {
        price_amount: parseFloat(amount),
        price_currency: "usd",
        order_id: orderId,
        order_description: "Deposit Credit to Golobal Lottery Account",
        ipn_callback_url: `${baseUrl}/api/nowpayments/ipn`,
        success_url: `${baseUrl}/dashboard?payment=success`,
        cancel_url: `${baseUrl}/dashboard?payment=cancel`
      };

      console.log("[NOWPayments] Creating invoice with payload:", payload);

      const response = await fetch("https://api.nowpayments.io/v1/invoice", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[NOWPayments] API Error:", errorText);
        return res.status(response.status).json({ error: "Failed to generate NOWPayments invoice", details: errorText });
      }

      const data = await response.json() as any;
      console.log("[NOWPayments] Invoice generated successfully:", data.invoice_url);

      return res.json({
        invoice_url: data.invoice_url,
        payment_id: data.id,
        order_id: data.order_id
      });
    } catch (err) {
      console.error("[NOWPayments] Server error creating payment:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // 2. IPN CALLBACK HANDLER ENDPOINT
  app.post("/api/nowpayments/ipn", async (req, res) => {
    try {
      const payload = req.body;
      const signature = req.headers["x-nowpayments-sig"] as string;
      
      console.log("[NOWPayments IPN] Callback received. Signature:", signature);
      console.log("[NOWPayments IPN] Body:", JSON.stringify(payload));

      const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
      if (!ipnSecret) {
        console.error("[NOWPayments IPN] IPN Secret is not configured on the server.");
        return res.status(500).send("IPN Secret not configured");
      }

      // Verify the cryptographic signature sent by NOWPayments
      const isVerified = verifyNowPaymentsSignature(payload, signature, ipnSecret);
      if (!isVerified) {
        console.warn("[NOWPayments IPN] Signature validation FAILED. Rejecting request.");
        return res.status(400).send("Invalid signature");
      }

      console.log("[NOWPayments IPN] Signature validation SUCCESS.");

      const { payment_id, payment_status, price_amount, order_id } = payload;

      // Filter for successful payment status
      if (payment_status === "finished" || payment_status === "partially_paid") {
        if (!order_id || !order_id.startsWith("NP_")) {
          console.warn("[NOWPayments IPN] Received success status but order_id is not in expected format:", order_id);
          return res.status(200).send("Ignored due to invalid order_id format");
        }

        // Parse email from our unique order ID: NP_timestamp_email
        const parts = order_id.split("_");
        if (parts.length < 3) {
          console.warn("[NOWPayments IPN] Unable to parse email from order_id:", order_id);
          return res.status(200).send("Ignored due to invalid order_id format");
        }
        
        const email = parts[2];
        const amount = parseFloat(price_amount);

        if (isNaN(amount) || amount <= 0) {
          console.warn("[NOWPayments IPN] Invalid price_amount:", price_amount);
          return res.status(200).send("Invalid amount");
        }

        // Check if this payment has already been credited (idempotency check)
        const txRef = doc(db, 'nowpayments_transactions', payment_id.toString());
        const txSnap = await getDoc(txRef);
        
        if (txSnap.exists() && txSnap.data().status === 'completed') {
          console.log(`[NOWPayments IPN] Payment ${payment_id} has already been credited to ${email}. Skipping duplicate.`);
          return res.status(200).send("Already processed");
        }

        // Update database (credit user balance and log as approved deposit)
        const updated = await creditUserBalance(email, amount, payment_id.toString());
        if (updated) {
          // Log completion inside the nowpayments_transactions tracking collection
          await setDoc(txRef, {
            payment_id: payment_id.toString(),
            order_id: order_id,
            email: email,
            amount: amount,
            status: 'completed',
            payment_status: payment_status,
            processed_at: new Date().toISOString()
          });
          console.log(`[NOWPayments IPN] Processing finished successfully for payment ${payment_id}.`);
        } else {
          console.error(`[NOWPayments IPN] Processing failed during user database credit for payment ${payment_id}.`);
          return res.status(500).send("Database update failed");
        }
      } else {
        console.log(`[NOWPayments IPN] Payment status is '${payment_status}'. Skipping database update.`);
      }

      return res.status(200).send("OK");
    } catch (err) {
      console.error("[NOWPayments IPN] Server Error processing IPN:", err);
      return res.status(500).send("Internal server error");
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
