import { resolveBusinessCategory, BUSINESS_TRAITS, TRAIT_VOCABULARY } from "./taxonomy";

// -----------------------------
// KEYWORD → TRAIT MAP
// Uses master vocabulary from taxonomy.js only.
// Keyword detection adds traits ON TOP of category base traits.
// -----------------------------
const TRAIT_KEYWORDS = {
  appointment_based: [
    "book", "booking", "appointment", "schedule", "reserve", "availability"
  ],

  time_based_service: [
    "session", "class", "lesson", "treatment", "consult", "hour", "slot"
  ],

  visual_heavy: [
    "portfolio", "gallery", "photos", "images", "before and after",
    "showcase", "photography", "visual", "look book"
  ],

  trust_critical: [
    "certified", "licensed", "qualified", "accredited", "registered",
    "insured", "award", "expert"
  ],

  trust_signal: [
    "reviews", "testimonials", "trusted", "rated", "reputation",
    "recommended", "5 star", "google", "experienced", "years"
  ],

  commercial_intent: [
    "buy", "order", "price", "pricing", "quote", "purchase",
    "sign up", "get started", "subscription", "plan"
  ],

  uncertainty_reduction: [
    "faq", "questions", "how it works", "guide", "learn",
    "information", "details", "what to expect"
  ],

  conversion_focused: [
    "book now", "call now", "free consultation", "free quote",
    "contact us today", "get in touch", "urgent", "fast"
  ],

  information_heavy: [
    "education", "training", "course", "tutorial", "resources",
    "blog", "articles", "learn more"
  ],

  portfolio_based: [
    "portfolio", "our work", "projects", "case studies",
    "examples", "past work", "clients"
  ]
};

// -----------------------------
// MAIN EXTRACTOR
// Single entry point for the entire trait pipeline.
// Returns { category, traits } — unified vocabulary throughout.
// -----------------------------
export function extractTraits(prompt = "") {
  const text = prompt.toLowerCase();

  // -------------------------
  // 1. RESOLVE CATEGORY
  // -------------------------
  const category = resolveBusinessCategory(prompt);

  // -------------------------
  // 2. BASE TRAITS FROM CATEGORY
  // -------------------------
  const detected = new Set(BUSINESS_TRAITS[category] || []);

  // -------------------------
  // 3. KEYWORD SCAN (ADDITIVE)
  // Adds extra traits on top of category base.
  // Only adds traits that are in master vocabulary.
  // -------------------------
  for (const trait in TRAIT_KEYWORDS) {
    if (!TRAIT_VOCABULARY.includes(trait)) continue;
    const keywords = TRAIT_KEYWORDS[trait];
    for (const word of keywords) {
      if (text.includes(word)) {
        detected.add(trait);
        break;
      }
    }
  }

  // -------------------------
  // 4. DEFAULT SAFETY NET
  // -------------------------
  if (detected.size === 0) {
    detected.add("service_based");
  }

  return {
    category,
    traits: Array.from(detected)
  };
}

// -----------------------------
// ENRICH TRAITS
// Additive modifier hook — used in Step 9 (modifier dials).
// Accepts user-selected modifiers and adds matching traits.
// -----------------------------
export function enrichTraits(baseTraits = [], modifiers = []) {
  const traits = new Set(baseTraits);

  if (modifiers.includes("trust_heavy")) {
    traits.add("trust_critical");
    traits.add("trust_signal");
  }

  if (modifiers.includes("conversion_focus")) {
    traits.add("commercial_intent");
    traits.add("conversion_focused");
  }

  if (modifiers.includes("portfolio_led")) {
    traits.add("visual_heavy");
    traits.add("portfolio_based");
  }

  if (modifiers.includes("booking_driven")) {
    traits.add("appointment_based");
    traits.add("time_based_service");
  }

  return Array.from(traits);
}
