export function applyFallbacks(module, data = {}) {
  if (!data || typeof data !== "object") return {};

  const safe = { ...data };

  if (module === "hero") {
    return {
      headline: safe.headline || "",
      subtext: safe.subtext || "",
      cta: safe.cta || ""
    };
  }

  if (module === "services") {
    return {
      title: safe.title || "",
      items: Array.isArray(safe.items) ? safe.items : []
    };
  }

  if (module === "testimonials") {
    return {
      title: safe.title || "",
      items: Array.isArray(safe.items) ? safe.items : []
    };
  }

  if (module === "cta") {
    return {
      headline: safe.headline || "",
      buttonText: safe.buttonText || ""
    };
  }

  return safe;
}