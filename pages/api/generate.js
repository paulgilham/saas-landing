import { BLUEPRINTS } from "@/lib/blueprints";
import { VERTICAL_FAMILIES } from "@/lib/verticalFamilies";
import { MODULE_FAMILIES } from "@/lib/modules";
import { resolveModules } from "@/lib/resolveModules";
import { applyTierOverlay } from "@/lib/tierOverlay";

// OPTIONAL: replace with your AI function
import { generateModuleContent } from "@/lib/ai";

function detectVertical(input) {
  const text = input.toLowerCase();

  if (text.includes("hair") || text.includes("salon")) {
    return "personal_services";
  }

  if (text.includes("builder") || text.includes("construction")) {
    return "home_services";
  }

  if (text.includes("consult") || text.includes("agency")) {
    return "professional_services";
  }

  return "default";
}

// ------------------------------------
// MAIN HANDLER
// ------------------------------------
export default async function handler(req, res) {
  try {
    const { prompt, tier = "medium", slug } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // ------------------------------------
    // 1. DETECT VERTICAL
    // ------------------------------------
    const vertical = detectVertical(prompt);

    // ------------------------------------
    // 2. GET BLUEPRINT (FAMILIES)
    // ------------------------------------
    const blueprint =
      BLUEPRINTS?.[vertical]?.[tier] ||
      BLUEPRINTS?.default?.[tier] ||
      [];

    // ------------------------------------
    // 3. APPLY TIER CONSTRAINTS (SAFE FILTER)
    // ------------------------------------
    const constrainedFamilies = applyTierOverlay(
      Object.fromEntries(
        blueprint.map((f) => [f, MODULE_FAMILIES[f]])
      ),
      tier
    );

    // ------------------------------------
    // 4. RESOLVE MODULES FROM FAMILIES
    // ------------------------------------
    const modules = resolveModules(blueprint);

    // ------------------------------------
    // 5. BUILD STRUCTURE (NO AI INVOLVEMENT)
    // ------------------------------------
    const structure = {
      home: modules
    };

    // ------------------------------------
    // 6. AI CONTENT GENERATION (STRICT SCHEMA)
    // ------------------------------------
    const content = {
      home: {}
    };

    for (const moduleName of modules) {
      const result = await generateModuleContent({
        module: moduleName,
        prompt,
        vertical,
        tier
      });

      // HARD SAFETY: ensure object only
      content.home[moduleName] =
        typeof result === "object" && result !== null
          ? result
          : { text: String(result || "") };
    }

    // ------------------------------------
    // 7. BUILD FINAL SITE OBJECT
    // ------------------------------------
    const site = {
      slug,
      prompt,
      vertical,
      tier,
      structure,
      content,
      createdAt: Date.now()
    };

    // ------------------------------------
    // 8. SAVE TO KV (OR DB)
    // ------------------------------------
    // await kv.set(`site:${slug}`, site);

    return res.status(200).json(site);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Generation failed" });
  }
}