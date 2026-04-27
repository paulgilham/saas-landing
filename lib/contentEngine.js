import { validateModule } from "./validateModule";
import { moduleContracts } from "./moduleContracts";
import { normalizeContent } from "./normalizeContent";
import { stripHtmlDeep } from "./sanitizeContent";
import { applyModuleDefaults } from "./applyModuleDefaults";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// ------------------------------------
// MAIN GENERATOR
// Accepts full business brief — generates coherent,
// business-specific content for every module.
// ------------------------------------
export async function generateModuleContent({
  module,
  brief,
  tier
}) {
  const systemPrompt = buildPrompt(module, brief, tier);
  const userPrompt   = buildUserPrompt(brief);

  let attempt = 0;

  while (attempt < 2) {
    attempt++;

    let raw;
    try {
      raw = await callAI(systemPrompt, userPrompt);
    } catch (e) {
      console.error(`AI call failed for module ${module}:`, e);
      continue;
    }

    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch (e) {
      console.error(`JSON parse failed for module ${module}:`, raw);
      continue;
    }

    // -------------------------
    // PIPELINE: sanitize → normalize → validate → defaults
    // normalizeContent and sanitizeContent were built but
    // never called before — now wired in.
    // -------------------------
    const sanitized  = stripHtmlDeep(parsed);
    const normalized = normalizeContent(module, sanitized);
    const valid      = validateModule(module, normalized);

    if (valid) {
      const withDefaults = applyModuleDefaults(module, valid);
      return { module, data: withDefaults };
    }
  }

  // Safe empty fallback — never crashes the page
  return {
    module,
    data: applyModuleDefaults(module, {})
  };
}

// ------------------------------------
// SYSTEM PROMPT
// Injects full business brief — every module gets
// complete context about the specific business.
// ------------------------------------
function buildPrompt(module, brief, tier) {
  const contract = moduleContracts[module];
  const schemaString = contract
    ? JSON.stringify(contract, null, 2)
    : "No schema found — return an empty object {}";

  const tierGuidance = {
    simple:   "Keep copy concise. 1 sentence max per field. Direct and punchy.",
    medium:   "Write clear professional copy. 2-3 sentences per field. Benefit-focused.",
    advanced: "Write rich detailed copy. 3-4 sentences per field. Include specific outcomes, social proof language, and local references where relevant."
  }[tier] || "Write clear professional copy.";

  const traitGuidance = buildTraitGuidance(brief.traits || []);

  return `You are writing copy for the "${module}" section of a website for a specific business.

CRITICAL RULES:
- Output ONLY valid JSON
- NO HTML, NO markdown, NO extra keys
- MUST match the schema shape exactly
- Required fields must be present and non-empty
- Arrays must have at least 2 items
- Write copy SPECIFIC to this exact business — never generic placeholder text
- Use the business name, location, and services naturally where appropriate
- Never use the word "our" unless it's in a direct quote context

BUSINESS BRIEF:
- Business Name: ${brief.businessName}
- Location: ${brief.location || "local area"}
- Category: ${brief.category}
- Services: ${(brief.services || []).join(", ")}
- Tone: ${brief.tone}
- Tagline: ${brief.tagline}
- Audience: ${brief.audience}

COPY GUIDELINES:
- Tone: ${brief.tone}
- Length: ${tierGuidance}
${traitGuidance}

EXACT SCHEMA TO FOLLOW:
${schemaString}`;
}

// ------------------------------------
// USER PROMPT
// The specific ask — anchored to brief context.
// ------------------------------------
function buildUserPrompt(brief) {
  return `Write the content for this module.

Business: ${brief.businessName}
${brief.location ? `Location: ${brief.location}` : ""}
Original prompt: "${brief.prompt}"

Use the tagline "${brief.tagline}" as inspiration for headline language.
Make every word feel like it was written specifically for ${brief.businessName}.`;
}

// ------------------------------------
// TRAIT GUIDANCE BUILDER
// Injects specific copy direction based on detected traits.
// ------------------------------------
function buildTraitGuidance(traits = []) {
  const lines = [];

  if (traits.includes("trust_critical") || traits.includes("trust_signal")) {
    lines.push("- Emphasise credibility, experience, certifications and track record");
  }

  if (traits.includes("visual_heavy") || traits.includes("portfolio_based")) {
    lines.push("- Reference the quality and results of work, craftsmanship, visual outcomes");
  }

  if (traits.includes("appointment_based") || traits.includes("time_based_service")) {
    lines.push("- Include language about ease of booking, availability, flexible scheduling");
  }

  if (traits.includes("commercial_intent") || traits.includes("conversion_focused")) {
    lines.push("- Use action-oriented, benefit-led language with clear calls to action");
  }

  if (traits.includes("uncertainty_reduction") || traits.includes("information_heavy")) {
    lines.push("- Reassure and educate — address common questions and concerns proactively");
  }

  if (traits.includes("data_heavy")) {
    lines.push("- Include specific numbers, percentages, timeframes where natural");
  }

  return lines.join("\n");
}

// ------------------------------------
// AI CALL
// ------------------------------------
async function callAI(systemPrompt, userPrompt) {
  const response = await openai.chat.completions.create({
    model:      "gpt-4o",
    max_tokens: 1000,
    temperature: 0.4,
    messages: [
      { role: "system",  content: systemPrompt },
      { role: "user",    content: userPrompt   }
    ]
  });

  return response.choices?.[0]?.message?.content ?? "{}";
}
