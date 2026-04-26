// -----------------------------
// BUSINESS TAXONOMY (SOURCE OF TRUTH)
// Master vocabulary used across all engines
// -----------------------------

export const BUSINESS_CATEGORIES = [
  "hair_beauty",
  "construction_trades",
  "health_medical",
  "legal_services",
  "finance_accounting",
  "hospitality",
  "fitness_wellness",
  "education_training",
  "real_estate",
  "agencies_marketing",
  "retail_ecommerce",
  "automotive",
  "home_services"
];

// -----------------------------
// MASTER TRAIT VOCABULARY
// These are the ONLY valid traits in the system.
// Every engine reads from this vocabulary.
// -----------------------------
export const TRAIT_VOCABULARY = [
  "time_based_service",    // scheduling/session-driven businesses
  "appointment_based",     // booking-driven — triggers booking module
  "visual_heavy",          // image/portfolio driven — triggers gallery module
  "trust_critical",        // high-stakes — triggers testimonials, about
  "trust_signal",          // social proof needed — triggers testimonials
  "commercial_intent",     // pricing/buying intent — triggers pricing module
  "uncertainty_reduction", // FAQ/education needed — triggers faq module
  "conversion_focused",    // strong CTA focus — boosts CTA emphasis
  "project_based",         // construction/project work
  "information_heavy",     // lots of content/education
  "portfolio_based",       // work showcase needed — triggers gallery
  "catalog_based",         // product listing driven
  "service_based",         // general service business
  "menu_based",            // hospitality/food
  "data_heavy"             // finance/technical content
];

// -----------------------------
// CATEGORY → TRAITS MAP
// Base traits assigned by business category.
// traitEngine adds keyword-detected traits on top.
// -----------------------------
export const BUSINESS_TRAITS = {
  hair_beauty: [
    "time_based_service",
    "appointment_based",
    "visual_heavy",
    "trust_signal",
    "commercial_intent"
  ],

  construction_trades: [
    "project_based",
    "trust_critical",
    "trust_signal",
    "visual_heavy"
  ],

  health_medical: [
    "trust_critical",
    "trust_signal",
    "appointment_based",
    "uncertainty_reduction"
  ],

  legal_services: [
    "trust_critical",
    "trust_signal",
    "information_heavy",
    "uncertainty_reduction"
  ],

  finance_accounting: [
    "trust_critical",
    "trust_signal",
    "data_heavy"
  ],

  hospitality: [
    "visual_heavy",
    "menu_based",
    "commercial_intent"
  ],

  fitness_wellness: [
    "appointment_based",
    "time_based_service",
    "commercial_intent",
    "conversion_focused"
  ],

  education_training: [
    "information_heavy",
    "uncertainty_reduction"
  ],

  real_estate: [
    "visual_heavy",
    "trust_critical",
    "trust_signal",
    "commercial_intent"
  ],

  agencies_marketing: [
    "portfolio_based",
    "visual_heavy",
    "commercial_intent"
  ],

  retail_ecommerce: [
    "catalog_based",
    "commercial_intent",
    "conversion_focused"
  ],

  automotive: [
    "service_based",
    "trust_signal"
  ],

  home_services: [
    "service_based",
    "trust_signal",
    "appointment_based",
    "commercial_intent"
  ]
};

// -----------------------------
// CATEGORY RESOLVER (DETERMINISTIC)
// Maps prompt keywords → business category
// -----------------------------
export function resolveBusinessCategory(input = "") {
  const t = input.toLowerCase();

  if (t.includes("hair") || t.includes("salon") || t.includes("barber")) return "hair_beauty";
  if (t.includes("builder") || t.includes("construction") || t.includes("trades") || t.includes("plumb") || t.includes("electri")) return "construction_trades";
  if (t.includes("clinic") || t.includes("doctor") || t.includes("medical") || t.includes("dentist") || t.includes("physio")) return "health_medical";
  if (t.includes("law") || t.includes("legal") || t.includes("solicitor") || t.includes("attorney")) return "legal_services";
  if (t.includes("account") || t.includes("finance") || t.includes("bookkeep") || t.includes("tax")) return "finance_accounting";
  if (t.includes("restaurant") || t.includes("cafe") || t.includes("coffee") || t.includes("food") || t.includes("bar")) return "hospitality";
  if (t.includes("gym") || t.includes("fitness") || t.includes("yoga") || t.includes("pilates") || t.includes("personal train")) return "fitness_wellness";
  if (t.includes("school") || t.includes("course") || t.includes("tutor") || t.includes("training") || t.includes("coach")) return "education_training";
  if (t.includes("real estate") || t.includes("property") || t.includes("agent") || t.includes("realt")) return "real_estate";
  if (t.includes("agency") || t.includes("marketing") || t.includes("creative") || t.includes("design studio")) return "agencies_marketing";
  if (t.includes("shop") || t.includes("store") || t.includes("boutique") || t.includes("ecommerce")) return "retail_ecommerce";
  if (t.includes("car") || t.includes("auto") || t.includes("mechanic") || t.includes("vehicle")) return "automotive";

  return "home_services";
}
