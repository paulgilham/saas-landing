import { kv } from "@vercel/kv";
import OpenAI from "openai";

import { generateBlueprint } from "../../lib/blueprintEngine";
import { moduleContracts } from "../../lib/moduleContracts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// -----------------------------
// SLUG GENERATOR
// -----------------------------
function createSlug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// -----------------------------
// SAFE JSON PARSER
// -----------------------------
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

// -----------------------------
// STRICT AI MODULE GENERATION (CONTRACT LOCKED)
// -----------------------------
async function generateModuleContent(moduleName, seed) {
  const contract = moduleContracts[moduleName];

  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
You are a STRICT JSON generator.

You MUST follow this schema EXACTLY:

${JSON.stringify(contract)}

RULES:
- output ONLY valid JSON
- no markdown
- no explanations
- no extra keys
- all required fields MUST exist
- arrays must match structure exactly
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
    temperature: 0.3
  });

  return safeParse(res.choices[0].message.content) || {};
}

// -----------------------------
// MAIN GENERATION HANDLER
// -----------------------------
export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // -------------------------
    // IDS + SLUG
    // -------------------------
    const businessId = crypto.randomUUID();
    const slug = createSlug(prompt);
    const version = 1;

    // -------------------------
    // BLUEPRINT ENGINE (CONTROLLED STRUCTURE)
    // -------------------------
    const blueprint = generateBlueprint(prompt, {
      primary: detectType(prompt),
      layout: []
    });

    // -------------------------
    // STRICT MODULE CONTENT GENERATION
    // -------------------------
    const contentEntries = await Promise.all(
      blueprint.layout.map(async (moduleName) => {
        const data = await generateModuleContent(moduleName, prompt);
        return [moduleName, data];
      })
    );

    const content = Object.fromEntries(contentEntries);

    // -------------------------
    // FINAL SITE OBJECT
    // -------------------------
    const site = {
      businessId,
      slug,
      version,
      blueprint,
      structure: {
        home: blueprint.layout
      },
      content,
      createdAt: Date.now()
    };

    // -------------------------
    // KV STORAGE (VERSIONED)
    // -------------------------
    await kv.set(`site:${businessId}:v${version}`, site);

    await kv.set(`slug:${slug}`, {
      slug,
      businessId,
      currentVersion: version
    });

    await kv.set(`biz:${businessId}`, {
      businessId,
      type: blueprint.type || "default"
    });

    // -------------------------
    // RESPONSE
    // -------------------------
    return res.status(200).json({
      siteId: slug,
      businessId,
      version
    });

  } catch (err) {
    console.error("GENERATION ERROR:", err);
    return res.status(500).json({ error: "Generation failed" });
  }
}

// -----------------------------
// FALLBACK TYPE DETECTOR
// -----------------------------
function detectType(prompt = "") {
  const s = prompt.toLowerCase();

  if (s.includes("builder") || s.includes("construction")) return "builder";
  if (s.includes("florist") || s.includes("flowers")) return "florist";
  if (s.includes("agency") || s.includes("marketing")) return "agency";
  if (s.includes("dentist") || s.includes("dental")) return "dentist";

  return "default";
}