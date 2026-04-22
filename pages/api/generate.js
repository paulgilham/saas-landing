export default async function handler(req, res) {
  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const siteId = prompt
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    // -----------------------------
    // MODULE-BASED BLUEPRINT SYSTEM
    // -----------------------------
    const blueprint = {
      siteId,
      businessName: prompt,

      pages: ["home"],

      structure: {
        home: ["hero", "features", "cta"]
      },

      modules: {
        hero: {
          title: prompt,
          subtitle: "AI generated website for your business",
          cta: "Get Started"
        },

        features: {
          items: [
            "Fast setup",
            "Modern design",
            "AI powered generation"
          ]
        },

        cta: {
          title: "Ready to launch?",
          button: "Start Now"
        }
      }
    };

    return res.status(200).json({
      siteId,
      blueprint
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Server crash"
    });
  }
}