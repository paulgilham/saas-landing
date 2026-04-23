import { BUSINESS_CATEGORIES } from "./taxonomy";
import { validateModifiers } from "./modifiers";

// -----------------------------
// MODULE REGISTRY (SOURCE OF TRUTH)
// -----------------------------
const ALLOWED_MODULES = [
  "hero",
  "services",
  "features",
  "testimonials",
  "cta",
  "contact",
  "pricing",
  "faq",
  "gallery",
  "booking",
  "about"
];

// -----------------------------
// CORE MODULES (NEVER REMOVE)
// -----------------------------
const CORE_REQUIRED = ["hero", "cta"];

// -----------------------------
// BLUEPRINT MAP (LAYER 1 → STRUCTURE)
// -----------------------------
const BLUEPRINT_MAP = {
  hair_beauty: {
    simple: ["hero", "services", "cta"],
    medium: ["hero", "services", "testimonials", "cta", "contact"],
    advanced: [
      "hero",
      "services",
      "testimonials",
      "gallery",
      "booking",
      "faq",
      "cta",
      "contact"
    ]
  },

  construction_trades: {
    simple: ["hero", "services", "cta"],
    medium: ["hero", "services", "projects", "testimonials", "cta", "contact"],
    advanced: [
      "hero",
      "services",
      "projects",
      "case_studies",
      "testimonials",
      "faq",
      "cta",
      "contact"
    ]
  },

  default: {
    simple: ["hero", "services", "cta"],
    medium: ["hero", "services", "testimonials", "cta", "contact"],
    advanced: ["hero", "services", "testimonials", "gallery", "cta", "contact"]
  }
};

// -----------------------------
// VALIDATION
// -----------------------------
function isValidModule(m) {
  return ALLOWED_MODULES.includes(m);
}

// -----------------------------
// DEDUPE
// -----------------------------
function dedupe(arr) {
  return [...new Set(arr)];
}

// -----------------------------
// ENSURE CORE MODULES
// -----------------------------
function ensureCore(layout) {
  const set = new Set(layout);
  CORE_REQUIRED.forEach(m => set.add(m));
  return Array.from(set);
}

// -----------------------------
// CLEAN INVALID MODULES
// -----------------------------
function cleanLayout(layout) {
  return layout.filter(isValidModule);
}

// -----------------------------
// RESOLVE BASE BLUEPRINT
// -----------------------------
function resolveBlueprint(type, tier) {
  const category = BLUEPRINT_MAP[type] ? type : "default";
  return BLUEPRINT_MAP[category][tier] || BLUEPRINT_MAP.default.medium;
}

// -----------------------------
// APPLY MODIFIER RULES (FUTURE SAFE HOOK)
// -----------------------------
function applyModifiers(layout, modifiers = []) {
  const mods = validateModifiers(modifiers);

  // SAFE ENRICHMENT ONLY (NO STRUCTURE OVERRIDE)

  if (mods.includes("portfolio_led")) {
    if (!layout.includes("gallery")) layout.push("gallery");
  }

  if (mods.includes("trust_heavy")) {
    if (!layout.includes("testimonials")) layout.push("testimonials");
  }

  return layout;
}

// -----------------------------
// MAIN BLUEPRINT ENGINE
// -----------------------------
export function generateBlueprint({
  prompt = "",
  aiOutput = {},
  tier = "medium",
  modifiers = []
}) {

  // -----------------------------
  // 1. DETERMINE BUSINESS TYPE (LAYER 1)
  // -----------------------------
  const type =
    aiOutput.primary ||
    detectType(prompt);

  // -----------------------------
  // 2. BASE STRUCTURE (DETERMINISTIC)
  // -----------------------------
  let layout = resolveBlueprint(type, tier);

  // -----------------------------
  // 3. CLEAN AI INPUT (IF ANY)
  // -----------------------------
  if (Array.isArray(aiOutput.layout)) {
    layout = aiOutput.layout;
  }

  layout = cleanLayout(layout);
  layout = dedupe(layout);

  // -----------------------------
  // 4. APPLY CORE RULES
  // -----------------------------
  layout = ensureCore(layout);

  // -----------------------------
  // 5. APPLY MODIFIERS (LAYER 2 SAFE ENRICHMENT)
  // -----------------------------
  layout = applyModifiers(layout, modifiers);

  // -----------------------------
  // 6. FINAL NORMALISATION
  // -----------------------------
  layout = dedupe(layout);

  return {
    type,
    tier,
    layout
  };
}

// -----------------------------
// FALLBACK CLASSIFIER (LAYER 1 ONLY)
// -----------------------------
function detectType(prompt = "") {
  const s = prompt.toLowerCase();

  if (s.includes("hair") || s.includes("salon")) return "hair_beauty";
  if (s.includes("builder") || s.includes("construction")) return "construction_trades";

  return "default";
}