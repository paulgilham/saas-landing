import { kv } from "@vercel/kv";
import OpenAI from "openai";
import { generateBlueprint } from "../../lib/blueprintEngine";
import { moduleContracts } from "../../lib/moduleContracts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * SLUG GENERATION
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
 * SAFE JSON PARSER
 */
function safeParse(text) {
  try {
    return JSON.parse(
      text.replace(/```json/g, "").replace(/```/g, "").trim()
    );
  } catch (e) {
    console.error("JSON parse failed:", text);
    return null;
  }
}

/**
 * 🔥 STRICT AI MODULE GENERATOR (CONTRACT ENFORCED)
 */
async function generateModuleContent(moduleName, seed) {
  const contract = moduleContracts[moduleName];

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a strict JSON generator for a website builder.

YOU MUST follow this exact schema:
${JSON.stringify(contract)}

RULES:
- Output ONLY valid JSON
- No markdown
- No explanations
- No extra keys
- No nesting unless schema defines it exactly
- No text outside JSON
        `
      },
      {
        role: "user",
        content: `
Business context: ${seed}
Module: ${moduleName}
Generate content strictly following schema.
        `
      }
    ],
    temperature: 0.4
  });

  return safeParse(res.choices[0].message.content) || {};
}

/**
 * MAIN GENERATION ENDPOINT
 */
export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // ---------------------------
    // IDS
    // ---------------------------
    const businessId = crypto.randomUUID();
    const slug = createSlug(prompt);
    const version = 1;

    // ---------------------------
    // BLUEPRINT (STRUCTURE)
    // ---------------------------
    const blueprint = await generateBlueprint(prompt);

    // ---------------------------
    // AI MODULE CONTENT (CONTRACT LOCKED)
    // ---------------------------
    const contentEntries = await Promise.all(
      blueprint.layout.map(async (moduleName) => {
        const data = await generateModuleContent(moduleName, prompt);
        return [moduleName, data];
      })
    );

    const content = Object.fromEntries(contentEntries);

    // ---------------------------
    // FINAL SITE OBJECT
    // ---------------------------
    const site = {
      businessId,
      version,
      slug,
      blueprint,
      structure: {
        home: blueprint.layout
      },
      content,
      createdAt: Date.now()
    };

    // ---------------------------
    // STORE VERSIONED SITE
    // ---------------------------
    await kv.set(`site:${businessId}:v${version}`, site);

    // ---------------------------
    // SLUG POINTER (PUBLIC ROUTE)
    // ---------------------------
    await kv.set(`slug:${slug}`, {
      slug,
      businessId,
      currentVersion: version
    });

    // ---------------------------
    // BUSINESS INDEX
    // ---------------------------
    await kv.set(`biz:${businessId}`, {
      businessId,
      type: blueprint.type || "default"
    });

    // ---------------------------
    // RESPONSE
    // ---------------------------
    return res.status(200).json({
      siteId: slug,
      businessId,
      version
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Generation failed" });
  }
}