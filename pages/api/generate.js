export default async function handler(req, res) {
  console.log("API HIT");

  try {
    const { prompt } = req.body || {};
    console.log("PROMPT RECEIVED:", prompt);

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // TEMP SKIP OPENAI COMPLETELY
    const siteId = prompt
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    console.log("GENERATED SITE ID:", siteId);

    return res.status(200).json({ siteId });

  } catch (err) {
    console.error("FATAL ERROR:", err);

    return res.status(500).json({
      error: "Crash in API",
      details: err.message
    });
  }
}