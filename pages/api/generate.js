import { kv } from "@vercel/kv";
import OpenAI from "openai";
import { generateBlueprint } from "../../lib/blueprintEngine";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Utility: safe slug
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
 * Generate structured content per module
 */
async function generateModuleContent(moduleName, seed) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You generate structured website content for a module.

Return ONLY JSON:
{
  "title": "",
  "subtitle": "",
  "items": [],
  "text": "",
  "cta": "",
  "button": ""
}
Keep it relevant, concise, and suitable for a real business website.
          `.trim()
        },
        {
          role: "user",
          content: `Business: ${seed}
Module: ${moduleName}`
        }
      ],
      temperature: 0.7
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (err) {
    console.error(`Module generation failed: ${moduleName}`, err);

    // safe fallback so system never breaks
    return {
      title: moduleName,
      text: "Content unavailable",
      items: []
    };
  }
}

export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // ===================================
    // 1. BLUEPRINT (INTELLIGENCE LAYER)
    // ===================================
    const blueprint = await generateBlueprint(prompt);

    // ===================================
    // 2. CONTENT GENERATION PER MODULE
    // ===================================
    const content = {};

    for (const moduleName of blueprint.layout) {
      content[moduleName] = await generateModuleContent(
        moduleName,
        prompt
      );
    }

    // ===================================
    // 3. BUILD SITE OBJECT
    // ===================================
    const site = {
      prompt,
      blueprint,
      structure: {
        home: blueprint.layout
      },
      content,
      createdAt: Date.now()
    };

    // ===================================
    // 4. CREATE SITE ID / SLUG
    // ===================================
    const siteId = createSlug(prompt);

    // ===================================
    // 5. STORE IN KV
    // ===================================
    await kv.set(siteId, site);

    // ===================================
    // 6. RESPONSE
    // ===================================
    return res.status(200).json({
      siteId,
      site
    });

  } catch (err) {
    console.error("Generate API error:", err);

    return res.status(500).json({
      error: "Generation failed"
    });
  }
}