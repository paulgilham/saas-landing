import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ error: "Missing slug" });
    }

    // IMPORTANT: must match how you stored it
    const site = await kv.get(slug);

    if (!site) {
      return res.status(404).json({ site: null });
    }

    return res.status(200).json({ site });

  } catch (err) {
    console.error("SITE FETCH ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
}