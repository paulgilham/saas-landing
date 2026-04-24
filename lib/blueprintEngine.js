import { validateModifiers } from "./modifiers";
import { getBusinessTraits } from "./traits";

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
// MODULE BUDGET SYSTEM
// -----------------------------
const MODULE_BUDGET = {
  simple: 4,
  medium: 7,
  advanced: 10
};

// -----------------------------
// BLUEPRINT MAP (BASE STRUCTURE)
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
// HELPERS
// -----------------------------
function dedupe(arr) {
  return [...new Set(arr)];
}

function ensureCore(layout) {
  const set = new Set(layout);
  CORE_REQUIRED.forEach(m => set.add(m));
  return Array.from(set);
}

function cleanLayout(layout) {
  return layout.filter(isValidModule);
}

// -----------------------------
// MODULE BUDGET ENFORCER
// -----------------------------
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
// MODIFIER SYSTEM (SAFE ADDITIVE)
// -----------------------------
function applyModifiers(layout, modifiers = [], tier) {
  const mods = validateModifiers(modifiers);

  if (mods.includes("portfolio_led") && !layout.includes("gallery")) {
    layout.push("gallery");
  }

  if (mods.includes("trust_heavy") && !layout.includes("testimonials")) {
    layout.push("testimonials");
  }

  if (mods.includes("conversion_focus") && !layout.includes("pricing")) {
    layout.push("pricing");
  }

  return enforceBudget(layout, tier);
}

// -----------------------------
// BUSINESS TYPE DETECTOR
// -----------------------------
function detectType(prompt = "") {
  const s = prompt.toLowerCase();

  if (s.includes("hair") || s.includes("salon")) return "hair_beauty";
  if (s.includes("builder") || s.includes("construction")) return "construction_trades";

  return "default";
}

// -----------------------------
// TRAIT SCORING LAYER
// -----------------------------
function scoreByTraits(module, traits) {
  let score = 1;

  if (module === "booking" && traits.includes("appointment_based")) score += 3;
  if (module === "gallery" && traits.includes("visual_heavy")) score += 3;
  if (module === "pricing" && traits.includes("commercial_intent")) score += 3;
  if (module === "testimonials" && traits.includes("trust_critical")) score += 3;
  if (module === "faq" && traits.includes("uncertainty_reduction")) score += 3;

  return score;
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
  // 1. TYPE RESOLUTION
  // -----------------------------
  const type = aiOutput.primary || detectType(prompt);

  // -----------------------------
  // 2. TRAITS EXTRACTION
  // -----------------------------
  const { traits = [] } = getBusinessTraits(prompt);

  // -----------------------------
  // 3. BASE STRUCTURE
  // -----------------------------
  let layout =
    aiOutput.layout ||
    BLUEPRINT_MAP[type]?.[tier] ||
    BLUEPRINT_MAP.default.medium;

  // -----------------------------
  // 4. CLEAN + VALIDATE
  // -----------------------------
  layout = cleanLayout(layout);
  layout = dedupe(layout);

  // -----------------------------
  // 5. TRAIT-BASED REORDERING (KEY UPGRADE)
  // -----------------------------
  layout = layout.sort((a, b) => {
    return scoreByTraits(b, traits) - scoreByTraits(a, traits);
  });

  // -----------------------------
  // 6. CORE ENFORCEMENT
  // -----------------------------
  layout = ensureCore(layout);

  // -----------------------------
  // 7. MODIFIERS (SAFE ADDITIVE)
  // -----------------------------
  layout = applyModifiers(layout, modifiers, tier);

  // -----------------------------
  // 8. FINAL BUDGET ENFORCEMENT
  // -----------------------------
  layout = enforceBudget(layout, tier);

  // -----------------------------
  // OUTPUT
  // -----------------------------
  return {
    type,
    tier,
    traits,
    layout
  };
}