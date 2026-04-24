// -----------------------------
// MODULE GRAPH (CORE INTELLIGENCE LAYER)
// -----------------------------

export const MODULE_GRAPH = {
  hero: {
    requires: [],
    tags: ["entry", "branding"],
    weight: 1
  },

  services: {
    requires: [],
    tags: ["core", "offerings"],
    weight: 2
  },

  testimonials: {
    requires: ["trust_signal"],
    tags: ["trust", "social_proof"],
    weight: 2
  },

  pricing: {
    requires: ["commercial_intent"],
    tags: ["conversion", "pricing"],
    weight: 3
  },

  booking: {
    requires: ["time_based_service"],
    tags: ["conversion", "scheduling"],
    weight: 3
  },

  faq: {
    requires: ["uncertainty_reduction"],
    tags: ["trust", "clarity"],
    weight: 2
  },

  gallery: {
    requires: ["visual_heavy"],
    tags: ["portfolio", "visual"],
    weight: 2
  },

  contact: {
    requires: [],
    tags: ["conversion", "utility"],
    weight: 1
  },

  cta: {
    requires: [],
    tags: ["conversion"],
    weight: 1
  }
};