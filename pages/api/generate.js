import { saveSite } from "../../data/sites";

export default async function handler(req, res) {
  try {
    // -------------------------
    // 1. VALIDATE INPUT
    // -------------------------
    const { prompt } = req.body || {};

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Missing or invalid prompt"
      });
    }

    // -------------------------
    // 2. SYSTEM PROMPT
    // -------------------------
    const systemPrompt = `
Return ONLY valid JSON. No markdown. No explanation.

You must return exactly this structure:

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
        "title": "string",
        "subtitle": "string",
        "cta": "string"
      },
      "features": {
        "items": ["string", "string"]
      },
      "cta": {
        "title": "string",
        "button": "string"
      }
    }
  }
}
`;

    // -------------------------
    // 3. CALL OPENAI
    // -------------------------
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
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!data?.choices?.[0]?.message?.content) {
      console.error("OpenAI invalid response:", data);

      return res.status(500).json({
        error: "Invalid OpenAI response"
      });
    }

    const text = data.choices[0].message.content;

    console.log("RAW AI OUTPUT:", text);

    // -------------------------
    // 4. SAFE JSON PARSING
    // -------------------------
    let blueprint;

    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");

      if (start === -1 || end === -1) {
        throw new Error("No JSON found in AI response");
      }

      const cleanJson = text.substring(start, end + 1);

      blueprint = JSON.parse(cleanJson);

    } catch (err) {
      console.error("JSON PARSE FAILED:", err);

      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw: text
      });
    }

    // -------------------------
    // 5. SAFE SITE ID
    // -------------------------
    let siteId = blueprint.siteId;

    if (!siteId || typeof siteId !== "string") {
      siteId = "site-" + Date.now();
    }

    siteId = siteId
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    blueprint.siteId = siteId;

    // -------------------------
    // 6. SAVE SITE (in-memory)
    // -------------------------
    saveSite(siteId, blueprint);

    // -------------------------
    // 7. RESPONSE (ALWAYS SAFE)
    // -------------------------
    return res.status(200).json({
      siteId
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      error: "Server crash"
    });
  }
}