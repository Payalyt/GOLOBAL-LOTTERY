import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import crypto from "crypto";
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
      console.log(`[NOWPayments IPN Serverless] Successfully credited ${amount} USD to ${email}. New balance: ${newBal}`);
      return true;
    } else {
      console.error(`[NOWPayments IPN Serverless] User ${email} not found in Firestore database.`);
      return false;
    }
  } catch (err) {
    console.error(`[NOWPayments IPN Serverless] Error updating database:`, err);
    return false;
  }
}

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
    
    // Attempt 2: Direct unsorted stringify
    const stringifiedRaw = JSON.stringify(payload);
    const hmacRaw = crypto.createHmac('sha512', ipnSecret);
    hmacRaw.update(stringifiedRaw);
    const calculatedSigRaw = hmacRaw.digest('hex');
    if (calculatedSigRaw === signature) return true;
    
    return false;
  } catch (err) {
    console.error("[NOWPayments IPN Serverless] Error verifying signature:", err);
    return false;
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = req.body;
    const signature = req.headers["x-nowpayments-sig"] as string;
    
    console.log("[NOWPayments IPN Serverless] Callback received. Signature:", signature);
    console.log("[NOWPayments IPN Serverless] Body:", JSON.stringify(payload));

    const { payment_id, payment_status, price_amount, order_id } = payload;
    const paymentIdStr = payment_id ? payment_id.toString() : `NP-${Date.now()}`;

    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;
    
    // Verify the cryptographic signature sent by NOWPayments
    let isVerified = false;
    if (ipnSecret && signature) {
      isVerified = verifyNowPaymentsSignature(payload, signature, ipnSecret);
    } else {
      console.warn("[NOWPayments IPN Serverless] No IPN Secret or signature provided. Automatic verification bypassed.");
    }

    console.log(`[NOWPayments IPN Serverless] Signature validation: ${isVerified ? "SUCCESS" : "FAILED/BYPASSED"}`);

    // 1. Log Raw IPN to Firestore for Admin Auditing
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
      console.error("[NOWPayments IPN Serverless] Failed to write raw IPN log to Firestore:", logErr);
    }

    // 2. Process Successful Payments
    if (payment_status === "finished" || payment_status === "partially_paid") {
      const amount = price_amount ? parseFloat(price_amount) : 0;
      
      // Attempt to extract user email
      let email = "";
      if (order_id && order_id.startsWith("NP_")) {
        const parts = order_id.split("_");
        if (parts.length >= 3) {
          email = parts[2];
        }
      }

      // Check if this payment has already been credited (idempotency check)
      const txRef = doc(db, 'nowpayments_transactions', paymentIdStr);
      const txSnap = await getDoc(txRef);
      
      if (txSnap.exists() && txSnap.data()?.status === 'completed') {
        console.log(`[NOWPayments IPN Serverless] Payment ${paymentIdStr} has already been credited. Skipping duplicate.`);
        return res.status(200).send("Already processed");
      }

      let autoCredited = false;
      if (isVerified && email && amount > 0) {
        // Automatic credit to user balance
        autoCredited = await creditUserBalance(email, amount, paymentIdStr);
      }

      if (autoCredited) {
        // Log completion in nowpayments_transactions
        await setDoc(txRef, {
          payment_id: paymentIdStr,
          order_id: order_id || '',
          email: email,
          amount: amount,
          status: 'completed',
          payment_status: payment_status,
          processed_at: new Date().toISOString()
        });
        console.log(`[NOWPayments IPN Serverless] Successful auto-credit for ${paymentIdStr}.`);
      } else {
        // FALLBACK: Log as a PENDING deposit request so the admin gets notified!
        const depId = `DEP-NP-${paymentIdStr}`;
        const depRef = doc(db, 'depositRequests', depId);
        
        // Only create if it doesn't already exist
        const depSnap = await getDoc(depRef);
        if (!depSnap.exists()) {
          const finalEmail = email || 'pending_crypto@lottery.com';
          let details = `Automated NOWPayments IPN payment. Status: ${payment_status}.`;
          if (!isVerified) {
            details += " [WARNING: IPN signature failed verification]";
          }
          if (!email) {
            details += " [WARNING: No user email linked to this payment]";
          }

          const pendingReq = {
            id: depId,
            email: finalEmail,
            amount: isNaN(amount) ? 0 : amount,
            gateway: 'NOWPayments Crypto',
            transactionId: paymentIdStr,
            details: details,
            date: new Date().toLocaleDateString('en-GB'),
            status: 'Pending' // Requires admin review & approval!
          };

          await setDoc(depRef, pendingReq);
          console.log(`[NOWPayments IPN Serverless] Logged PENDING deposit request ${depId} for admin manual verification.`);
        }
      }
    } else {
      console.log(`[NOWPayments IPN Serverless] Payment status is '${payment_status}'. Skipping processing.`);
    }

    return res.status(200).send("OK");
  } catch (err: any) {
    console.error("[NOWPayments IPN Serverless] Server Error processing IPN:", err);
    return res.status(500).send("Internal server error: " + err.message);
  }
}
