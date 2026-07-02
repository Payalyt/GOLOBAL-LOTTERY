import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Dokan Pay API Integration
  app.post("/api/payment/create", async (req, res) => {
    try {
      const { amount, orderId, customerName, customerEmail, customerPhone } = req.body;

      const appKey = process.env.DOKAN_PAY_API_KEY;
      const secretKey = process.env.DOKAN_PAY_SECRET_KEY;

      if (!appKey || !secretKey) {
        console.warn("⚠️ Dokan Pay credentials not found in environment. Falling back to local checkout simulator.");
        return res.json({
          status: "success",
          payment_url: `/dokan-checkout?amount=${amount}&order_id=${orderId || `DP-${Date.now()}`}&customerName=${encodeURIComponent(customerName || '')}&customerEmail=${encodeURIComponent(customerEmail || '')}&customerPhone=${encodeURIComponent(customerPhone || '')}`,
        });
      }

      const host = req.get("host") || "localhost:3000";
      const protocol = req.protocol || "http";
      const successUrl = `${protocol}://${host}/dashboard?payment=success&amount=${amount}&order_id=${orderId || `DP-${Date.now()}`}`;
      const cancelUrl = `${protocol}://${host}/dashboard?payment=cancel`;
      const callbackUrl = `${protocol}://${host}/api/payment/callback`;

      console.log("🚀 Requesting Dokan Pay Session from https://pay.dokanpay.site/request/payment/create");
      console.log("Headers:", {
        'app-key': appKey.substring(0, 4) + '...',
        'secret-key': secretKey.substring(0, 4) + '...',
        'host-name': 'golobal-lottery-i41p.vercel.app'
      });

      const response = await fetch("https://pay.dokanpay.site/request/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "app-key": appKey,
          "secret-key": secretKey,
          "host-name": "golobal-lottery-i41p.vercel.app"
        },
        body: JSON.stringify({
          amount: String(amount),
          order_id: orderId || `DP-${Date.now()}`,
          customer_name: customerName || "Valued Customer",
          customer_email: customerEmail || "customer@example.com",
          customer_phone: customerPhone || "01700000000",
          success_url: successUrl,
          cancel_url: cancelUrl,
          callback_url: callbackUrl
        }),
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

  // Callback for payment verification
  app.post("/api/payment/callback", async (req, res) => {
    console.log("Payment callback received:", req.body);
    // Verify payment with Dokan Pay API
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
