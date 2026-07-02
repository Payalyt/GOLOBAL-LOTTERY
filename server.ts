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

      if (!process.env.DOKAN_PAY_API_KEY || !process.env.DOKAN_PAY_SECRET_KEY) {
        return res.status(500).json({ error: "Dokan Pay credentials not configured" });
      }

      // Mocking the Dokan Pay API request
      // In a real scenario, you would use fetch() to send data to Dokan Pay's endpoint
      console.log("Creating Dokan Pay payment:", {
        api_key: process.env.DOKAN_PAY_API_KEY,
        amount,
        orderId,
        customerName,
      });

      // Based on common local gateways in BD:
      // const response = await fetch("https://dokanpay.site/api/checkout-v2", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     api_key: process.env.DOKAN_PAY_API_KEY,
      //     api_secret: process.env.DOKAN_PAY_SECRET_KEY,
      //     amount,
      //     order_id: orderId,
      //     customer_name: customerName,
      //     customer_email: customerEmail,
      //     customer_phone: customerPhone,
      //     callback_url: `${req.protocol}://${req.get("host")}/api/payment/callback`,
      //     success_url: `${req.protocol}://${req.get("host")}/dashboard?payment=success`,
      //     cancel_url: `${req.protocol}://${req.get("host")}/dashboard?payment=cancel`,
      //   }),
      // });
      // const data = await response.json();
      
      // Return the secure checkout redirect URL pointing to our beautiful checkout portal
      res.json({
        status: "success",
        payment_url: `/dokan-checkout?amount=${amount}&order_id=${orderId || `DP-${Date.now()}`}&customerName=${encodeURIComponent(customerName || '')}&customerEmail=${encodeURIComponent(customerEmail || '')}&customerPhone=${encodeURIComponent(customerPhone || '')}`,
      });
    } catch (error) {
      console.error("Payment creation error:", error);
      res.status(500).json({ error: "Failed to create payment" });
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
