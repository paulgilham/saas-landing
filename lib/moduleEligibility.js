import { MODULE_GRAPH } from "./moduleGraph";

// -----------------------------
// GRAPH-DRIVEN ELIGIBILITY ENGINE
// Pure function — accepts pre-computed traits from traitEngine.
// Called by blueprintEngine as a filter pass after layout generation.
// -----------------------------
export function isModuleAllowed(module, traits = [], tier = "medium") {
  const node = MODULE_GRAPH[module];

  // Unknown module — allow by default
  if (!node) return true;

  // -------------------------
  // TIER RULES
  // -------------------------
  if (module === "pricing"  && tier === "simple") return false;
  if (module === "booking"  && tier === "simple") return false;
  if (module === "gallery"  && tier === "simple") return false;
  if (module === "faq"      && tier === "simple") return false;

  // -------------------------
  // CORE MODULES — always allowed
  // -------------------------
  if (module === "hero")     return true;
  if (module === "cta")      return true;
  if (module === "services") return true;
  if (module === "contact")  return true;
  if (module === "about")    return true;
  if (module === "features") return true;

  // -------------------------
  // GRAPH REQUIREMENTS CHECK
  // All required traits must be present in computed traits
  // -------------------------
  const required = node.requires || [];
  return required.every(req => traits.includes(req));
}

// -----------------------------
// FILTER LAYOUT BY ELIGIBILITY
// Convenience function — filters an entire layout array.
// Called once at the end of blueprintEngine.
// -----------------------------
export function filterLayoutByEligibility(layout = [], traits = [], tier = "medium") {
  return layout.filter(module => isModuleAllowed(module, traits, tier));
}
