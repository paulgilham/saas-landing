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

RULES:
- Output ONLY valid JSON
- NO HTML
- NO styling
- NO markdown
- NO layout instructions

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
  "items": ["", "", ""]
}

testimonials:
{
  "title": "",
  "items": ["", "", ""]
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
    parsed = {};
  }

  // HARD SAFETY LAYER
  parsed = stripHtmlDeep(parsed);

  return {
    variant,
    data: parsed
  };
}

// MOCK
async function fakeAI(input) {
  return JSON.stringify({
    headline: "Brisbane's Premier Hairdresser",
    subtext: "Transform your look with expert stylists",
    cta: "Book Now"
  });
}