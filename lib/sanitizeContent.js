export function stripHtmlDeep(obj) {
  if (typeof obj === "string") {
    return obj.replace(/<[^>]*>/g, "");
  }

  if (Array.isArray(obj)) {
    return obj.map(stripHtmlDeep);
  }

  if (typeof obj === "object" && obj !== null) {
    const clean = {};
    for (const key in obj) {
      clean[key] = stripHtmlDeep(obj[key]);
    }
    return clean;
  }

  return obj;
}