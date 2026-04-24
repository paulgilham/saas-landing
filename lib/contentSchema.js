export const CONTENT_SCHEMA = {
  hero: {
    required: ["headline", "subtext", "cta"],
  },
  services: {
    required: ["title", "items"],
  },
  testimonials: {
    required: ["title", "items"],
  },
  cta: {
    required: ["headline", "buttonText"],
  }
};

// 🧯 MINIMAL FALLBACK ONLY (NOT VALIDATION LOGIC)
export function applyFallbacks(module, data = {}) {
  const schema = CONTENT_SCHEMA[module];

  if (!schema) return data;

  const safe = { ...data };

  for (const field of schema.required) {
    if (safe[field] === undefined || safe[field] === null) {
      safe[field] = field === "items" ? [] : "";
    }
  }

  return safe;
}