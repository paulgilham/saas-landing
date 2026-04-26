import { validateModifiers } from "./modifiers";
import { filterLayoutByEligibility } from "./moduleEligibility";

// -----------------------------
// ALLOWED MODULES (SOURCE OF TRUTH)
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
// MODULE BUDGET SYSTEM
// -----------------------------
const MODULE_BUDGET = {
  simple:   4,
  medium:   7,
  advanced: 10
};

// -----------------------------
// BLUEPRINT MAP — ALL 13 CATEGORIES
// -----------------------------
const BLUEPRINT_MAP = {
  hair_beauty: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "gallery", "testimonials", "cta"],
    advanced: ["hero", "services", "gallery", "testimonials", "booking", "faq", "cta", "contact"]
  },

  construction_trades: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "testimonials", "about", "cta", "contact"],
    advanced: ["hero", "services", "gallery", "testimonials", "about", "faq", "cta", "contact"]
  },

  health_medical: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "testimonials", "faq", "cta", "contact"],
    advanced: ["hero", "services", "testimonials", "about", "faq", "booking", "cta", "contact"]
  },

  legal_services: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "about", "faq", "cta", "contact"],
    advanced: ["hero", "services", "about", "testimonials", "faq", "pricing", "cta", "contact"]
  },

  finance_accounting: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "about", "faq", "cta", "contact"],
    advanced: ["hero", "services", "about", "testimonials", "pricing", "faq", "cta", "contact"]
  },

  hospitality: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "gallery", "testimonials", "cta", "contact"],
    advanced: ["hero", "services", "gallery", "testimonials", "about", "faq", "cta", "contact"]
  },

  fitness_wellness: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "pricing", "testimonials", "cta", "contact"],
    advanced: ["hero", "services", "pricing", "testimonials", "gallery", "booking", "faq", "cta", "contact"]
  },

  education_training: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "about", "faq", "cta", "contact"],
    advanced: ["hero", "services", "features", "about", "testimonials", "pricing", "faq", "cta", "contact"]
  },

  real_estate: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "gallery", "testimonials", "cta", "contact"],
    advanced: ["hero", "services", "gallery", "testimonials", "about", "faq", "cta", "contact"]
  },

  agencies_marketing: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "gallery", "testimonials", "cta", "contact"],
    advanced: ["hero", "services", "gallery", "features", "testimonials", "pricing", "faq", "cta", "contact"]
  },

  retail_ecommerce: {
    simple:   ["hero", "features", "cta"],
    medium:   ["hero", "features", "pricing", "testimonials", "cta", "contact"],
    advanced: ["hero", "features", "pricing", "gallery", "testimonials", "faq", "cta", "contact"]
  },

  automotive: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "testimonials", "about", "cta", "contact"],
    advanced: ["hero", "services", "gallery", "testimonials", "about", "faq", "cta", "contact"]
  },

  home_services: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "testimonials", "about", "cta", "contact"],
    advanced: ["hero", "services", "testimonials", "gallery", "about", "faq", "booking", "cta", "contact"]
  },

  default: {
    simple:   ["hero", "services", "cta"],
    medium:   ["hero", "services", "testimonials", "cta", "contact"],
    advanced: ["hero", "services", "testimonials", "about", "faq", "cta", "contact"]
  }
};

// -----------------------------
// HELPERS
// -----------------------------
function isValidModule(m) {
  return ALLOWED_MODULES.includes(m);
}

function dedupe(arr) {
  return [...new Set(arr)];
}

function cleanLayout(layout) {
  return layout.filter(isValidModule);
}

function ensureCore(layout) {
  const middle = layout.filter(m => m !== "hero" && m !== "cta");
  return ["hero", ...middle, "cta"];
}

function enforceBudget(layout, tier) {
  const max = MODULE_BUDGET[tier] || MODULE_BUDGET.medium;
  const core = layout.filter(m => CORE_REQUIRED.includes(m));
  const rest = layout.filter(m => !CORE_REQUIRED.includes(m));
  const result = [...core];
  for (const m of rest) {
    if (result.length >= max) break;
    if (!result.includes(m)) result.push(m);
  }
  return result;
}

// -----------------------------
// TRAIT SCORING
// Higher score = module appears earlier + survives budget cuts
// -----------------------------
function scoreByTraits(module, traits = []) {
  let score = 1;
  if (module === "booking"      && traits.includes("appointment_based"))     score += 3;
  if (module === "booking"      && traits.includes("time_based_service"))    score += 2;
  if (module === "gallery"      && traits.includes("visual_heavy"))          score += 3;
  if (module === "gallery"      && traits.includes("portfolio_based"))       score += 2;
  if (module === "pricing"      && traits.includes("commercial_intent"))     score += 3;
  if (module === "pricing"      && traits.includes("conversion_focused"))    score += 2;
  if (module === "testimonials" && traits.includes("trust_critical"))        score += 3;
  if (module === "testimonials" && traits.includes("trust_signal"))          score += 2;
  if (module === "faq"          && traits.includes("uncertainty_reduction")) score += 3;
  if (module === "faq"          && traits.includes("information_heavy"))     score += 2;
  if (module === "about"        && traits.includes("trust_critical"))        score += 2;
  if (module === "contact"      && traits.includes("conversion_focused"))    score += 2;
  return score;
}

// -----------------------------
// MODIFIER SYSTEM (ADDITIVE)
// -----------------------------
function applyModifiers(layout, modifiers = [], tier) {
  const mods = validateModifiers(modifiers);
  if (mods.includes("portfolio_led")   && !layout.includes("gallery"))      layout.push("gallery");
  if (mods.includes("trust_heavy")     && !layout.includes("testimonials")) layout.push("testimonials");
  if (mods.includes("conversion_focus")&& !layout.includes("pricing"))      layout.push("pricing");
  if (mods.includes("booking_driven")  && !layout.includes("booking"))      layout.push("booking");
  return enforceBudget(layout, tier);
}

// -----------------------------
// MAIN BLUEPRINT ENGINE
// Accepts category + traits from traitEngine — no internal detection.
// -----------------------------
export function generateBlueprint({
  prompt = "",
  category = "home_services",
  tier = "medium",
  traits = [],
  modifiers = []
}) {
  // 1. BASE STRUCTURE
  let layout =
    BLUEPRINT_MAP[category]?.[tier] ||
    BLUEPRINT_MAP.default[tier] ||
    BLUEPRINT_MAP.default.medium;

  // 2. CLEAN + VALIDATE
  layout = cleanLayout(layout);
  layout = dedupe(layout);

  // 3. TRAIT-BASED REORDERING
  const core = layout.filter(m =>  CORE_REQUIRED.includes(m));
  const nonCore = layout.filter(m => !CORE_REQUIRED.includes(m));
  const sorted = nonCore.sort((a, b) => scoreByTraits(b, traits) - scoreByTraits(a, traits));
  layout = ["hero", ...sorted, "cta"];
  layout = dedupe(layout);

  // 4. MODIFIERS
  layout = applyModifiers(layout, modifiers, tier);

  // 5. BUDGET ENFORCEMENT
  layout = enforceBudget(layout, tier);

  // 6. GRAPH ELIGIBILITY FILTER  ← THE KEY STEP 6 ADDITION
  // Removes any module whose graph requirements aren't met by traits
  layout = filterLayoutByEligibility(layout, traits, tier);

  // 7. ENSURE HERO FIRST, CTA LAST (re-pin after all filters)
  layout = ensureCore(layout);

  return {
    type: category,
    tier,
    traits,
    layout
  };
}
