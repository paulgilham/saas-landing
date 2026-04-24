export const LAYOUT_RULES = {
  simple: {
    sectionSpacing: "py-20",
    containerWidth: "max-w-4xl",
    density: "loose"
  },

  medium: {
    sectionSpacing: "py-16",
    containerWidth: "max-w-5xl",
    density: "normal"
  },

  advanced: {
    sectionSpacing: "py-10",
    containerWidth: "max-w-6xl",
    density: "compact"
  }
};

// module importance system (visual hierarchy)
export const MODULE_PRIORITY = {
  hero: 3,
  cta: 3,
  services: 2,
  features: 2,
  testimonials: 2,
  contact: 1
};