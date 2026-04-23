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

// HARD VALIDATION (FAIL SAFE)
export function validateContent(module, data = {}) {
  const schema = CONTENT_SCHEMA[module];

  if (!schema) return data;

  for (const field of schema.required) {
    if (!data[field]) {
      data[field] = "";
    }
  }

  return data;
}