import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// -----------------------------
// TAXONOMY CATEGORIES (SOURCE OF TRUTH)
// Must stay in sync with lib/taxonomy.js
// -----------------------------
const TAXONOMY_CATEGORIES = [
  "hair_beauty",
  "construction_trades",
  "health_medical",
  "legal_services",
  "finance_accounting",
  "hospitality",
  "fitness_wellness",
  "education_training",
  "real_estate",
  "agencies_marketing",
  "retail_ecommerce",
  "automotive",
  "home_services"
];

// -----------------------------
// NORMALISER (SAFETY LAYER)
// Role: validates that a category string returned by briefEngine
// maps to a known taxonomy category.
// If not recognised → safe fallback to home_services.
// This is the ONLY role classifier.js plays in the new pipeline.
// -----------------------------
export function normalise(category = "") {
  const clean = category.toLowerCase().trim();

  // Direct match
  if (TAXONOMY_CATEGORIES.includes(clean)) return clean;

  // Legacy type mappings — handles anything the old classifier
  // or AI might return that predates the unified taxonomy
  const legacyMap = {
    // old classifier types
    builder:              "construction_trades",
    florist:              "retail_ecommerce",
    agency:               "agencies_marketing",
    dentist:              "health_medical",
    ecommerce:            "retail_ecommerce",
    local_service:        "home_services",
    professional_service: "legal_services",

    // common AI variations
    beauty:               "hair_beauty",
    salon:                "hair_beauty",
    medical:              "health_medical",
    legal:                "legal_services",
    law:                  "legal_services",
    finance:              "finance_accounting",
    accounting:           "finance_accounting",
    restaurant:           "hospitality",
    cafe:                 "hospitality",
    food:                 "hospitality",
    gym:                  "fitness_wellness",
    fitness:              "fitness_wellness",
    wellness:             "fitness_wellness",
    education:            "education_training",
    training:             "education_training",
    property:             "real_estate",
    marketing:            "agencies_marketing",
    creative:             "agencies_marketing",
    retail:               "retail_ecommerce",
    shop:                 "retail_ecommerce",
    store:                "retail_ecommerce",
    car:                  "automotive",
    auto:                 "automotive",
    mechanic:             "automotive",
    trades:               "construction_trades",
    plumbing:             "construction_trades",
    electrical:           "construction_trades"
  };

  if (legacyMap[clean]) return legacyMap[clean];

  // Safe fallback — never returns an invalid category
  return "home_services";
}

// -----------------------------
// FAST RULE MATCH
// Kept for reference and potential future use
// but no longer called in the main pipeline.
// briefEngine handles classification via single AI call.
// -----------------------------
function ruleMatch(seed) {
  const s = seed.toLowerCase();

  if (s.includes("builder") || s.includes("construction") || s.includes("trades")) return "construction_trades";
  if (s.includes("florist") || s.includes("flowers"))                               return "retail_ecommerce";
  if (s.includes("salon") || s.includes("hair") || s.includes("barber"))            return "hair_beauty";
  if (s.includes("agency") || s.includes("marketing"))                              return "agencies_marketing";
  if (s.includes("dentist") || s.includes("dental") || s.includes("doctor"))        return "health_medical";
  if (s.includes("gym") || s.includes("fitness") || s.includes("yoga"))             return "fitness_wellness";
  if (s.includes("law") || s.includes("legal") || s.includes("solicitor"))          return "legal_services";
  if (s.includes("account") || s.includes("finance") || s.includes("tax"))          return "finance_accounting";
  if (s.includes("restaurant") || s.includes("cafe") || s.includes("food"))         return "hospitality";
  if (s.includes("school") || s.includes("tutor") || s.includes("training"))        return "education_training";
  if (s.includes("real estate") || s.includes("property"))                          return "real_estate";
  if (s.includes("shop") || s.includes("store") || s.includes("retail"))            return "retail_ecommerce";
  if (s.includes("car") || s.includes("auto") || s.includes("mechanic"))            return "automotive";

  return null;
}

// -----------------------------
// AI CLASSIFIER (SEMANTIC FALLBACK)
// Only called if briefEngine needs a standalone
// classification check outside the main pipeline.
// -----------------------------
async function aiClassify(seed) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 100,
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `You are a business classification engine.

Classify the input into ONE of these exact values ONLY:
hair_beauty | construction_trades | health_medical | legal_services |
finance_accounting | hospitality | fitness_wellness | education_training |
real_estate | agencies_marketing | retail_ecommerce | automotive | home_services

Return JSON only — no markdown, no explanation:
{ "type": "...", "confidence": 0.0-1.0 }`
        },
        {
          role: "user",
          content: seed
        }
      ]
    });

    const text = response.choices[0].message.content;
    const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
    return {
      type: normalise(parsed.type),
      confidence: parsed.confidence || 0.6
    };

  } catch (err) {
    console.error("AI classification failed:", err);
    return null;
  }
}

// -----------------------------
// MAIN HYBRID CLASSIFIER
// Not called in the primary pipeline — briefEngine handles
// classification as part of brief extraction.
// Available as a standalone utility if needed elsewhere.
// -----------------------------
export async function classifyBusiness(seed) {
  // 1. RULE MATCH (fast path)
  const rule = ruleMatch(seed);
  if (rule) {
    return {
      type: rule,
      source: "rules",
      confidence: 1
    };
  }

  // 2. AI FALLBACK
  const ai = await aiClassify(seed);
  if (ai?.type) {
    return {
      type: ai.type,
      source: "ai",
      confidence: ai.confidence
    };
  }

  // 3. FINAL FALLBACK (never fails)
  return {
    type: "home_services",
    source: "fallback",
    confidence: 0.3
  };
}
