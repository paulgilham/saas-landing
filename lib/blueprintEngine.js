// -----------------------------
// MODULE REGISTRY (SOURCE OF TRUTH)
// -----------------------------
const ALLOWED_MODULES = [
  "hero",
  "features",
  "services",
  "testimonials",
  "cta",
  "contact",
  "pricing",
  "faq",
  "gallery"
];

// -----------------------------
// REQUIRED BASE MODULES
// (always present in every site)
// -----------------------------
const CORE_REQUIRED = ["hero", "cta"];

// -----------------------------
// BUSINESS TYPE RULES
// -----------------------------
function getRules(type = "default") {
  switch (type) {

    case "builder":
    case "construction":
      return {
        preferred: ["hero", "services", "testimonials", "cta", "contact"],
        optional: ["faq", "gallery"]
      };

    case "florist":
    case "flowers":
      return {
        preferred: ["hero", "features", "gallery", "cta", "contact"],
        optional: ["testimonials"]
      };

    case "agency":
    case "marketing":
      return {
        preferred: ["hero", "services", "testimonials", "cta"],
        optional: ["faq", "contact"]
      };

    case "dentist":
      return {
        preferred: ["hero", "services", "testimonials", "cta", "contact"],
        optional: ["faq"]
      };

    default:
      return {
        preferred: ["hero", "features", "services", "cta"],
        optional: ["contact"]
      };
  }
}

// -----------------------------
// CLEAN + VALIDATE MODULE
// -----------------------------
function isValidModule(m) {
  return ALLOWED_MODULES.includes(m);
}

// -----------------------------
// REMOVE DUPLICATES
// -----------------------------
function dedupe(arr) {
  return [...new Set(arr)];
}

// -----------------------------
// ENSURE REQUIRED MODULES EXIST
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
// AUTO FILL LOGIC (RULE BASED ONLY)
// -----------------------------
function fillMissing(layout, rules) {
  const final = [...layout];

  // ensure preferred modules exist
  for (const m of rules.preferred) {
    if (!final.includes(m) && isValidModule(m)) {
      final.push(m);
    }
  }

  // ensure at least CTA always
  if (!final.includes("cta")) {
    final.push("cta");
  }

  return final;
}

// -----------------------------
// MAIN BLUEPRINT ENGINE
// -----------------------------
export function generateBlueprint(prompt = "", aiOutput = {}) {

  // -------------------------
  // 1. DETERMINE BUSINESS TYPE
  // -------------------------
  const type = aiOutput.primary || detectType(prompt);

  const rules = getRules(type);

  // -------------------------
  // 2. AI SUGGESTED LAYOUT
  // -------------------------
  let layout = Array.isArray(aiOutput.layout)
    ? aiOutput.layout
    : [];

  // -------------------------
  // 3. CLEAN AI OUTPUT
  // -------------------------
  layout = cleanLayout(layout);
  layout = dedupe(layout);

  // -------------------------
  // 4. ENSURE CORE MODULES
  // -------------------------
  layout = ensureCore(layout);

  // -------------------------
  // 5. APPLY BUSINESS RULES
  // -------------------------
  layout = fillMissing(layout, rules);

  // -------------------------
  // 6. FINAL CLEANUP ORDER
  // -------------------------
  layout = dedupe(layout);

  return {
    type,
    layout
  };
}

// -----------------------------
// SIMPLE FALLBACK CLASSIFIER
// (used only if AI doesn't provide type)
// -----------------------------
function detectType(prompt = "") {
  const s = prompt.toLowerCase();

  if (s.includes("builder") || s.includes("construction")) return "builder";
  if (s.includes("florist") || s.includes("flowers")) return "florist";
  if (s.includes("agency") || s.includes("marketing")) return "agency";
  if (s.includes("dentist") || s.includes("dental")) return "dentist";

  return "default";
}