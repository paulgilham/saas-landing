import { generateBlueprint } from "@/lib/blueprintEngine";
import { kv } from "@/lib/kv";
import { generateModuleContent } from "@/lib/contentEngine";

// ------------------------------------
// MAIN HANDLER
// ------------------------------------
export default async function handler(req, res) {
  try {
    const { prompt, tier = "medium", slug } = req.body;

    // 🟢 1. BLUEPRINT (STRUCTURE ONLY)
    const blueprint = generateBlueprint({ prompt, tier });

    const { type: category, layout: modules } = blueprint;

    const structure = {
      home: modules
    };

    // 🟢 2. CONTENT GENERATION (STRICT PIPELINE)
    const content = { home: {} };

    for (const module of modules) {
      const result = await generateModuleContent({
        module,
        category,
        tier,
        prompt
      });

      // 🔒 ONLY ACCEPT VALID OUTPUT FROM CONTENT ENGINE
      if (result?.data && typeof result.data === "object") {
        content.home[module] = result.data;
      } else {
        content.home[module] = {};
      }
    }

    // 🟢 3. FINAL SITE OBJECT (NO SANITISER HERE)
    const site = {
      schemaVersion: 2,
      slug,
      prompt,
      category,
      tier,
      structure,
      content,
      createdAt: Date.now()
    };

    // 🟢 4. KV STORAGE (VERSIONED)
    const key = `site:${slug}`;
    const existing = (await kv.get(key)) || [];

    await kv.set(key, [...existing, site]);

    return res.status(200).json(site);

  } catch (err) {
    console.error("GENERATION ERROR:", err);
    return res.status(500).json({ error: "Generation failed" });
  }
}