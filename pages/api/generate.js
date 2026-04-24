import { generateBlueprint } from "@/lib/blueprintEngine";
import { kv } from "@/lib/kv";
import { generateModuleContent } from "@/lib/contentEngine";
import { extractTraits } from "@/lib/traitEngine";

// ------------------------------------
// MAIN HANDLER
// ------------------------------------
export default async function handler(req, res) {
  try {
    const { prompt, tier = "medium", slug } = req.body;

    if (!prompt || !slug) {
      return res.status(400).json({
        error: "prompt and slug are required"
      });
    }

    // 🧠 1. TRAIT EXTRACTION (NEW)
    const traits = extractTraits(prompt);

    // 🧠 2. BLUEPRINT (STRUCTURE)
    const blueprint = generateBlueprint({
      prompt,
      tier,
      traits
    });

    const { type: category, layout: modules } = blueprint;

    const structure = {
      home: modules
    };

    // 🧠 3. CONTENT GENERATION (STRICT JSON ONLY)
    const content = { home: {} };

    for (const module of modules) {
      const result = await generateModuleContent({
        module,
        category,
        tier,
        prompt,
        traits // 🔥 pass traits into content engine too
      });

      if (result?.data && typeof result.data === "object") {
        content.home[module] = result.data;
      } else {
        content.home[module] = {}; // strict fallback
      }
    }

    // 🧠 4. FINAL SITE OBJECT
    const site = {
      schemaVersion: 3, // bump version (important)
      slug,
      prompt,
      category,
      tier,
      traits, // 🔥 CRITICAL FOR RENDER ENGINE
      structure,
      content,
      createdAt: Date.now()
    };

    // 🧠 5. KV STORAGE (VERSIONED ARRAY)
    const key = `site:${slug}`;
    const existing = (await kv.get(key)) || [];

    await kv.set(key, [...existing, site]);

    return res.status(200).json(site);

  } catch (err) {
    console.error("GENERATION ERROR:", err);
    return res.status(500).json({ error: "Generation failed" });
  }
}