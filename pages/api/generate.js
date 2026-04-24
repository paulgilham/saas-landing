import { generateBlueprint } from "@/lib/blueprintEngine";
import { kv } from "@vercel/kv";
import { generateModuleContent } from "@/lib/contentEngine";
import { extractTraits } from "@/lib/traitEngine";
import { randomUUID } from "crypto";

// ------------------------------------
// MAIN HANDLER
// ------------------------------------
export default async function handler(req, res) {
  try {
    const { prompt, tier = "medium" } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "prompt required" });
    }

    // -----------------------------
    // 1. IDENTITY (SOURCE OF TRUTH)
    // -----------------------------
    const businessId = randomUUID();
    const version = 1;

    const baseSlug = prompt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const slug = `${baseSlug}`;

    // -----------------------------
    // 2. TRAITS
    // -----------------------------
    const traits = extractTraits(prompt);

    // -----------------------------
    // 3. BLUEPRINT (TRAIT AWARE)
    // -----------------------------
    const blueprint = generateBlueprint({
      prompt,
      tier,
      traits
    });

    const { type: category, layout: modules } = blueprint;

    const structure = { home: modules };

    // -----------------------------
    // 4. CONTENT GENERATION
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

      content.home[module] =
        result?.data && typeof result.data === "object"
          ? result.data
          : {};
    }

    // -----------------------------
    // 5. FINAL SITE OBJECT
    // -----------------------------
    const site = {
      schemaVersion: 3,
      businessId,
      version,
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
    // 6. STORE VERSIONED SITE
    // -----------------------------
    await kv.set(`site:${businessId}:v${version}`, site);

    // -----------------------------
    // 7. SLUG POINTER
    // -----------------------------
    await kv.set(`slug:${slug}`, {
      businessId,
      currentVersion: version
    });

    return res.status(200).json({
      slug,
      businessId
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Generation failed" });
  }
}