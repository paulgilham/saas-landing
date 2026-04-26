import { kv } from "@vercel/kv";

// -----------------------------
// KEY PATTERNS (SINGLE SOURCE OF TRUTH)
// -----------------------------
const keys = {
  site: (businessId, version) => `site:${businessId}:v${version}`,
  slug: (slug) => `slug:${slug}`,
  profile: (businessId) => `profile:${businessId}`,
  preferences: (userId) => `prefs:${userId}`,
};

// -----------------------------
// SLUG HELPERS
// -----------------------------

// Generates a short 6-char suffix from a UUID
// e.g. "a3f9bc" — readable but unique enough
function shortId(uuid) {
  return uuid.replace(/-/g, "").slice(0, 6);
}

// Converts raw prompt to a clean base slug
export function buildBaseSlug(prompt = "") {
  return prompt
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50); // cap length
}

// Generates a unique slug — checks KV for collision,
// always appends businessId suffix to guarantee uniqueness
export async function generateUniqueSlug(prompt, businessId) {
  const base = buildBaseSlug(prompt);
  const suffix = shortId(businessId);

  // Always append suffix — guarantees uniqueness even for
  // identical prompts since businessId is always a fresh UUID
  const slug = `${base}-${suffix}`;

  // Double-check: if somehow this slug exists (extremely unlikely
  // but possible), append full businessId
  const existing = await kv.get(keys.slug(slug));
  if (existing) {
    return `${base}-${businessId}`;
  }

  return slug;
}

// -----------------------------
// SITE OPERATIONS
// -----------------------------

export async function getSiteBySlug(slug) {
  const pointer = await kv.get(keys.slug(slug));
  if (!pointer) return null;

  const { businessId, currentVersion } = pointer;
  const site = await kv.get(keys.site(businessId, currentVersion));

  return { site, pointer };
}

export async function saveSiteVersion(businessId, version, siteData) {
  await kv.set(keys.site(businessId, version), siteData);
}

export async function updateSlugPointer(slug, businessId, version) {
  await kv.set(keys.slug(slug), {
    slug,
    businessId,
    currentVersion: version
  });
}

export async function getSiteVersion(businessId, version) {
  return await kv.get(keys.site(businessId, version));
}

// -----------------------------
// HISTORY OPERATIONS
// -----------------------------

export async function getSiteHistory(businessId, currentVersion) {
  const versions = [];

  for (let v = 1; v <= currentVersion; v++) {
    const site = await kv.get(keys.site(businessId, v));
    if (site) {
      versions.push({
        version: v,
        createdAt: site.createdAt || null,
        updatedAt: site.updatedAt || null,
        rolledBackFrom: site.rolledBackFrom || null,
      });
    }
  }

  return versions;
}

// -----------------------------
// BUSINESS PROFILE
// (stores classifier result, enriched traits, modifier preferences)
// -----------------------------

export async function saveBusinessProfile(businessId, profile) {
  await kv.set(keys.profile(businessId), profile);
}

export async function getBusinessProfile(businessId) {
  return await kv.get(keys.profile(businessId));
}

// -----------------------------
// USER PREFERENCES
// (future — stores modifier dial settings per user)
// -----------------------------

export async function saveUserPreferences(userId, prefs) {
  await kv.set(keys.preferences(userId), prefs);
}

export async function getUserPreferences(userId) {
  return await kv.get(keys.preferences(userId));
}
