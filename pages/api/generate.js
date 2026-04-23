import { generateBlueprint } from "@/lib/blueprintEngine";
import { kv } from "@/lib/kv";
import { generateModuleContent } from "@/lib/ai";

// ------------------------------------
// VERTICAL DETECTION (CAN STAY OR MOVE LATER)
// ------------------------------------
function detectVertical(prompt) {
  const t = prompt.toLowerCase();

  if (t.includes("hair") || t.includes("salon")) return "hair_beauty";
  if (t.includes("builder") || t.includes("construction")) return "construction_trades";
  if (t.includes("agency") || t.includes("consult")) return "agencies_marketing";

  return "default";
}

// ------------------------------------
// CONTENT DEPTH (TIER INTELLIGENCE)
// ------------------------------------
function getContentDepth(tier) {
  if (tier === "simple") return "basic";
  if (tier === "medium") return "structured";
  if (tier === "advanced") return "persuasive";
  return "structured";
}

// ------------------------------------
// MODULE PROMPT ENGINE
// ------------------------------------
function buildModulePrompt({
  module,
  prompt,
  category,
  tier
}) {
  const depth = getContentDepth(tier);

  return `
You are generating website content.

Business context:
${prompt}

Category:
${category}

Module:
${module}

Depth level:
${depth}

Rules:
- Do not output JSON
- Do not create structure
- Only generate module content
- Keep tone appropriate for business category

Module focus:
- hero → value proposition
- services → clarity + offerings
- testimonials → trust
- CTA → conversion
`;
}

// ------------------------------------
// MAIN GENERATION
// ------------------------------------
export default async function handler(req, res) {
  try {
    const { prompt, tier = "medium", slug, modifiers = [] } = req.body;

    // 🟢 1. CATEGORY (LAYER 1 via blueprintEngine internally)
    const vertical = detectVertical(prompt);

    // 🟢 2. STRUCTURE (NOW COMES FROM blueprintEngine.js)
    const blueprintResult = generateBlueprint({
      prompt,
      tier,
      modifiers
    });

    const { type: category, layout: modules } = blueprintResult;

    // 🟢 3. STRUCTURE OUTPUT
    const structure = {
      home: modules
    };

    // 🟢 4. CONTENT GENERATION (AI ONLY FILLS MODULES)
    const content = { home: {} };

    for (const module of modules) {
      const promptForModule = buildModulePrompt({
        module,
        prompt,
        category,
        tier
      });

      const result = await generateModuleContent({
        module,
        prompt: promptForModule,
        category,
        tier
      });

      content.home[module] =
        typeof result === "object" && result
          ? result
          : { text: String(result || "") };
    }

    // 🟢 5. FINAL SITE OBJECT
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

    // 🟢 6. VERSIONING (KV STORAGE)
    if (kv) {
      const key = `site:${slug}`;
      const existing = (await kv.get(key)) || [];

      const updated = [...existing, site];

      await kv.set(key, updated);
    }

    return res.status(200).json(site);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Generation failed" });
  }
}