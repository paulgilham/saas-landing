import { MODULE_GRAPH } from "./moduleGraph";

// -----------------------------
// GRAPH-DRIVEN ELIGIBILITY ENGINE
// Accepts pre-computed traits from traitEngine.
// Pure function — no internal prompt processing.
// -----------------------------
export function isModuleAllowed(module, traits = [], tier = "medium") {
  const node = MODULE_GRAPH[module];

  // Unknown module — allow by default
  if (!node) return true;

  // -------------------------
  // TIER RULES (GLOBAL)
  // -------------------------
  if (module === "pricing" && tier === "simple") return false;
  if (module === "booking" && tier === "simple") return false;

  // -------------------------
  // GRAPH REQUIREMENTS CHECK
  // All required traits must be present
  // -------------------------
  const required = node.requires || [];

  return required.every(req => traits.includes(req));
}
