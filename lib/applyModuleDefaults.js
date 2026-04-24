import { moduleContracts } from "./moduleContracts";

export function applyModuleDefaults(moduleName, data = {}) {
  const contract = moduleContracts[moduleName];
  if (!contract) return data;

  const props = contract.properties;
  const output = { ...data };

  for (const key in props) {
    if (output[key] === undefined || output[key] === null) {
      if (props[key].type === "array") {
        output[key] = [];
      } else {
        output[key] = "";
      }
    }
  }

  return output;
}