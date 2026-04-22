import { saveSite } from "../../data/sites";

export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Missing prompt"
      });
    }

    const systemPrompt = `
Return ONLY valid JSON. No explanation. No markdown.

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
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();

    // SAFETY CHECK: OpenAI response exists
    if (!data.choices || !data.choices[0]) {
      console.error("OpenAI invalid response:", data);

      return res.status(500).json({
        error: "Invalid OpenAI response"
      });
    }

    const text = data.choices[0].message.content;

    console.log("RAW AI OUTPUT:", text);

    // SAFE JSON EXTRACTION (fixes your "Unexpected token A" error)
    let blueprint;

    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");

      if (start === -1 || end === -1) {
        throw new Error("No JSON object found in AI output");
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

    // SAFE SLUG
    blueprint.siteId = (blueprint.siteId || "generated-site")
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

    // SAVE SITE (temporary memory store)
    saveSite(blueprint.siteId, blueprint);

    // ALWAYS RETURN VALID JSON
    return res.status(200).json({
      siteId: blueprint.siteId
    });

  } catch (err) {
    console.error("SERVER ERROR:", err);

    return res.status(500).json({
      error: "Server crash"
    });
  }
}