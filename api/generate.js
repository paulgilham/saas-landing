export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { prompt } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You generate structured website data in JSON only."
          },
          {
            role: "user",
            content: `Create a website structure for: ${prompt}. Return JSON with title, tagline, services (array), and cta.`
          }
        ]
      })
    });

    const data = await response.json();
    const text = data.choices[0].message.content;

    res.status(200).json({ result: text });

  } catch (err) {
    res.status(500).json({ error: "Failed to generate" });
  }
}