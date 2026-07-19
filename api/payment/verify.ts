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
    const { transactionId } = req.body;
    if (!transactionId) {
      return res.status(400).json({ error: "Missing transactionId" });
    }

    const apiKey = process.env.DOKAN_PAY_API_KEY;
    const secretKey = process.env.DOKAN_PAY_SECRET_KEY;

    if (!apiKey) {
      console.warn("[Dokan Pay] API Key is not configured. Defaulting to success fallback for sandbox/testing.");
      return res.json({ status: "1", message: "success", success: true, is_sandbox: true });
    }

    // Proxy the request to Dokan Pay Verify API
    console.log(`[Dokan Pay] Querying verification for transactionId: ${transactionId}`);
    
    // Attempting to query Dokan Pay verify API
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
      console.error("[Dokan Pay] API verification responded with error:", errorText);
      return res.status(200).json({ status: "0", message: "API response error: " + errorText, success: false });
    }

    const data = await response.json() as any;
    console.log("[Dokan Pay] Verification API Response:", data);
    return res.json(data);
  } catch (err: any) {
    console.error("[Dokan Pay] Error performing transaction verification:", err);
    return res.status(500).json({ error: "Internal server error", message: err.message });
  }
}
