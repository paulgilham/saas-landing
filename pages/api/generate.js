import { extractBrief }          from "@/lib/briefEngine";
import { generateBlueprint }     from "@/lib/blueprintEngine";
import { generateModuleContent } from "@/lib/contentEngine";
import { randomUUID }            from "crypto";
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
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "prompt required" });
    }

    // -----------------------------
    // 1. IDENTITY
    // businessId is the permanent unique identity for this site.
    // slug is human-readable + unique via briefEngine + kv helper.
    // -----------------------------
    const businessId = randomUUID();

    // -----------------------------
    // 2. BRIEF EXTRACTION
    // Single rich AI call — returns full business context
    // including category, traits, tone, tagline, complexity
    // score and tier. No hardcoded tier, no separate
    // classification call.
    // -----------------------------
    const brief = await extractBrief(prompt);

    const { category, traits, tier, suggestedPages } = brief;

    // -----------------------------
    // 3. SLUG
    // Generated after brief so we can use businessName
    // for a cleaner, more readable slug.
    // -----------------------------
    const slug = await generateUniqueSlug(brief.businessName || prompt, businessId);

    // -----------------------------
    // 4. BLUEPRINT
    // category + traits come from brief — no internal
    // detection inside blueprintEngine.
    // suggestedPages passed through for Step 8 multipage.
    // -----------------------------
    const blueprint = generateBlueprint({
      prompt,
      category,
      tier,
      traits
    });

    const { layout: modules } = blueprint;

    // -----------------------------
    // 5. STRUCTURE
    // Currently single page — home only.
    // Step 8 will extend this to multipage using suggestedPages.
    // -----------------------------
    const structure = { home: modules };

    // -----------------------------
    // 6. CONTENT GENERATION
    // Full brief injected into every module prompt.
    // Each module gets business-specific copy, not category labels.
    // -----------------------------
    const content = { home: {} };

    for (const module of modules) {
      const result = await generateModuleContent({
        module,
        brief,
        tier
      });

      content.home[module] =
        result?.data && typeof result.data === "object"
          ? result.data
          : {};
    }

    // -----------------------------
    // 7. FINAL SITE OBJECT
    // brief stored at top level — available to all
    // downstream operations (regenerate, diff, modifiers).
    // -----------------------------
    const site = {
      schemaVersion: 3,
      businessId,
      version:       1,
      slug,
      prompt,
      brief,
      category,
      tier,
      traits,
      suggestedPages,
      structure,
      content,
      createdAt: Date.now()
    };

    // -----------------------------
    // 8. PERSIST
    // -----------------------------
    await saveSiteVersion(businessId, 1, site);
    await updateSlugPointer(slug, businessId, 1);

    // -----------------------------
    // 9. BUSINESS PROFILE
    // Stored separately from site — available for
    // intelligence layer reads without loading full site.
    // -----------------------------
    await saveBusinessProfile(businessId, {
      businessId,
      brief,
      category,
      tier,
      traits,
      slug,
      createdAt: Date.now()
    });

    return res.status(200).json({ slug, businessId });

  } catch (err) {
    console.error("Generation failed:", err);
    return res.status(500).json({ error: "Generation failed" });
  }
}
