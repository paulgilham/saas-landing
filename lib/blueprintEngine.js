import { classifyBusiness } from "./classifier";
import { modules } from "./modules";

/**
 * 🧠 RULE ENGINE (business → structure mapping)
 * This defines how websites are constructed per business type
 */
const RULES = {
  builder: {
    mustHave: ["hero", "services", "portfolio_grid", "process", "cta"],
    optional: ["testimonials", "faq", "stats"],
    hero: "hero.split",
    cta: "cta.urgency"
  },

  florist: {
    mustHave: ["hero", "gallery", "services", "cta"],
    optional: ["testimonials", "urgency_bar", "contact"],
    hero: "hero.image_left",
    cta: "cta.standard"
  },

  agency: {
    mustHave: ["hero", "features", "portfolio_grid", "pricing", "cta"],
    optional: ["testimonials", "faq", "about"],
    hero: "hero.minimal",
    cta: "cta.standard"
  },

  dentist: {
    mustHave: ["hero", "services", "about", "cta"],
    optional: ["testimonials", "faq", "booking"],
    hero: "hero.default",
    cta: "cta.standard"
  },

  ecommerce: {
    mustHave: ["hero", "features", "cta"],
    optional: ["portfolio_grid", "testimonials", "urgency_bar"],
    hero: "hero.default",
    cta: "cta.standard"
  },

  default: {
    mustHave: ["hero", "features", "cta", "contact"],
    optional: ["testimonials", "about"],
    hero: "hero.default",
    cta: "cta.standard"
  }
};

/**
 * 🧠 BLUEPRINT GENERATOR
 * Converts a seed → structured website plan
 */
export async function generateBlueprint(seed) {
  // 1. classify business type (rules + AI hybrid)
  const classification = await classifyBusiness(seed);

  const type = classification.type;
  const rule = RULES[type] || RULES.default;

  // 2. build ordered module layout
  const layout = [
    ...rule.mustHave.filter(m => modules[m]),
    ...rule.optional.filter(m => modules[m])
  ];

  // 3. return structured blueprint
  return {
    seed,
    type,
    confidence: classification.confidence,
    source: classification.source,

    layout,

    variants: {
      hero: rule.hero,
      cta: rule.cta
    }
  };
}