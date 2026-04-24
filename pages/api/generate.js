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

    // -----------------------------
    // 🧠 1. INITIAL BLUEPRINT (CATEGORY ONLY)
    // -----------------------------
    const initialBlueprint = generateBlueprint({
      prompt,
      tier
    });

    const category = initialBlueprint.type;

    // -----------------------------
    // 🧠 2. TRAIT EXTRACTION (WITH CATEGORY)
    // -----------------------------
    const traits = extractTraits(prompt, category);

    // -----------------------------
    // 🧠 3. FINAL BLUEPRINT (TRAIT-AWARE)
    // -----------------------------
    const finalBlueprint = generateBlueprint({
      prompt,
      tier,
      traits
    });

    const { layout: modules } = finalBlueprint;

    const structure = {
      home: modules
    };

    // -----------------------------
    // 🧠 4. CONTENT GENERATION (STRICT JSON)
    // -----------------------------
    const content = { home: {} };

    for (const module of modules) {
      const result = await generateModuleContent({
        module,
        category,
        tier,
        prompt,
        traits
      });

      if (result?.data && typeof result.data === "object") {
        content.home[module] = result.data;
      } else {
        content.home[module] = {}; // strict fallback
      }
    }

    // -----------------------------
    // 🧠 5. FINAL SITE OBJECT
    // -----------------------------
    const site = {
      schemaVersion: 3,
      slug,
      prompt,
      category,
      tier,
      traits,
      structure,
      content,
      createdAt: Date.now()
    };

    // -----------------------------
    // 🧠 6. KV STORAGE (VERSIONED)
    // -----------------------------
    const key = `site:${slug}`;
    const existing = (await kv.get(key)) || [];

    await kv.set(key, [...existing, site]);

    return res.status(200).json(site);

  } catch (err) {
    console.error("GENERATION ERROR:", err);
    return res.status(500).json({ error: "Generation failed" });
  }
}