import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * FAST RULES (deterministic layer)
 */
function ruleMatch(seed) {
  const s = seed.toLowerCase();

  if (s.includes("builder") || s.includes("construction")) return "builder";
  if (s.includes("florist") || s.includes("flowers")) return "florist";
  if (s.includes("agency") || s.includes("marketing")) return "agency";
  if (s.includes("dentist") || s.includes("dental")) return "dentist";
  if (s.includes("shop") || s.includes("store")) return "ecommerce";

  return null;
}

/**
 * AI CLASSIFIER (semantic fallback)
 */
async function aiClassify(seed) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a business classification engine.

Classify the input into ONE of these types ONLY:
- builder
- florist
- agency
- dentist
- ecommerce
- local_service
- professional_service

Return JSON only:
{ "type": "...", "confidence": 0-1 }
          `.trim()
        },
        {
          role: "user",
          content: seed
        }
      ],
      temperature: 0
    });

    const text = response.choices[0].message.content;
    return JSON.parse(text);

  } catch (err) {
    console.error("AI classification failed:", err);
    return null;
  }
}

/**
 * NORMALISER (safety layer)
 */
function normalise(type) {
  const allowed = [
    "builder",
    "florist",
    "agency",
    "dentist",
    "ecommerce",
    "local_service",
    "professional_service"
  ];

  if (allowed.includes(type)) return type;

  return "local_service"; // safe fallback
}

/**
 * MAIN HYBRID CLASSIFIER
 */
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
      type: normalise(ai.type),
      source: "ai",
      confidence: ai.confidence || 0.6
    };
  }

  // 3. FINAL FALLBACK (never fails)
  return {
    type: "local_service",
    source: "fallback",
    confidence: 0.3
  };
}