import { MODULE_GRAPH } from "./moduleGraph";
import { getBusinessTraits } from "./traits";

// -----------------------------
// GRAPH-DRIVEN ELIGIBILITY ENGINE
// -----------------------------
export function isModuleAllowed(module, context) {
  const { prompt = "", tier = "medium" } = context;

  const { traits } = getBusinessTraits(prompt);
  const node = MODULE_GRAPH[module];

  if (!node) return true;

  // -------------------------
  // BASE TIER RULES (GLOBAL)
  // -------------------------
  if (module === "pricing" && tier === "simple") return false;
  if (module === "booking" && tier === "simple") return false;

  // -------------------------
  // GRAPH REQUIREMENTS CHECK
  // -------------------------
  const required = node.requires || [];

  const hasAllRequirements = required.every(req =>
    traits.includes(req)
  );

  return hasAllRequirements;
}