import { BLUEPRINTS } from "@/lib/blueprints";
import { MODULE_FAMILIES } from "@/lib/modules";
import { resolveModules } from "@/lib/resolveModules";
import { applyTierOverlay } from "@/lib/tierOverlay";
import { kv } from "@/lib/kv"; // if you use KV

import { generateModuleContent } from "@/lib/ai";

// ------------------------------------
// VERTICAL DETECTION
// ------------------------------------
function detectVertical(prompt) {
  const t = prompt.toLowerCase();

  if (t.includes("hair") || t.includes("salon")) return "personal_services";
  if (t.includes("builder") || t.includes("construction")) return "home_services";
  if (t.includes("agency") || t.includes("consult")) return "professional_services";

  return "default";
}

// ------------------------------------
// TIER CONTENT INTELLIGENCE
// ------------------------------------
function getContentDepth(tier) {
  if (tier === "simple") return "basic";
  if (tier === "medium") return "structured";
  if (tier === "advanced") return "persuasive";
  return "structured";
}

// ------------------------------------
// MODULE PROMPT ENGINE (KEY ADDITION)
// ------------------------------------
function buildModulePrompt({
  module,
  prompt,
  vertical,
  tier
}) {
  const depth = getContentDepth(tier);

  return `
You are generating website content.

Business context:
${prompt}

Vertical:
${vertical}

Module:
${module}

Depth level:
${depth}

Rules:
- Be natural and conversion focused
- Match business type tone
- Do NOT output JSON
- Return structured fields only

If module is:
- hero → focus on value proposition
- services → focus on clarity + listing
- testimonials → focus on trust
- CTA → focus on conversion
`;
}

// ------------------------------------
// MAIN GENERATION
// ------------------------------------
export default async function handler(req, res) {
  try {
    const { prompt, tier = "medium", slug } = req.body;

    const vertical = detectVertical(prompt);

    // 1. BLUEPRINT
    const blueprint =
      BLUEPRINTS?.[vertical]?.[tier] ||
      BLUEPRINTS?.default?.[tier] ||
      [];

    // 2. MODULES
    const modules = resolveModules(blueprint);

    // 3. STRUCTURE
    const structure = {
      home: modules
    };

    // 4. CONTENT GENERATION (INTELLIGENT LAYER RESTORED)
    const content = { home: {} };

    for (const module of modules) {
      const promptForModule = buildModulePrompt({
        module,
        prompt,
        vertical,
        tier
      });

      const result = await generateModuleContent(promptForModule);

      content.home[module] =
        typeof result === "object" && result
          ? result
          : { text: String(result || "") };
    }

    // 5. SITE OBJECT
    const site = {
      slug,
      prompt,
      vertical,
      tier,
      structure,
      content,
      createdAt: Date.now()
    };

    // 6. VERSIONING (RESTORED IF KV EXISTS)
    if (kv) {
      const key = `site:${slug}`;
      const existing = (await kv.get(key)) || [];

      const updated = [
        ...existing,
        site
      ];

      await kv.set(key, updated);
    }

    return res.status(200).json(site);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Generation failed" });
  }
}