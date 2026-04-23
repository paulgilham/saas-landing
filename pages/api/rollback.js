import { kv } from "@vercel/kv";

export default async function handler(req, res) {
  try {
    const { slug, version } = req.body;

    if (!slug || !version) {
      return res.status(400).json({ error: "Missing slug or version" });
    }

    // -------------------------
    // GET POINTER
    // -------------------------
    const pointer = await kv.get(`slug:${slug}`);

    if (!pointer) {
      return res.status(404).json({ error: "Site not found" });
    }

    const { businessId } = pointer;

    // -------------------------
    // GET TARGET VERSION
    // -------------------------
    const targetSite = await kv.get(
      `site:${businessId}:v${version}`
    );

    if (!targetSite) {
      return res.status(404).json({ error: "Version not found" });
    }

    // -------------------------
    // CREATE NEW VERSION FROM ROLLBACK
    // -------------------------
    const newVersion = parseInt(pointer.currentVersion) + 1;

    const rolledBackSite = {
      ...targetSite,
      version: newVersion,
      rolledBackFrom: version,
      updatedAt: Date.now()
    };

    await kv.set(`site:${businessId}:v${newVersion}`, rolledBackSite);

    // -------------------------
    // UPDATE POINTER
    // -------------------------
    await kv.set(`slug:${slug}`, {
      slug,
      businessId,
      currentVersion: newVersion
    });

    return res.status(200).json({
      success: true,
      restoredVersion: version,
      newVersion
    });

  } catch (err) {
    console.error("ROLLBACK ERROR:", err);
    return res.status(500).json({ error: "Rollback failed" });
  }
}