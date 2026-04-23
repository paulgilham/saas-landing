export const BUSINESS_CATEGORIES = [
  "hair_beauty",
  "construction_trades",
  "health_medical",
  "legal_services",
  "finance_accounting",
  "hospitality",
  "fitness_wellness",
  "education_training",
  "real_estate",
  "agencies_marketing",
  "retail_ecommerce",
  "automotive",
  "home_services"
];

// STRICT resolver (NO AI)
export function resolveBusinessCategory(input = "") {
  const t = input.toLowerCase();

  if (t.includes("hair") || t.includes("salon")) return "hair_beauty";
  if (t.includes("builder") || t.includes("construction")) return "construction_trades";
  if (t.includes("clinic") || t.includes("doctor")) return "health_medical";
  if (t.includes("law")) return "legal_services";
  if (t.includes("account") || t.includes("finance")) return "finance_accounting";
  if (t.includes("restaurant") || t.includes("cafe")) return "hospitality";
  if (t.includes("gym") || t.includes("fitness")) return "fitness_wellness";
  if (t.includes("school") || t.includes("course")) return "education_training";
  if (t.includes("real estate") || t.includes("property")) return "real_estate";
  if (t.includes("agency") || t.includes("marketing")) return "agencies_marketing";
  if (t.includes("shop") || t.includes("store")) return "retail_ecommerce";
  if (t.includes("car") || t.includes("auto")) return "automotive";

  return "home_services";
}