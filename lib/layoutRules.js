// -----------------------------
// BASE LAYOUT RULES (TIER SYSTEM)
// -----------------------------
export const LAYOUT_RULES = {
  simple: {
    sectionSpacing: "py-20",
    containerWidth: "max-w-4xl mx-auto",
    density: "loose"
  },

  medium: {
    sectionSpacing: "py-16",
    containerWidth: "max-w-5xl mx-auto",
    density: "normal"
  },

  advanced: {
    sectionSpacing: "py-10",
    containerWidth: "max-w-6xl mx-auto",
    density: "compact"
  }
};

// -----------------------------
// MODULE PRIORITY (VISUAL HIERARCHY)
// -----------------------------
export const MODULE_PRIORITY = {
  // CORE
  hero: 5,
  cta: 5,

  // PRIMARY CONTENT
  services: 4,
  features: 3,
  testimonials: 3,

  // SUPPORTING
  about: 3,
  gallery: 3,

  // CONVERSION / UTILITY
  pricing: 4,
  booking: 5,

  // TRUST / INFO
  faq: 2,
  contact: 2
};