import { resolveBusinessCategory } from "./taxonomy";

// -----------------------------
// MODULE ELIGIBILITY ENGINE
// -----------------------------
export function isModuleAllowed(module, context) {
  const {
    prompt = "",
    tier = "medium",
    modifiers = []
  } = context;

  const type = resolveBusinessCategory(prompt);
  const text = prompt.toLowerCase();

  switch (module) {
    case "pricing":
      return (
        tier === "advanced" ||
        text.includes("price") ||
        text.includes("cost") ||
        text.includes("package") ||
        modifiers.includes("pricing_heavy")
      );

    case "booking":
      return (
        text.includes("book") ||
        text.includes("appointment") ||
        text.includes("schedule") ||
        modifiers.includes("booking_enabled")
      );

    case "faq":
      return (
        tier !== "simple" &&
        (text.includes("faq") ||
          text.includes("questions") ||
          text.includes("how") ||
          modifiers.includes("trust_heavy"))
      );

    case "gallery":
      return (
        tier === "advanced" ||
        modifiers.includes("visual_heavy") ||
        text.includes("portfolio")
      );

    case "about":
      return tier !== "simple";

    // -------------------------
    // BUSINESS-AWARE MODULES
    // -------------------------
    case "services":
      return true;

    case "testimonials":
      return true;

    case "contact":
      return true;

    case "hero":
      return true;

    case "cta":
      return true;

    default:
      return true;
  }
}