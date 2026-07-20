import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// --- FIREBASE INITIALIZATION ---
let configData: any = {};
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(configPath)) {
    configData = JSON.parse(fs.readFileSync(configPath, "utf8"));
  }
} catch (err) {
  console.warn("[Server] Could not read firebase-applet-config.json. Relying on environment variables.", err);
}

const firebaseConfig = {
  apiKey: configData.apiKey || process.env.VITE_FIREBASE_API_KEY,
  authDomain: configData.authDomain || process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: configData.projectId || process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: configData.storageBucket || process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: configData.messagingSenderId || process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: configData.appId || process.env.VITE_FIREBASE_APP_ID,
  measurementId: configData.measurementId || process.env.VITE_FIREBASE_MEASUREMENT_ID
};

let db: any = null;
if (firebaseConfig.projectId) {
  try {
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp, configData.firestoreDatabaseId || "(default)");
    console.log("[Server] Firebase Firestore initialized successfully on backend.");
  } catch (err) {
    console.error("[Server] Failed to initialize Firestore on backend:", err);
  }
} else {
  console.warn("[Server] Firebase Project ID is missing. Firestore operations will be disabled.");
}

// --- GEMINI INITIALIZATION ---
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("[Gemini API] GEMINI_API_KEY is not defined. AI insights will use local simulation.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// --- HELPER FUNCTIONS ---
async function creditUserBalance(email: string, amount: number, paymentId: string) {
  if (!db) {
    console.error("[Server] Firestore is not initialized. Cannot credit user balance.");
    return false;
  }
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
    
    const depRef = doc(db, 'depositRequests', id);
    await setDoc(depRef, newReq);
    
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

function verifyNowPaymentsSignature(payload: any, signature: string, ipnSecret: string): boolean {
  try {
    if (!signature || !ipnSecret) return false;
    
    const sortedPayload: any = {};
    Object.keys(payload).sort().forEach(key => {
      sortedPayload[key] = payload[key];
    });
    const stringifiedSorted = JSON.stringify(sortedPayload);
    const hmacSorted = crypto.createHmac('sha512', ipnSecret);
    hmacSorted.update(stringifiedSorted);
    const calculatedSigSorted = hmacSorted.digest('hex');
    if (calculatedSigSorted === signature) return true;
    
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

// --- EXPRESS APPLICATION SETUP ---
const app = express();
const PORT = 3000;

// Universal Middleware: CORS Handlers & JSON Body Parser
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// --- API ROUTES ---

// 1. Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 2. NOWPayments Create Payment Invoice Endpoint
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

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] === 'https' || req.secure ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;
    const orderId = `NP_${Date.now()}_${email.replace(/\s/g, "")}`;

    const payload = {
      price_amount: parseFloat(amount),
      price_currency: "usd",
      order_id: orderId,
      order_description: "Deposit Credit to Global Lottery Account",
      ipn_callback_url: `${baseUrl}/api/nowpayments/ipn`,
      success_url: `${baseUrl}/dashboard?payment=success`,
      cancel_url: `${baseUrl}/dashboard?payment=cancel`
    };

    console.log("[NOWPayments] Creating invoice:", payload);

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
    return res.json({
      invoice_url: data.invoice_url,
      payment_id: data.id,
      order_id: data.order_id
    });
  } catch (err: any) {
    console.error("[NOWPayments] Server error:", err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

// 3. NOWPayments IPN Callback Handler Endpoint
app.post("/api/nowpayments/ipn", async (req, res) => {
  try {
    const payload = req.body;
    const signature = req.headers["x-nowpayments-sig"] as string;
    
    console.log("[NOWPayments IPN] Callback received. Signature:", signature);

    const { payment_id, payment_status, price_amount, order_id } = payload;
    const paymentIdStr = payment_id ? payment_id.toString() : `NP-${Date.now()}`;
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    
    let isVerified = false;
    if (ipnSecret && signature) {
      isVerified = verifyNowPaymentsSignature(payload, signature, ipnSecret);
    } else {
      console.warn("[NOWPayments IPN] Verification bypassed (No IPN Secret or signature provided).");
    }

    console.log(`[NOWPayments IPN] Validation status: ${isVerified ? "SUCCESS" : "FAILED/BYPASSED"}`);

    if (db) {
      try {
        const rawLogRef = doc(db, 'nowpayments_raw_ipns', paymentIdStr);
        await setDoc(rawLogRef, {
          payment_id: paymentIdStr,
          order_id: order_id || '',
          price_amount: price_amount ? parseFloat(price_amount) : 0,
          payment_status: payment_status || '',
          is_verified: isVerified,
          payload: payload,
          received_at: new Date().toISOString()
        }, { merge: true });
      } catch (logErr) {
        console.error("[NOWPayments IPN] Raw IPN log failed:", logErr);
      }
    }

    if (payment_status === "finished" || payment_status === "partially_paid") {
      const amount = price_amount ? parseFloat(price_amount) : 0;
      let email = "";
      if (order_id && order_id.startsWith("NP_")) {
        const parts = order_id.split("_");
        if (parts.length >= 3) {
          email = parts[2];
        }
      }

      if (db) {
        const txRef = doc(db, 'nowpayments_transactions', paymentIdStr);
        const txSnap = await getDoc(txRef);
        
        if (txSnap.exists() && txSnap.data().status === 'completed') {
          console.log(`[NOWPayments IPN] Payment ${paymentIdStr} already credited. Skipping.`);
          return res.status(200).send("Already processed");
        }

        let autoCredited = false;
        if (isVerified && email && amount > 0) {
          autoCredited = await creditUserBalance(email, amount, paymentIdStr);
        }

        if (autoCredited) {
          await setDoc(txRef, {
            payment_id: paymentIdStr,
            order_id: order_id || '',
            email: email,
            amount: amount,
            status: 'completed',
            payment_status: payment_status,
            processed_at: new Date().toISOString()
          });
        } else {
          const depId = `DEP-NP-${paymentIdStr}`;
          const depRef = doc(db, 'depositRequests', depId);
          const depSnap = await getDoc(depRef);
          if (!depSnap.exists()) {
            const finalEmail = email || 'pending_crypto@lottery.com';
            let details = `Automated NOWPayments IPN payment. Status: ${payment_status}.`;
            if (!isVerified) details += " [WARNING: IPN signature failed verification]";
            if (!email) details += " [WARNING: No user email linked]";

            await setDoc(depRef, {
              id: depId,
              email: finalEmail,
              amount: isNaN(amount) ? 0 : amount,
              gateway: 'NOWPayments Crypto',
              transactionId: paymentIdStr,
              details: details,
              date: new Date().toLocaleDateString('en-GB'),
              status: 'Pending'
            });
            console.log(`[NOWPayments IPN] Logged PENDING deposit request ${depId} for admin review.`);
          }
        }
      }
    }

    return res.status(200).send("OK");
  } catch (err: any) {
    console.error("[NOWPayments IPN] Server Error:", err);
    return res.status(500).send("Internal server error");
  }
});

// 4. Dokan Pay Transaction Verification Proxy Route
app.post("/api/payment/verify", async (req, res) => {
  try {
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ error: "Missing transactionId" });
    }

    const apiKey = process.env.DOKAN_PAY_API_KEY;
    const secretKey = process.env.DOKAN_PAY_SECRET_KEY;

    if (!apiKey) {
      console.warn("[Dokan Pay] API Key is not configured. Defaulting to sandbox success fallback.");
      return res.json({ status: "1", message: "success", success: true, is_sandbox: true });
    }

    console.log(`[Dokan Pay] Verifying transactionId: ${transactionId}`);
    
    const response = await fetch(`https://dokanpay.com.bd/api/transaction-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        transaction_id: transactionId,
        secret_key: secretKey || ""
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Dokan Pay] API responded with error:", errorText);
      return res.status(200).json({ status: "0", message: "API response error: " + errorText, success: false });
    }

    const data = await response.json() as any;
    return res.json(data);
  } catch (err: any) {
    console.error("[Dokan Pay] Verification error:", err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

// 5. Gemini Smart Lottery Predictor & Advice Endpoint
app.post("/api/gemini/lucky-numbers", async (req, res) => {
  try {
    const { gameName, count } = req.body;
    const countNum = parseInt(count, 10) || 6;
    
    const ai = getGeminiClient();
    if (!ai) {
      const fallbackNumbers = Array.from({ length: countNum }, () => Math.floor(Math.random() * 99) + 1);
      return res.json({
        numbers: fallbackNumbers,
        advice: "Please configure your GEMINI_API_KEY in Settings > Secrets to unlock live artificial intelligence stats and custom machine learning sequence predictions! (Falling back to random seed)"
      });
    }

    console.log(`[Gemini API] Generating predictions for game: ${gameName}`);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate exactly ${countNum} lottery numbers (as simple integers between 1 and 99) for the game "${gameName || 'Global Lottery'}". Also provide one short, encouraging prediction insight (under 15 words) based on mathematical probability and statistical machine learning hotspots.`,
      config: {
        systemInstruction: "You are an elite statistical lottery mathematician and predictive AI assistant. Always output a short, helpful summary."
      }
    });

    const text = response.text || "";
    const matchedNumbers = text.match(/\b\d+\b/g);
    const numbers = matchedNumbers 
      ? matchedNumbers.slice(0, countNum).map(Number).filter(n => n >= 1 && n <= 99)
      : [];

    res.json({
      numbers: numbers.length === countNum ? numbers : Array.from({ length: countNum }, () => Math.floor(Math.random() * 99) + 1),
      advice: text.trim(),
    });
  } catch (err: any) {
    console.error("[Gemini API] Failed to query model:", err);
    res.status(500).json({ error: "Internal server error", message: err.message });
  }
});

// --- VITE MIDDLEWARE / STATIC ASSETS ---
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  console.log("[Server] Development mode: Mounting Vite live development server middleware.");
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then(vite => {
    app.use(vite.middlewares);
  }).catch(err => {
    console.error("[Server] Failed to create Vite server:", err);
  });
} else {
  console.log("[Server] Production mode: Serving static files from 'dist' folder.");
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// --- STANDALONE LISTENER (Cloud Run, Local, VPS) ---
// Only listen on port 3000 if not running within a Serverless Vercel environment
if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Standalone server active and listening on http://localhost:${PORT}`);
  });
}

// Export default for Vercel Serverless Function compatibility
export default app;
