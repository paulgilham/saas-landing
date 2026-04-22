 import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    console.log("API HIT");

    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // -----------------------------
    // 1. CREATE SITE ID (SAFE SLUG)
    // -----------------------------
    const siteId = prompt
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    // -----------------------------
    // 2. BUILD SITE OBJECT (TEMP BLUEPRINT)
    // -----------------------------
    const siteObject = {
      siteId,
      businessName: prompt,
      pages: ["home"],
      structure: {
        home: ["hero", "features", "cta"]
      },
      content: {
        home: {
          hero: {
            title: prompt,
            subtitle: "AI generated website",
            cta: "Get Started"
          },
          features: {
            items: ["Fast", "Simple", "AI Powered"]
          },
          cta: {
            title: "Ready to start?",
            button: "Launch"
          }
        }
      },
      status: "ready",
      createdAt: Date.now()
    };

    // -----------------------------
    // 3. SAVE TO KV (PERSISTENCE)
    // -----------------------------
    await kv.set(siteId, siteObject);

    console.log("SAVED TO KV:", siteId);

    // -----------------------------
    // 4. RETURN RESPONSE
    // -----------------------------
    return res.status(200).json({
      siteId
    });

  } catch (err) {
    console.error("API ERROR:", err);

    return res.status(500).json({
      error: "Server crash",
      details: err.message
    });
  }
}