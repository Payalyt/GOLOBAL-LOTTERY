import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import FormData from "form-data";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Dokan Pay API Integration
  app.post("/api/payment/create", async (req, res) => {
    try {
      const { amount, orderId, customerName, customerEmail, customerPhone } = req.body;

      const appKey = process.env.DOKAN_PAY_API_KEY || "kyOxtE0i2cuLw";
      const secretKey = process.env.DOKAN_PAY_SECRET_KEY || "42542724";

      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol || "http";
      const successUrl = `${protocol}://${host}/dashboard?payment=success&amount=${amount}&order_id=${orderId || `DP-${Date.now()}`}`;
      const cancelUrl = `${protocol}://${host}/dashboard?payment=cancel`;

      console.log("🚀 Creating Dokan Pay Session from https://pay.dokanpay.site/request/payment/create");
      console.log("Headers:", {
        'app-key': appKey.substring(0, 4) + '...',
        'secret-key': secretKey.substring(0, 4) + '...',
        'host-name': 'golobal-lottery-i41p.vercel.app'
      });

      const form = new FormData();
      form.append("cus_name", customerName || "Customer");
      form.append("cus_email", customerEmail || "customer@example.com");
      form.append("amount", String(amount));
      form.append("success_url", successUrl);
      form.append("cancel_url", cancelUrl);

      const response = await fetch("https://pay.dokanpay.site/request/payment/create", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "app-key": appKey,
          "secret-key": secretKey,
          "host-name": "golobal-lottery-i41p.vercel.app",
          ...form.getHeaders()
        },
        body: form as any,
      });

      console.log("Dokan Pay API Response Status:", response.status);
      const text = await response.text();
      console.log("Dokan Pay API Response Body:", text);

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Dokan Pay API Error (Status ${response.status}): ${text || 'Unknown Error'}`
        });
      }

      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Dokan Pay API returned invalid JSON", e);
        return res.status(502).json({ error: "Invalid JSON response from Dokan Pay API" });
      }

      // Check for any successful redirection url in common keys
      const redirectUrl = data.payment_url || data.url || data.redirect_url || data.payment_link || 
                         (data.data && (data.data.payment_url || data.data.url || data.data.redirect_url || data.data.payment_link));

      if (redirectUrl) {
        return res.json({
          status: "success",
          payment_url: redirectUrl,
        });
      } else {
        console.warn("⚠️ No payment_url returned from Dokan Pay. Falling back to local checkout simulator.");
        return res.json({
          status: "success",
          payment_url: `/dokan-checkout?amount=${amount}&order_id=${orderId || `DP-${Date.now()}`}&customerName=${encodeURIComponent(customerName || '')}&customerEmail=${encodeURIComponent(customerEmail || '')}&customerPhone=${encodeURIComponent(customerPhone || '')}`,
        });
      }
    } catch (error: any) {
      console.error("Payment creation error:", error);
      res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  });

  // Verification endpoint for Dokan Pay transactions
  app.post("/api/payment/verify", async (req, res) => {
    try {
      const { transactionId } = req.body;
      const appKey = process.env.DOKAN_PAY_API_KEY || "kyOxtE0i2cuLw";
      const secretKey = process.env.DOKAN_PAY_SECRET_KEY || "42542724";

      if (!transactionId) {
        return res.status(400).json({ error: "transactionId is required" });
      }

      console.log("🚀 Verifying Dokan Pay transaction_id:", transactionId);

      const form = new FormData();
      form.append("transaction_id", transactionId);

      const response = await fetch("https://pay.dokanpay.site/request/payment/verify", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "app-key": appKey,
          "secret-key": secretKey,
          "host-name": "golobal-lottery-i41p.vercel.app",
          ...form.getHeaders()
        },
        body: form as any,
      });

      console.log("Dokan Pay Verify API Status:", response.status);
      const text = await response.text();
      console.log("Dokan Pay Verify API Response:", text);

      if (!response.ok) {
        return res.status(response.status).json({
          error: `Dokan Pay Verify API Error (Status ${response.status}): ${text || 'Unknown Error'}`
        });
      }

      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Dokan Pay Verify API returned invalid JSON", e);
        return res.status(502).json({ error: "Invalid response from Dokan Pay Verify API" });
      }

      return res.json(data);
    } catch (error: any) {
      console.error("Payment verification error:", error);
      res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
  });

  // Callback for payment verification
  app.post("/api/payment/callback", async (req, res) => {
    console.log("Payment callback received:", req.body);
    res.json({ status: "ok" });
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
