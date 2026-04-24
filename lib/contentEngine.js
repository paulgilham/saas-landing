import { moduleSchemas } from "./moduleSchemas";

// ------------------------------------
// MAIN ENTRY
// ------------------------------------
export async function generateModuleContent({
  module,
  category,
  modifiers = [],
  tier,
  prompt
}) {
  const systemPrompt = buildSystemPrompt(module, category, tier);

  let attempt = 0;
  let parsed = null;

  // 🔁 RETRY LOOP (CRITICAL STEP 5 FIX)
  while (attempt < 2) {
    attempt++;

    const raw = await fakeAI(systemPrompt + "\n\n" + prompt);

    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error("❌ Invalid JSON from AI:", raw);
      continue;
    }

    // 🧱 VALIDATE AGAINST SCHEMA
    const validated = validateAgainstSchema(module, parsed);

    if (validated) {
      return {
        module,
        data: validated
      };
    }

    console.warn(`⚠️ Schema mismatch for ${module}, retrying...`);
  }

  // 🧯 FINAL FALLBACK (NEVER CRASH UI)
  return {
    module,
    data: {}
  };
}

// ------------------------------------
// SCHEMA VALIDATION (STEP 5 CORE)
// ------------------------------------
function validateAgainstSchema(module, data) {
  const schema = moduleSchemas[module];
  if (!schema) return data;

  if (!data || typeof data !== "object") return null;

  for (const key in schema) {
    const type = schema[key];

    // ARRAY CHECK
    if (Array.isArray(type)) {
      if (!Array.isArray(data[key])) return null;

      // optional deep validation for array objects
      const itemSchema = type[0];
      if (itemSchema && typeof itemSchema === "object") {
        for (const item of data[key]) {
          for (const field in itemSchema) {
            if (typeof item[field] !== itemSchema[field]) {
              return null;
            }
          }
        }
      }

      continue;
    }

    // STRING CHECK
    if (type === "string" && typeof data[key] !== "string") {
      return null;
    }
  }

  return data;
}

// ------------------------------------
// SYSTEM PROMPT BUILDER
// ------------------------------------
function buildSystemPrompt(module, category, tier) {
  return `
You are a STRICT JSON generator.

RULES:
- Output ONLY valid JSON
- NO HTML
- NO markdown
- NO explanation
- MUST match schema exactly
- NO extra keys

Module: ${module}
Category: ${category}
Tier: ${tier}

SCHEMA MUST BE FOLLOWED EXACTLY.
If unsure, return empty strings and empty arrays only.
`;
}

// ------------------------------------
// MOCK AI (replace later with real API)
// ------------------------------------
async function fakeAI(input) {
  return JSON.stringify({
    headline: "Brisbane Expert Builders",
    subtext: "We build high quality homes",
    cta: "Get Quote"
  });
}