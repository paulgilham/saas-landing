import { moduleSchemas } from "./moduleSchemas";

export function validateModule(moduleName, data) {
  const schema = moduleSchemas[moduleName];
  if (!schema) return null;

  if (!data || typeof data !== "object") return null;

  // basic required field check
  for (const key in schema) {
    const type = schema[key];

    if (Array.isArray(type)) {
      if (!Array.isArray(data[key])) return null;
      continue;
    }

    if (type === "string" && typeof data[key] !== "string") {
      return null;
    }
  }

  return data;
}