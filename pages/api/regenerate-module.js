import { kv } from "@vercel/kv";
import OpenAI from "openai";
import { moduleContracts } from "../../lib/moduleContracts";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// -----------------------------
// SAFE JSON PARSER
// -----------------------------
function safeParse(text) {
  try {
    return JSON.parse(
      text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim()
    );
  } catch (e) {
    console.error("Parse error:", text);
    return null;
  }
}

// -----------------------------
// STRICT CONTRACT VALIDATION
// -----------------------------
function validateAgainstContract(data, contract) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return null;
  }

  const required = contract?.required || [];

  for (const key of required) {
    if (
      data[key] === undefined ||
      data[key] === null ||
      data[key] === ""
    ) {
      return null;
    }
  }

  return data;
}

// -----------------------------
// MODULE REGENERATION API
// -----------------------------
export default async function handler(req, res) {
  try {
    const { slug, moduleName, instruction, suggestOnly } = req.body;

    if (!slug || !moduleName) {
      return res.status(400).json({
        error: "slug and moduleName are required"
      });
    }

    // -------------------------
    // 1. GET SITE POINTER
    // -------------------------
    const pointer = await kv.get(`slug:${slug}`);

    if (!pointer) {
      return res.status(404).json({ error: "Site not found" });
    }

    const { businessId, currentVersion } = pointer;

    const siteKey = `site:${businessId}:v${currentVersion}`;
    const site = await kv.get(siteKey);

    if (!site) {
      return res.status(404).json({ error: "Site version not found" });
    }

    // -------------------------
    // 2. VALIDATE MODULE CONTRACT EXISTS
    // -------------------------
    const contract = moduleContracts[moduleName];

    if (!contract) {
      return res.status(400).json({
        error: "Invalid module name"
      });
    }

    // -------------------------
    // BUG FIX: correct content path is site.content.home[moduleName]
    // -------------------------
    const currentModuleContent = site.content?.home?.[moduleName] || {};

    // -------------------------
    // 3. SUGGEST ONLY MODE
    // Returns 3 specific improvement suggestions without saving
    // -------------------------
    if (suggestOnly) {
      const suggestResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 300,
        messages: [
          {
            role: "system",
            content: `You are a website copy improvement advisor.
Given the current content of a website section, suggest exactly 3 specific, 
actionable improvement instructions.

RULES:
- Each suggestion must be specific to the actual content shown
- Each suggestion must be a short action phrase (max 12 words)
- Return ONLY a JSON array of 3 strings
- No markdown, no explanation, no extra keys

Example format:
["Make the headline more urgent and benefit-focused", "Add a specific timeframe to the CTA button", "Replace generic description with a customer outcome"]`
          },
          {
            role: "user",
            content: `Module: ${moduleName}

Current content:
${JSON.stringify(currentModuleContent, null, 2)}

Suggest 3 specific improvements for this exact content.`
          }
        ],
        temperature: 0.8
      });

      const raw = suggestResponse.choices[0].message.content;
      try {
        const suggestions = safeParse(raw);
        if (Array.isArray(suggestions)) {
          return res.status(200).json({ suggestions });
        }
      } catch {
        // fall through to empty
      }
      return res.status(200).json({ suggestions: [] });
    }

    // -------------------------
    // 4. AI REGENERATION (STRICT CONTRACT)
    // -------------------------
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 800,
      messages: [
        {
          role: "system",
          content: `You are regenerating ONE module of a website.

CRITICAL RULES:
- Output ONLY valid JSON
- No markdown, no explanations, no extra keys
- MUST match schema exactly
- Required fields must be present and non-empty

SCHEMA:
${JSON.stringify(contract, null, 2)}`
        },
        {
          role: "user",
          content: `Module: ${moduleName}

Business context:
- Category: ${site.category || "general"}
- Original prompt: ${site.prompt || ""}

Current content:
${JSON.stringify(currentModuleContent, null, 2)}

Instruction: ${instruction || "Improve this module content while keeping the structure identical"}`
        }
      ],
      temperature: 0.5
    });

    const parsed = safeParse(response.choices[0].message.content);

    // -------------------------
    // 5. STRICT VALIDATION
    // -------------------------
    const newModuleData = validateAgainstContract(parsed, contract);

    if (!newModuleData) {
      return res.status(500).json({
        error: "AI output failed schema validation"
      });
    }

    // -------------------------
    // 6. UPDATE ONLY THIS MODULE
    // BUG FIX: write back to correct path site.content.home[moduleName]
    // -------------------------
    const updatedSite = {
      ...site,
      content: {
        ...site.content,
        home: {
          ...site.content?.home,
          [moduleName]: newModuleData
        }
      },
      updatedAt: Date.now()
    };

    // -------------------------
    // 7. SAVE NEW VERSION (IMMUTABLE HISTORY)
    // -------------------------
    const newVersion = currentVersion + 1;
    const newKey = `site:${businessId}:v${newVersion}`;

    await kv.set(newKey, updatedSite);

    // -------------------------
    // 8. UPDATE SLUG POINTER
    // -------------------------
    await kv.set(`slug:${slug}`, {
      slug,
      businessId,
      currentVersion: newVersion
    });

    // -------------------------
    // RESPONSE
    // -------------------------
    return res.status(200).json({
      success: true,
      moduleName,
      version: newVersion,
      site: updatedSite
    });

  } catch (err) {
    console.error("REGEN ERROR:", err);
    return res.status(500).json({
      error: "Module regeneration failed"
    });
  }
}
