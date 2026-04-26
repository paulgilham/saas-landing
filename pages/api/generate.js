import { generateBlueprint } from "@/lib/blueprintEngine";
import { generateModuleContent } from "@/lib/contentEngine";
import { extractTraits } from "@/lib/traitEngine";
import { randomUUID } from "crypto";
import {
  generateUniqueSlug,
  saveSiteVersion,
  updateSlugPointer,
  saveBusinessProfile
} from "@/lib/kv";

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
    // 1. IDENTITY
    // businessId is always a fresh UUID — true unique identity
    // slug is human-readable but also guaranteed unique via lib/kv
    // -----------------------------
    const businessId = randomUUID();
    const version = 1;
    const slug = await generateUniqueSlug(prompt, businessId);

    // -----------------------------
    // 2. TRAITS
    // -----------------------------
    const traits = extractTraits(prompt);

    // -----------------------------
    // 3. BLUEPRINT
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
    // 6. SAVE SITE + SLUG POINTER
    // using lib/kv helper — key patterns managed centrally
    // -----------------------------
    await saveSiteVersion(businessId, version, site);
    await updateSlugPointer(slug, businessId, version);

    // -----------------------------
    // 7. SAVE BUSINESS PROFILE
    // stored separately for intelligence layer (Steps 5-6)
    // -----------------------------
    await saveBusinessProfile(businessId, {
      businessId,
      prompt,
      category,
      tier,
      traits,
      slug,
      createdAt: Date.now()
    });

    return res.status(200).json({ slug, businessId });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Generation failed" });
  }
}
