export const BUSINESS_MODIFIERS = [
  "trust_heavy",
  "booking_driven",
  "lead_gen",
  "portfolio_led",
  "transactional",
  "consultative"
];

// AI CAN SUGGEST, BUT SYSTEM VALIDATES
export function normalizeModifiers(input = []) {
  if (!Array.isArray(input)) return [];

  return input.filter((m) =>
    BUSINESS_MODIFIERS.includes(m)
  );
}

// RULE CHECKER (CRITICAL GUARDRAIL)
export function validateModifiers(modifiers = []) {
  return normalizeModifiers(modifiers);
}