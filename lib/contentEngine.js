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
  prompt
}) {
  const systemPrompt = buildPrompt(module, category, tier);
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

  // fallback safe object
  return { module, data: {} };
}

// ------------------------------------
// SYSTEM PROMPT — INJECTS EXACT SCHEMA
// ------------------------------------
function buildPrompt(module, category, tier) {
  const contract = moduleContracts[module];
  const schemaString = contract
    ? JSON.stringify(contract, null, 2)
    : "No schema found — return an empty object {}";

  return `You are a STRICT JSON generator for website content.

RULES:
- Output ONLY valid JSON
- NO HTML
- NO markdown
- NO extra keys beyond what the schema defines
- MUST match the schema shape exactly
- Required fields must always be present and non-empty strings
- Arrays must always contain at least 2 items

Module: ${module}
Category: ${category}
Tier: ${tier}

EXACT SCHEMA TO FOLLOW:
${schemaString}

Generate real, compelling website copy that fits the business described in the user prompt.
If unsure, return empty strings and empty arrays only.`;
}

// ------------------------------------
// REAL AI CALL (OpenAI)
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
