import { moduleContracts } from "./moduleContracts";

export function validateModule(moduleName, data) {
  const contract = moduleContracts[moduleName];
  if (!contract) return null;
  if (!data || typeof data !== "object") return null;

  // Check all required fields exist
  for (const key of contract.required || []) {
    if (data[key] === undefined || data[key] === null) return null;
  }

  // Check property types
  for (const [key, type] of Object.entries(contract.properties || {})) {
    const value = data[key];
    if (value === undefined) continue; // optional field, skip

    if (type === "string") {
      if (typeof value !== "string") return null;

    } else if (typeof type === "object" && type.type === "array") {
      if (!Array.isArray(value)) return null;

      // If array items are objects, validate each item's required fields
      if (typeof type.items === "object" && type.items.type === "object") {
        for (const item of value) {
          for (const required of type.items.required || []) {
            if (item[required] === undefined || item[required] === null) return null;
          }
          for (const [field, fieldType] of Object.entries(type.items.properties || {})) {
            if (fieldType === "string" && item[field] !== undefined) {
              if (typeof item[field] !== "string") return null;
            }
          }
        }
      }
    }
  }

  return data;
}
