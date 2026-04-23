import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    const { slug } = req.query;

    if (!slug) {
      return res.status(400).json({ error: "Missing slug" });
    }

    // -------------------------
    // GET POINTER
    // -------------------------
    const pointer = await kv.get(`slug:${slug}`);

    if (!pointer) {
      return res.status(404).json({ error: "Site not found" });
    }

    const { businessId, currentVersion } = pointer;

    // -------------------------
    // BUILD VERSION LIST
    // -------------------------
    const versions = [];

    for (let v = 1; v <= currentVersion; v++) {
      const site = await kv.get(`site:${businessId}:v${v}`);

      if (site) {
        versions.push({
          version: v,
          createdAt: site.createdAt || null,
          updatedAt: site.updatedAt || null
        });
      }
    }

    return res.status(200).json({
      businessId,
      currentVersion,
      versions
    });

  } catch (err) {
    console.error("HISTORY ERROR:", err);
    return res.status(500).json({ error: "Failed to load history" });
  }
}