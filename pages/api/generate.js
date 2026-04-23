import { kv } from "@vercel/kv";
import OpenAI from "openai";
import { generateBlueprint } from "../../lib/blueprintEngine";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * SAFE SLUG
 */
function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/**
 * SAFE JSON PARSER (CRITICAL FIX)
 */
function safeParse(text) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ JSON parse failed:", text);
    return null;
  }
}

/**
 * MODULE CONTENT GENERATION
 */
async function generateModuleContent(moduleName, seed) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You generate ONLY valid JSON.

No markdown. No explanations.

Return:
{
  "title": "",
  "subtitle": "",
  "text": "",
  "cta": "",
  "button": "",
  "items": []
}
          `.trim()
        },
        {
          role: "user",
          content: `Business: ${seed} | Module: ${moduleName}`
        }
      ],
      temperature: 0.6
    });

    const parsed = safeParse(response.choices[0].message.content);

    if (!parsed) {
      return {
        title: moduleName,
        subtitle: "",
        text: "Content unavailable",
        items: []
      };
    }

    return parsed;

  } catch (err) {
    console.error("Module generation error:", moduleName, err);

    return {
      title: moduleName,
      subtitle: "",
      text: "Fallback content",
      items: []
    };
  }
}

/**
 * MAIN API
 */
export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // =====================================
    // 1. BLUEPRINT (INTELLIGENCE LAYER)
    // =====================================
    const blueprint = await generateBlueprint(prompt);

    // =====================================
    // 2. MODULE CONTENT (PARALLEL FIX)
    // =====================================
    const contentEntries = await Promise.all(
      blueprint.layout.map(async (moduleName) => {
        const data = await generateModuleContent(moduleName, prompt);
        return [moduleName, data];
      })
    );

    const content = Object.fromEntries(contentEntries);

    // =====================================
    // 3. SITE OBJECT
    // =====================================
    const site = {
      prompt,
      blueprint,
      structure: {
        home: blueprint.layout
      },
      content,
      createdAt: Date.now()
    };

    // =====================================
    // 4. SLUG
    // =====================================
    const siteId = createSlug(prompt);

    // =====================================
    // 5. STORE IN KV
    // =====================================
    await kv.set(siteId, site);

    // =====================================
    // 6. RESPONSE
    // =====================================
    return res.status(200).json({
      siteId,
      site
    });

  } catch (err) {
    console.error("❌ Generate API error:", err);

    return res.status(500).json({
      error: "Generation failed"
    });
  }
}