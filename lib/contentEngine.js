import { validateModule } from "./validateModule";
import { moduleContracts } from "./moduleContracts";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ------------------------------------
// MAIN GENERATOR
// ------------------------------------
export async function generateModuleContent({
  module,
  category,
  tier,
  prompt,
  traits = []
}) {
  const systemPrompt = buildPrompt(module, category, tier, traits);
  let attempt = 0;

  while (attempt < 2) {
    attempt++;

    let raw;
    try {
      raw = await callAI(systemPrompt, prompt);
    } catch (e) {
      continue;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch (e) {
      continue;
    }

    const valid = validateModule(module, parsed);
    if (valid) {
      return { module, data: valid };
    }
  }

  return { module, data: {} };
}

// ------------------------------------
// SYSTEM PROMPT
// Injects schema + category + traits so AI generates
// contextually appropriate content, not generic copy.
// ------------------------------------
function buildPrompt(module, category, tier, traits = []) {
  const contract = moduleContracts[module];
  const schemaString = contract
    ? JSON.stringify(contract, null, 2)
    : "No schema found — return an empty object {}";

  const traitContext = traits.length > 0
    ? `Business traits: ${traits.join(", ")}`
    : "";

  const tierContext = {
    simple:   "Keep copy concise and direct. 1-2 sentences max per field.",
    medium:   "Write clear, professional copy. 2-3 sentences per field.",
    advanced: "Write rich, detailed copy. Include specific benefits and social proof language."
  }[tier] || "Write clear, professional copy.";

  return `You are a STRICT JSON generator for website content.

RULES:
- Output ONLY valid JSON
- NO HTML, NO markdown, NO extra keys
- MUST match the schema shape exactly
- Required fields must always be present and non-empty strings
- Arrays must always contain at least 2 items
- Write copy specific to the business described — never generic placeholder text

BUSINESS CONTEXT:
- Category: ${category || "general business"}
- ${traitContext}

COPY GUIDELINES:
- ${tierContext}
- Tone should match the business category
- If trust_critical or trust_signal trait present: emphasise credibility, experience, credentials
- If visual_heavy or portfolio_based: reference quality of work, craftsmanship, results
- If appointment_based or time_based_service: include availability, ease of booking language
- If commercial_intent or conversion_focused: use action-oriented, benefit-led language

MODULE: ${module}

EXACT SCHEMA TO FOLLOW:
${schemaString}`;
}

// ------------------------------------
// AI CALL
// ------------------------------------
async function callAI(systemPrompt, userPrompt) {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    max_tokens: 1000,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  });

  return response.choices?.[0]?.message?.content ?? "{}";
}
