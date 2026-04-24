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
    const { slug, moduleName, instruction } = req.body;

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
    // 3. AI REGENERATION (STRICT CONTRACT)
    // -------------------------
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are regenerating ONLY ONE module of a website.

CRITICAL RULES:
- output ONLY valid JSON
- no markdown
- no explanations
- no extra keys
- MUST match schema exactly

SCHEMA:
${JSON.stringify(contract, null, 2)}
          `
        },
        {
          role: "user",
          content: `
Module: ${moduleName}

Current content:
${JSON.stringify(site.content?.[moduleName] || {}, null, 2)}

Instruction:
${instruction || "Improve this module content while keeping structure identical"}
          `
        }
      ],
      temperature: 0.5
    });

    const parsed = safeParse(response.choices[0].message.content);

    // -------------------------
    // 4. STRICT VALIDATION (IMPORTANT)
    // -------------------------
    const newModuleData = validateAgainstContract(parsed, contract);

    if (!newModuleData) {
      return res.status(500).json({
        error: "AI output failed schema validation"
      });
    }

    // -------------------------
    // 5. UPDATE ONLY THIS MODULE
    // -------------------------
    const updatedSite = {
      ...site,
      content: {
        ...site.content,
        [moduleName]: newModuleData
      },
      updatedAt: Date.now()
    };

    // -------------------------
    // 6. SAVE NEW VERSION (IMMUTABLE HISTORY)
    // -------------------------
    const newVersion = currentVersion + 1;
    const newKey = `site:${businessId}:v${newVersion}`;

    await kv.set(newKey, updatedSite);

    // -------------------------
    // 7. UPDATE SLUG POINTER
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