import { saveSite } from "../../data/sites";

export default async function handler(req, res) {
  const { prompt } = req.body;

  const systemPrompt = `
Return ONLY valid JSON.

{
  "siteId": "string-slug",
  "businessName": "string",

  "pages": ["home"],

  "structure": {
    "home": ["hero", "features", "cta"]
  },

  "content": {
    "home": {
      "hero": {
        "title": "...",
        "subtitle": "...",
        "cta": "..."
      },
      "features": {
        "items": ["...", "..."]
      },
      "cta": {
        "title": "...",
        "button": "..."
      }
    }
  }
}
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await response.json();
  const text = data.choices[0].message.content;

  const blueprint = JSON.parse(text);

  // SAVE SITE
  saveSite(blueprint.siteId, blueprint);

  res.status(200).json({ siteId: blueprint.siteId });
}