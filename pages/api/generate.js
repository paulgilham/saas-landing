export default async function handler(req, res) {
  try {
    const { prompt } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: "Missing prompt"
      });
    }

    const siteId = prompt
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");

    return res.status(200).json({
      siteId,
      businessName: prompt
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      error: "Server crash"
    });
  }
}