// -----------------------------
// UI INTENSITY ENGINE
// Maps business traits → Tailwind spacing/emphasis classes.
// Used by ModuleWrapper to apply layout density per section.
// -----------------------------

export function getUIIntensity(traits = [], tier = "medium") {
  // -------------------------
  // DEFAULTS PER TIER
  // -------------------------
  const defaults = {
    simple: {
      section:   "py-16 px-6",
      container: "max-w-4xl mx-auto",
      heading:   "text-3xl font-bold",
      body:      "text-base",
      gap:       "gap-6"
    },
    medium: {
      section:   "py-20 px-6",
      container: "max-w-5xl mx-auto",
      heading:   "text-3xl md:text-4xl font-bold",
      body:      "text-base md:text-lg",
      gap:       "gap-6 md:gap-8"
    },
    advanced: {
      section:   "py-24 px-6",
      container: "max-w-6xl mx-auto",
      heading:   "text-4xl md:text-5xl font-bold",
      body:      "text-lg",
      gap:       "gap-8 md:gap-10"
    }
  };

  const base = defaults[tier] || defaults.medium;

  // -------------------------
  // TRAIT OVERRIDES
  // -------------------------

  // Visual heavy — more breathing room, wider container
  if (traits.includes("visual_heavy") || traits.includes("portfolio_based")) {
    base.section    = base.section.replace("py-20", "py-24").replace("py-16", "py-20");
    base.container  = base.container.replace("max-w-5xl", "max-w-6xl").replace("max-w-4xl", "max-w-5xl");
  }

  // Trust critical — tighter, more serious layout
  if (traits.includes("trust_critical")) {
    base.heading = base.heading + " tracking-tight";
  }

  // Conversion focused — tighter spacing, emphasis on action
  if (traits.includes("conversion_focused") || traits.includes("commercial_intent")) {
    base.section = base.section.replace("py-24", "py-20").replace("py-20", "py-16");
  }

  return base;
}
