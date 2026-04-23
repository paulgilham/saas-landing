import { generateBlueprint } from "@/lib/blueprintEngine";
import { kv } from "@/lib/kv";
import { generateModuleContent } from "@/lib/contentEngine";
import { stripHtmlDeep } from "@/lib/sanitizeContent";

// ------------------------------------
// VERTICAL DETECTION (OPTIONAL HINT ONLY)
// ------------------------------------
function detectVertical(prompt) {
  const t = prompt.toLowerCase();

  if (t.includes("hair") || t.includes("salon")) return "hair_beauty";
  if (t.includes("builder") || t.includes("construction")) return "construction_trades";
  if (t.includes("agency") || t.includes("consult")) return "agencies_marketing";

  return "default";
}

// ------------------------------------
// MAIN GENERATION HANDLER
// ------------------------------------
export default async function handler(req, res) {
  try {
    const { prompt, tier = "medium", slug, modifiers = [] } = req.body;

    // 🟢 1. STRUCTURE GENERATION (ONLY SOURCE OF TRUTH)
    const blueprintResult = generateBlueprint({
      prompt,
      tier,
      modifiers
    });

    const { type: category, layout: modules } = blueprintResult;

    // 🟢 2. STRUCTURE OUTPUT (NO AI HERE)
    const structure = {
      home: modules
    };

    // 🟢 3. CONTENT GENERATION (STRICTLY ISOLATED LAYER)
    const content = { home: {} };

    for (const module of modules) {
      // ONLY PASS CONTEXT — NO PROMPT BUILDING HERE
      const result = await generateModuleContent({
        module,
        category,
        modifiers,
        tier,
        prompt
      });

      // 🧠 HARD BOUNDARY ENFORCEMENT
      content.home[module] = stripHtmlDeep(result);
    }

    // 🟢 4. FINAL SITE OBJECT (IMMUTABLE STRUCTURE)
    const site = {
      slug,
      prompt,
      category,
      tier,
      modifiers,
      structure,
      content,
      createdAt: Date.now()
    };

    // 🟢 5. VERSIONING (KV STORAGE)
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