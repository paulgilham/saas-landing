import { kv } from "@vercel/kv";
import OpenAI from "openai";
import { generateBlueprint } from "../../lib/blueprintEngine";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * SLUG
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
 * SAFE JSON
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
 * MODULE CONTENT
 */
async function generateModuleContent(moduleName, seed) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Return ONLY valid JSON:
{
  "title": "",
  "subtitle": "",
  "cta": "",
  "button": "",
  "items": []
}`
      },
      {
        role: "user",
        content: `${seed} | module: ${moduleName}`
      }
    ],
    temperature: 0.6
  });

  return safeParse(res.choices[0].message.content) || {};
}

/**
 * MAIN
 */
export default async function handler(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // ---------------------------
    // 1. IDS
    // ---------------------------
    const businessId = crypto.randomUUID();
    const slug = createSlug(prompt);
    const version = 1;

    // ---------------------------
    // 2. BLUEPRINT
    // ---------------------------
    const blueprint = await generateBlueprint(prompt);

    // ---------------------------
    // 3. AI CONTENT
    // ---------------------------
    const contentEntries = await Promise.all(
      blueprint.layout.map(async (m) => {
        const data = await generateModuleContent(m, prompt);
        return [m, data];
      })
    );

    const content = Object.fromEntries(contentEntries);

    // ---------------------------
    // 4. FULL SITE OBJECT
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
    // 5. STORE VERSIONED SITE
    // ---------------------------
    await kv.set(`site:${businessId}:v${version}`, site);

    // ---------------------------
    // 6. SLUG POINTER (IMPORTANT)
    // ---------------------------
    await kv.set(`slug:${slug}`, {
      slug,
      businessId,
      currentVersion: version
    });

    // ---------------------------
    // 7. BUSINESS INDEX
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