export const MODULE_VARIANTS = {
  hero: {
    v1: "clarity",
    v2: "emotional",
    v3: "conversion"
  },

  services: {
    v1: "simple_list",
    v2: "grouped",
    v3: "feature_rich"
  },

  testimonials: {
    v1: "basic_quotes",
    v2: "story_based"
  }
};

// SIMPLE SELECTOR (DETERMINISTIC RULES)
export function selectVariant(module, context = {}) {
  const { modifier = [], tier = "medium" } = context;

  if (module === "hero") {
    if (modifier.includes("trust_heavy")) return "v2";
    if (tier === "advanced") return "v3";
    return "v1";
  }

  if (module === "services") {
    if (tier === "advanced") return "v3";
    return "v1";
  }

  return "v1";
}