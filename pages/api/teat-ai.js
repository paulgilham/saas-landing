import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "Say hello like a business website" }
      ],
    });

    return res.status(200).json({
      output: response.choices[0].message.content
    });

  } catch (err) {
    console.error("AI ERROR:", err);

    return res.status(500).json({
      error: "AI failed",
      details: err.message
    });
  }
}