import { classifyBusiness } from "./classifier";
import { modules } from "./modules";

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

  default: {
    mustHave: ["hero", "features", "cta", "contact"],
    optional: ["testimonials", "about"],
    hero: "hero.default",
    cta: "cta.standard"
  }
};

export async function generateBlueprint(seed) {
  const classification = await classifyBusiness(seed);

  const type = classification.type;
  const rule = RULES[type] || RULES.default;

  const layout = [
    ...rule.mustHave.filter(m => modules[m]),
    ...rule.optional.filter(m => modules[m])
  ];

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