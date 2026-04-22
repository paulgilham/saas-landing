export default async function handler(req, res) {
  try {
    console.log("API HIT");

    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Missing prompt"
      });
    }

    // -----------------------------
    // TEMP SITE GENERATION
    // -----------------------------
    const siteId = prompt
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    const blueprint = {
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
      }
    };

    // -----------------------------
    // GLOBAL STORAGE (IMPORTANT FIX)
    // -----------------------------
    global.sites = global.sites || {};
    global.sites[siteId] = blueprint;

    console.log("SAVED SITE:", siteId);

    // -----------------------------
    // RESPONSE
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