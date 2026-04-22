import { kv } from "@vercel/kv";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractJSON(text) {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start === -1 || end === -1) {
      throw new Error("No JSON found");
    }

    return JSON.parse(text.slice(start, end + 1));
  } catch (err) {
    return null;
  }
}

export default async function handler(req, res) {
  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // -------------------------
    // 1. SLUG
    // -------------------------
    const siteId = prompt
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    // -------------------------
    // 2. STRUCTURE
    // -------------------------
    const blueprint = {
      siteId,
      businessName: prompt,
      pages: ["home"],
      structure: {
        home: ["hero", "features", "cta"]
      }
    };

    // -------------------------
    // 3. AI PROMPT (STRICT)
    // -------------------------
    const aiPrompt = `
You are a website content generator.

Return ONLY valid JSON.

No explanations.
No markdown.
No extra text.

Format exactly:

{
  "home": {
    "hero": {
      "title": "",
      "subtitle": "",
      "cta": ""
    },
    "features": {
      "items": ["", "", ""]
    },
    "cta": {
      "title": "",
      "button": ""
    }
  }
}

Business: ${prompt}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return only valid JSON." },
        { role: "user", content: aiPrompt }
      ],
      temperature: 0.7
    });

    const raw = completion.choices[0].message.content;

    // -------------------------
    // 4. SAFE PARSE + FALLBACK
    // -------------------------
    let content = extractJSON(raw);

    if (!content) {
      console.error("AI BROKEN OUTPUT:", raw);

      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw
      });
    }

    // -------------------------
    // 5. FINAL OBJECT
    // -------------------------
    const siteObject = {
      ...blueprint,
      content,
      createdAt: Date.now(),
      status: "ready"
    };

    // -------------------------
    // 6. SAVE
    // -------------------------
    await kv.set(siteId, siteObject);

    return res.status(200).json({
      siteId
    });

  } catch (err) {
    console.error("GEN ERROR:", err);

    return res.status(500).json({
      error: "Server crash",
      details: err.message
    });
  }
}