import { moduleSchemas } from "./moduleSchemas";

// ------------------------------------
// STRICT VALIDATION (NO FALLBACK LOGIC)
// ------------------------------------
export function validateModule(moduleName, data) {
  const schema = moduleSchemas[moduleName];

  if (!schema) return null;
  if (!data || typeof data !== "object") return null;

  for (const key in schema) {
    const rule = schema[key];
    const value = data[key];

    // -----------------------------
    // ARRAY OF OBJECTS
    // -----------------------------
    if (Array.isArray(rule)) {
      if (!Array.isArray(value)) return null;

      const itemSchema = rule[0];

      if (typeof itemSchema === "object") {
        for (const item of value) {
          for (const field in itemSchema) {
            if (typeof item[field] !== itemSchema[field]) {
              return null;
            }
          }
        }
      }

      continue;
    }

    // -----------------------------
    // STRING CHECK
    // -----------------------------
    if (rule === "string") {
      if (typeof value !== "string") return null;
    }
  }

  return data;
}