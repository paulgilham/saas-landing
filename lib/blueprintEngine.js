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
// MODULE BUDGET SYSTEM (NEW SAFETY LAYER)
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
// MODULE BUDGET ENFORCER (NEW)
// -----------------------------
function enforceBudget(layout, tier) {
  const max = MODULE_BUDGET[tier] || MODULE_BUDGET.medium;

  // ALWAYS keep core first
  const core = layout.filter(m => CORE_REQUIRED.includes(m));
  const rest = layout.filter(m => !CORE_REQUIRED.includes(m));

  const trimmed = [...core];

  for (const m of rest) {
    if (trimmed.length >= max) break;
    if (!trimmed.includes(m)) {
      trimmed.push(m);
    }
  }

  return trimmed;
}

// -----------------------------
// RESOLVE BASE BLUEPRINT
// -----------------------------
function resolveBlueprint(type, tier) {
  const category = BLUEPRINT_MAP[type] ? type : "default";
  return BLUEPRINT_MAP[category][tier] || BLUEPRINT_MAP.default.medium;
}

// -----------------------------
// APPLY MODIFIERS (SAFE ENRICHMENT ONLY)
// -----------------------------
function applyModifiers(layout, modifiers = [], tier) {
  const mods = validateModifiers(modifiers);

  // SAFE ADDITIONS ONLY (budget-aware)

  if (mods.includes("portfolio_led")) {
    if (!layout.includes("gallery")) layout.push("gallery");
  }

  if (mods.includes("trust_heavy")) {
    if (!layout.includes("testimonials")) layout.push("testimonials");
  }

  // enforce budget after modifier expansion
  return enforceBudget(layout, tier);
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
  // 1. DETERMINE BUSINESS TYPE
  // -----------------------------
  const type =
    aiOutput.primary ||
    detectType(prompt);

  // -----------------------------
  // 2. BASE STRUCTURE
  // -----------------------------
  let layout = resolveBlueprint(type, tier);

  // -----------------------------
  // 3. AI OVERRIDE (OPTIONAL)
  // -----------------------------
  if (Array.isArray(aiOutput.layout)) {
    layout = aiOutput.layout;
  }

  // -----------------------------
  // 4. CLEANUP PIPELINE
  // -----------------------------
  layout = cleanLayout(layout);
  layout = dedupe(layout);

  // -----------------------------
  // 5. ENSURE CORE MODULES
  // -----------------------------
  layout = ensureCore(layout);

  // -----------------------------
  // 6. APPLY MODIFIERS (SAFE)
  // -----------------------------
  layout = applyModifiers(layout, modifiers, tier);

  // -----------------------------
  // 7. FINAL BUDGET ENFORCEMENT (CRITICAL)
  // -----------------------------
  layout = enforceBudget(layout, tier);

  return {
    type,
    tier,
    layout
  };
}

// -----------------------------
// FALLBACK CLASSIFIER
// -----------------------------
function detectType(prompt = "") {
  const s = prompt.toLowerCase();

  if (s.includes("hair") || s.includes("salon")) return "hair_beauty";
  if (s.includes("builder") || s.includes("construction")) return "construction_trades";

  return "default";
}