import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import configData from "../../firebase-applet-config.json";

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

export default async function handler(req: any, res: any) {
  // Set CORS headers
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
    const host = req.headers['host'] || req.get?.('host') || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    // Unique order ID format combining timestamp and customer email
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

    console.log("[NOWPayments Serverless] Creating invoice with payload:", payload);

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
      console.error("[NOWPayments Serverless] API Error:", errorText);
      return res.status(response.status).json({ error: "Failed to generate NOWPayments invoice", details: errorText });
    }

    const data = await response.json() as any;
    console.log("[NOWPayments Serverless] Invoice generated successfully:", data.invoice_url);

    return res.json({
      invoice_url: data.invoice_url,
      payment_id: data.id,
      order_id: data.order_id
    });
  } catch (err: any) {
    console.error("[NOWPayments Serverless] Server error creating payment:", err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
