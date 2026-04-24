import { selectVariant } from "./moduleVariants.js";
import { stripHtmlDeep } from "./sanitizeContent.js";

export async function generateModuleContent({
  module,
  category,
  modifiers = [],
  tier,
  prompt
}) {
  const variant = selectVariant(module, {
    modifier: modifiers,
    tier
  });

  const systemPrompt = `
You are a STRICT structured content generator.

ABSOLUTE RULES:
- Output ONLY valid JSON
- NO HTML
- NO styling
- NO markdown
- NO layout instructions
- NO text outside JSON

You are filling a module data object.

Module: ${module}
Variant: ${variant}
Category: ${category}
Tier: ${tier}

OUTPUT FORMAT RULES:

hero:
{
  "headline": "",
  "subtext": "",
  "cta": ""
}

services:
{
  "title": "",
  "items": [
    { "title": "", "description": "" }
  ]
}

testimonials:
{
  "title": "",
  "items": [
    { "quote": "", "author": "" }
  ]
}

cta:
{
  "headline": "",
  "buttonText": ""
}

If unsure, return empty values.
`;

  const raw = await fakeAI(systemPrompt + "\n\n" + prompt);

  let parsed;

  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error("❌ INVALID JSON FROM AI:", raw);
    parsed = null;
  }

  // 🔥 HARD VALIDATION (CRITICAL)
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      variant,
      data: {}
    };
  }

  // 🔥 STRIP ANY HTML JUST IN CASE
  parsed = stripHtmlDeep(parsed);

  // 🔥 FINAL SAFETY: remove any leftover HTML-like strings
  for (const key in parsed) {
    if (typeof parsed[key] === "string" && parsed[key].includes("<")) {
      parsed[key] = "";
    }
  }

  return {
    variant,
    data: parsed
  };
}

// ------------------------------------
// MOCK AI (REPLACE WITH REAL AI CALL)
// ------------------------------------
async function fakeAI(input) {
  return JSON.stringify({
    headline: "Brisbane's Premier Hairdresser",
    subtext: "Transform your look with expert stylists",
    cta: "Book Now"
  });
}