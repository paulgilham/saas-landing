// -----------------------------
// TRAIT ENGINE (DETERMINISTIC)
// Converts prompt → behavioural traits
// -----------------------------

// ALL SUPPORTED TRAITS (SOURCE OF TRUTH)
export const TRAITS = [
  "conversion_focus",
  "visual_rich",
  "trust_heavy",
  "service_heavy",
  "info_heavy"
];

// -----------------------------
// KEYWORD MAP (CONTROLLED SIGNALS)
// -----------------------------
const TRAIT_KEYWORDS = {
  conversion_focus: [
    "book",
    "booking",
    "appointment",
    "quote",
    "call",
    "buy",
    "order",
    "get started",
    "sign up"
  ],

  visual_rich: [
    "portfolio",
    "gallery",
    "photos",
    "images",
    "before and after",
    "showcase",
    "design"
  ],

  trust_heavy: [
    "reviews",
    "testimonials",
    "trusted",
    "certified",
    "experienced",
    "since",
    "years",
    "reputation"
  ],

  service_heavy: [
    "services",
    "what we do",
    "offer",
    "solutions",
    "packages"
  ],

  info_heavy: [
    "faq",
    "questions",
    "learn",
    "guide",
    "how it works",
    "information",
    "details"
  ]
};

// -----------------------------
// EXTRA SIGNAL BOOSTERS (CATEGORY AWARE)
// -----------------------------
function categoryBoost(category) {
  switch (category) {
    case "hair_beauty":
      return ["visual_rich", "conversion_focus"];

    case "construction_trades":
      return ["trust_heavy", "service_heavy"];

    case "health_medical":
      return ["trust_heavy", "info_heavy"];

    case "hospitality":
      return ["conversion_focus", "visual_rich"];

    case "fitness_wellness":
      return ["conversion_focus", "visual_rich"];

    default:
      return [];
  }
}

// -----------------------------
// MAIN TRAIT EXTRACTOR
// -----------------------------
export function extractTraits(prompt = "", category = "") {
  const text = prompt.toLowerCase();

  const detected = new Set();

  // -------------------------
  // 1. KEYWORD MATCHING
  // -------------------------
  for (const trait in TRAIT_KEYWORDS) {
    const keywords = TRAIT_KEYWORDS[trait];

    for (const word of keywords) {
      if (text.includes(word)) {
        detected.add(trait);
        break;
      }
    }
  }

  // -------------------------
  // 2. CATEGORY BOOST (SAFE)
  // -------------------------
  const boosted = categoryBoost(category);
  boosted.forEach(t => detected.add(t));

  // -------------------------
  // 3. DEFAULT FALLBACK
  // -------------------------
  if (detected.size === 0) {
    detected.add("service_heavy"); // safe baseline
  }

  return Array.from(detected);
}