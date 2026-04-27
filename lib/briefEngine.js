import OpenAI from "openai";
import { normalise } from "./classifier";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// -----------------------------
// COMPLEXITY SCORING
// Drives single page vs multipage decision in Step 8.
// Called after brief is extracted.
// -----------------------------
const CATEGORY_WEIGHT = {
  hair_beauty:          1,
  hospitality:          1,
  fitness_wellness:     1,
  retail_ecommerce:     2,
  automotive:           2,
  home_services:        2,
  construction_trades:  2,
  real_estate:          2,
  agencies_marketing:   2,
  education_training:   3,
  health_medical:       3,
  finance_accounting:   3,
  legal_services:       3
};

const TRAIT_WEIGHTS = {
  information_heavy:     2,
  uncertainty_reduction: 2,
  trust_critical:        1,
  trust_signal:          1,
  time_based_service:    1,
  appointment_based:     1,
  commercial_intent:     1,
  visual_heavy:          0,
  conversion_focused:   -1  // lean and fast, keeps structure simple
};

function computeComplexityScore(category, traits = [], promptWordCount = 0) {
  const categoryScore = CATEGORY_WEIGHT[category] || 2;

  const traitScore = traits.reduce((sum, trait) => {
    return sum + (TRAIT_WEIGHTS[trait] || 0);
  }, 0);

  const promptScore =
    promptWordCount < 5  ? 0 :
    promptWordCount < 15 ? 1 : 2;

  return categoryScore + traitScore + promptScore;
}

function scoreTotier(score) {
  if (score <= 3) return "simple";
  if (score <= 6) return "medium";
  return "advanced";
}

// -----------------------------
// PAGE SUGGESTION
// Based on tier + category — hints at multipage structure.
// blueprintEngine reads this in Step 8.
// -----------------------------
function suggestPages(tier, category) {
  if (tier === "simple") {
    return ["home"];
  }

  if (tier === "medium") {
    return ["home"];
  }

  // advanced — multipage candidates by category
  const multiPageCategories = {
    legal_services:    ["home", "services", "about", "faq", "contact"],
    health_medical:    ["home", "services", "about", "faq", "contact"],
    education_training:["home", "services", "about", "faq", "contact"],
    finance_accounting:["home", "services", "about", "contact"],
    construction_trades:["home", "services", "about", "gallery", "contact"],
    agencies_marketing:["home", "services", "about", "contact"],
    real_estate:       ["home", "services", "about", "contact"],
    fitness_wellness:  ["home", "services", "pricing", "contact"]
  };

  return multiPageCategories[category] || ["home", "about", "contact"];
}

// -----------------------------
// TONE MAP
// Auto-detected from category for max "wow" result.
// User can override via modifier dials in Step 10.
// -----------------------------
const CATEGORY_TONE = {
  hair_beauty:          "warm, welcoming, personal",
  construction_trades:  "strong, reliable, direct",
  health_medical:       "reassuring, professional, caring",
  legal_services:       "authoritative, precise, calm",
  finance_accounting:   "trustworthy, clear, professional",
  hospitality:          "inviting, vibrant, sensory",
  fitness_wellness:     "energetic, motivational, empowering",
  education_training:   "encouraging, expert, accessible",
  real_estate:          "aspirational, trustworthy, clear",
  agencies_marketing:   "creative, bold, results-driven",
  retail_ecommerce:     "friendly, clear, benefit-led",
  automotive:           "confident, expert, straightforward",
  home_services:        "friendly, dependable, local"
};

// -----------------------------
// MAIN BRIEF ENGINE
// Single rich AI call — extracts everything simultaneously.
// classifier.normalise() validates category after extraction.
// -----------------------------
export async function extractBrief(prompt = "") {
  const promptWordCount = prompt.trim().split(/\s+/).length;

  let raw;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: 600,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a business intelligence engine.

Given a business description, extract structured information.

RULES:
- Return ONLY valid JSON — no markdown, no explanation
- businessName: capitalise properly, keep location if present
- location: extract suburb/city/region if mentioned, otherwise ""
- category: classify into ONE of these exact values:
  hair_beauty | construction_trades | health_medical | legal_services |
  finance_accounting | hospitality | fitness_wellness | education_training |
  real_estate | agencies_marketing | retail_ecommerce | automotive | home_services
- services: array of 3-5 specific services this business likely offers
- tone: describe in 3-5 words matching the business personality
- tagline: one punchy benefit-led sentence (max 12 words), specific to this business
- audience: who this business primarily serves (1 sentence)
- traits: array of applicable traits from this list ONLY:
  time_based_service | appointment_based | visual_heavy | trust_critical |
  trust_signal | commercial_intent | uncertainty_reduction | conversion_focused |
  information_heavy | portfolio_based | service_based | data_heavy

Return this exact shape:
{
  "businessName": "string",
  "location": "string",
  "category": "string",
  "services": ["string"],
  "tone": "string",
  "tagline": "string",
  "audience": "string",
  "traits": ["string"]
}`
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    raw = response.choices?.[0]?.message?.content ?? "{}";

  } catch (err) {
    console.error("Brief extraction failed:", err);
    return buildFallbackBrief(prompt);
  }

  // -------------------------
  // PARSE + VALIDATE
  // -------------------------
  let brief;
  try {
    brief = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch (err) {
    console.error("Brief parse failed:", raw);
    return buildFallbackBrief(prompt);
  }

  // -------------------------
  // NORMALISE CATEGORY
  // classifier.normalise() ensures category maps to known taxonomy.
  // This is the only role classifier.js plays now.
  // -------------------------
  brief.category = normalise(brief.category || "home_services");

  // -------------------------
  // AUTO TONE OVERRIDE
  // If AI tone is too generic, use category default.
  // -------------------------
  if (!brief.tone || brief.tone.split(",").length < 2) {
    brief.tone = CATEGORY_TONE[brief.category] || "professional, friendly";
  }

  // -------------------------
  // COMPLEXITY SCORING
  // Drives tier + multipage decision.
  // -------------------------
  const complexityScore = computeComplexityScore(
    brief.category,
    brief.traits || [],
    promptWordCount
  );

  const tier = scoreTotier(complexityScore);
  const suggestedPages = suggestPages(tier, brief.category);

  return {
    ...brief,
    prompt,
    complexityScore,
    tier,
    suggestedPages
  };
}

// -----------------------------
// FALLBACK BRIEF
// Never fails — returns safe defaults if AI call fails.
// -----------------------------
function buildFallbackBrief(prompt = "") {
  const words = prompt.trim().split(/\s+/);
  const businessName = words
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    businessName,
    location: "",
    category:  "home_services",
    services:  ["Professional services", "Consultation", "Support"],
    tone:      CATEGORY_TONE.home_services,
    tagline:   "Professional service you can trust",
    audience:  "Local customers",
    traits:    ["service_based", "trust_signal"],
    prompt,
    complexityScore: 3,
    tier:      "medium",
    suggestedPages: ["home"]
  };
}
