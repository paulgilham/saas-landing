import { saveSite } from "../../data/sites";

export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const systemPrompt = `
Return ONLY valid JSON.

{
  "siteId": "string-slug",
  "businessName": "string",

  "pages": ["home"],

  "structure": {
    "home": ["hero", "features", "cta"]
  },

  "content": {
    "home": {
      "hero": {
        "title": "...",
        "subtitle": "...",
        "cta": "..."
      },
      "features": {
        "items": ["...", "..."]
      },
      "cta": {
        "title": "...",
        "button": "..."
      }
    }
  }
}
`;

    // CALL OPENAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    // 🔍 SAFETY CHECK 1
    if (!data.choices || !data.choices[0]) {
      console.error("OpenAI error:", data);
      return res.status(500).json({ error: "Invalid OpenAI response" });
    }

    const text = data.choices[0].message.content;

    console.log("AI OUTPUT:", text);

    // 🔍 SAFETY CHECK 2 (SAFE JSON PARSE)
    let blueprint;

    try {
      blueprint = JSON.parse(text);
    } catch (err) {
      console.error("JSON PARSE FAILED:", err);

      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw: text
      });
    }

    // 🔧 SAFE SITE ID
    blueprint.siteId = (blueprint.siteId || "generated-site")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    // 💾 SAVE SITE
    saveSite(blueprint.siteId, blueprint);

    // ✅ RETURN ONLY WHAT FRONTEND NEEDS
    return res.status(200).json({
      siteId: blueprint.siteId
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      error: "Server error"
    });
  }
}