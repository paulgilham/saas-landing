import { selectVariant } from "./moduleVariants.js";

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
You are generating website module content.

Rules:
- Module: ${module}
- Variant: ${variant}
- Business category: ${category}
- NO JSON OUTPUT
- NO STRUCTURE CHANGES
- ONLY TEXT CONTENT

Tone rules:
- hair_beauty → friendly, personal
- construction_trades → authoritative, trust-based
- legal_services → formal, precise

Output ONLY module content.
`;

  // Replace with your AI call
  const result = await fakeAI(systemPrompt + "\n\n" + prompt);

  return {
    variant,
    content: result
  };
}

// MOCK (replace with OpenAI / Vercel AI SDK)
async function fakeAI(input) {
  return "Generated module content based on controlled system.";
}