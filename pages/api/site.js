import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ error: "Missing slug" });
    }

    const route = await kv.get(`slug:${slug}`);

    if (!route?.businessId) {
      return res.status(404).json({ error: "Site not found" });
    }

    const { businessId, currentVersion } = route;

    const site = await kv.get(
      `site:${businessId}:v${currentVersion}`
    );

    if (!site) {
      return res.status(404).json({ error: "Version not found" });
    }

    return res.status(200).json({ site });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}