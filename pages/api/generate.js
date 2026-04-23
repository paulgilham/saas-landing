import { generateBlueprint } from "@/lib/blueprintEngine";
import { kv } from "@/lib/kv";
import { generateModuleContent } from "@/lib/contentEngine";
import { stripHtmlDeep } from "@/lib/sanitizeContent";

// ------------------------------------
// VERTICAL DETECTION (HINT ONLY)
// ------------------------------------
function detectVertical(prompt) {
  const t = prompt.toLowerCase();

  if (t.includes("hair") || t.includes("salon")) return "hair_beauty";
  if (t.includes("builder") || t.includes("construction")) return "construction_trades";
  if (t.includes("agency") || t.includes("consult")) return "agencies_marketing";

  return "default";
}

// ------------------------------------
// SCHEMA NORMALISER (CRITICAL)
// ------------------------------------
function normalizeSite(site) {
  return {
    schemaVersion: 2,

    slug: site.slug,
    prompt: site.prompt,
    category: site.category,
    tier: site.tier,
    modifiers: site.modifiers || [],

    structure: site.structure || { home: [] },
    content: normalizeContent(site.content),

    createdAt: site.createdAt || Date.now()
  };
}

// ------------------------------------
// CONTENT NORMALISER (CRITICAL)
// ------------------------------------
function normalizeContent(content = {}) {
  const clean = { home: {} };

  if (!content?.home) return clean;

  for (const key in content.home) {
    const value = content.home[key];

    // OLD STRING HTML FORMAT (LEGACY FIX)
    if (typeof value === "string") {
      clean.home[key] = {
        headline: value.replace(/<[^>]*>/g, "")
      };
      continue;
    }

    // NEW CONTENT ENGINE FORMAT
    if (value?.data) {
      clean.home[key] = stripHtmlDeep(value.data);
      continue;
    }

    // ALREADY CLEAN OBJECT
    clean.home[key] = stripHtmlDeep(value);
  }

  return clean;
}

// ------------------------------------
// MAIN GENERATION HANDLER
// ------------------------------------
export default async function handler(req, res) {
  try {
    const { prompt, tier = "medium", slug, modifiers = [] } = req.body;

    // 🟢 1. STRUCTURE (BLUEPRINT ENGINE IS SOURCE OF TRUTH)
    const blueprintResult = generateBlueprint({
      prompt,
      tier,
      modifiers
    });

    const { type: category, layout: modules } = blueprintResult;

    const structure = {
      home: modules
    };

    // 🟢 2. CONTENT GENERATION (STRICT ISOLATED LAYER)
    const content = { home: {} };

    for (const module of modules) {
      const result = await generateModuleContent({
        module,
        category,
        modifiers,
        tier,
        prompt
      });

      // 🧠 FIX: correct extraction from contentEngine
      content.home[module] = stripHtmlDeep(result.data || result);
    }

    // 🟢 3. SITE OBJECT
    const site = normalizeSite({
      slug,
      prompt,
      category,
      tier,
      modifiers,
      structure,
      content,
      createdAt: Date.now()
    });

    // 🟢 4. KV VERSIONING (SAFE APPEND)
    if (kv) {
      const key = `site:${slug}`;
      const existing = (await kv.get(key)) || [];

      const updated = [...existing, site];

      await kv.set(key, updated);
    }

    return res.status(200).json(site);

  } catch (err) {
    console.error("Generation error:", err);
    return res.status(500).json({ error: "Generation failed" });
  }
}