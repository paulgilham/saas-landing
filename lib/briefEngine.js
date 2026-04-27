import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// -----------------------------
// VALID TAXONOMY CATEGORIES
// Inline safety check — no separate normaliser needed.
// -----------------------------
const VALID_CATEGORIES = [
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

function safeCategory(cat = "") {
  const clean = cat.toLowerCase().trim();
  return VALID_CATEGORIES.includes(clean) ? clean : "home_services";
}

// -----------------------------
// TIER COMPUTATION
// Deterministic — no arbitrary weights.
// Category drives base tier, traits can push up.
// -----------------------------
const COMPLEX_CATEGORIES = [
  "legal_services",
  "health_medical",
  "education_training",
  "finance_accounting"
];

function computeTier(category, traits = []) {
  if (COMPLEX_CATEGORIES.includes(category)) return "advanced";

  if (
    traits.includes("information_heavy") ||
    traits.includes("uncertainty_reduction")
  ) return "advanced";

  return "medium";
}

// -----------------------------
// TONE MAP
// Auto-detected from category.
// User overrides via modifier dials in Step 10.
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
// Returns full business brief including computed tier.
// -----------------------------
export async function extractBrief(prompt = "") {
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
- location: extract suburb, city or region if mentioned, otherwise empty string
- category: classify into ONE of these exact values ONLY:
  hair_beauty | construction_trades | health_medical | legal_services |
  finance_accounting | hospitality | fitness_wellness | education_training |
  real_estate | agencies_marketing | retail_ecommerce | automotive | home_services
- services: array of 3-5 specific services this business likely offers
- tone: describe in 3-5 words matching the business personality
- tagline: one punchy benefit-led sentence max 12 words, specific to this business
- audience: who this business primarily serves in one sentence
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
  // PARSE
  // -------------------------
  let brief;
  try {
    brief = JSON.parse(raw.replace(/```json|```/g, "").trim());
  } catch (err) {
    console.error("Brief parse failed:", raw);
    return buildFallbackBrief(prompt);
  }

  // -------------------------
  // VALIDATE + ENRICH
  // -------------------------
  brief.category = safeCategory(brief.category);

  if (!brief.tone || brief.tone.split(",").length < 2) {
    brief.tone = CATEGORY_TONE[brief.category] || "professional, friendly";
  }

  const tier = computeTier(brief.category, brief.traits || []);

  return {
    ...brief,
    prompt,
    tier
  };
}

// -----------------------------
// FALLBACK BRIEF
// Never fails — safe defaults if AI call errors.
// -----------------------------
function buildFallbackBrief(prompt = "") {
  const businessName = prompt
    .trim()
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return {
    businessName,
    location:  "",
    category:  "home_services",
    services:  ["Professional services", "Consultation", "Support"],
    tone:      CATEGORY_TONE.home_services,
    tagline:   "Professional service you can trust",
    audience:  "Local customers",
    traits:    ["service_based", "trust_signal"],
    prompt,
    tier:      "medium"
  };
}
