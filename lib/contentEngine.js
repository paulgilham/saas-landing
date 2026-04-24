import { validateModule } from "./validateModule";

// ------------------------------------
// MAIN GENERATOR
// ------------------------------------
export async function generateModuleContent({
  module,
  category,
  tier,
  prompt
}) {
  const systemPrompt = buildPrompt(module, category, tier);

  let attempt = 0;

  while (attempt < 2) {
    attempt++;

    const raw = await fakeAI(systemPrompt + "\n\n" + prompt);

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      continue;
    }

    const valid = validateModule(module, parsed);

    if (valid) {
      return {
        module,
        data: valid
      };
    }
  }

  // fallback safe object
  return {
    module,
    data: {}
  };
}

// ------------------------------------
// SYSTEM PROMPT (STRICT LOCK)
// ------------------------------------
function buildPrompt(module, category, tier) {
  return `
You are a STRICT JSON generator.

RULES:
- Output ONLY valid JSON
- NO HTML
- NO markdown
- NO extra keys
- MUST match schema exactly

Module: ${module}
Category: ${category}
Tier: ${tier}

If unsure, return empty strings and empty arrays only.
`;
}

// ------------------------------------
// MOCK AI (replace with OpenAI later)
// ------------------------------------
async function fakeAI(input) {
  return JSON.stringify({
    headline: "Brisbane Hair Studio",
    subtext: "Premium hair styling",
    cta: "Book Now"
  });
}