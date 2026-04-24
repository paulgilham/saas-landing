// -----------------------------
// TRAIT ENGINE (PROMPT → SEMANTIC CAPABILITIES)
// -----------------------------

import { resolveBusinessCategory, BUSINESS_TRAITS } from "./taxonomy";

// -----------------------------
// MAIN TRANSFORM
// -----------------------------
export function getBusinessTraits(prompt = "") {
  const type = resolveBusinessCategory(prompt);

  const traits = BUSINESS_TRAITS[type] || [];

  return {
    type,
    traits
  };
}

// -----------------------------
// OPTIONAL: PROMPT ENRICHMENT LAYER
// (future-safe hook for AI modifiers later)
// -----------------------------
export function enrichTraits(prompt = "", modifiers = []) {
  const base = getBusinessTraits(prompt);

  let traits = [...base.traits];

  // SAFE ADDITIVE EXTENSIONS ONLY (NO REMOVAL LOGIC)
  if (modifiers.includes("high_trust")) {
    traits.push("trust_critical");
  }

  if (modifiers.includes("conversion_focus")) {
    traits.push("conversion_focused");
  }

  if (modifiers.includes("visual_heavy")) {
    traits.push("visual_heavy");
  }

  // dedupe
  traits = [...new Set(traits)];

  return {
    type: base.type,
    traits
  };
}