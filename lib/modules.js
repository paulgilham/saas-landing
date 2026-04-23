// -----------------------------
// MODULE REGISTRY (AI USES THIS)
// -----------------------------
export const MODULES = [
  "hero",
  "features",
  "services",
  "testimonials",
  "cta",
  "contact"
];

// -----------------------------
// REQUIRED MODULES
// -----------------------------
export const REQUIRED_MODULES = ["hero"];

// -----------------------------
// HTML SAFETY LAYER
// -----------------------------
function escapeHtml(str) {
  if (typeof str !== "string") {
    if (str === null || str === undefined) return "";
    str = JSON.stringify(str);
  }

  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// -----------------------------
// SAFE VALUE EXTRACTOR
// (prevents [object Object])
// -----------------------------
function safeText(value) {
  if (value === null || value === undefined) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return (
      value.title ||
      value.name ||
      value.text ||
      value.service ||
      JSON.stringify(value)
    );
  }

  return String(value);
}

// -----------------------------
// RENDERING FUNCTIONS (UI LAYER)
// -----------------------------
export const modules = {

  // -------------------------
  // HERO
  // -------------------------
  hero: (data = {}) => `
    <section class="text-center py-24 px-6">
      <h1 class="text-4xl md:text-6xl font-semibold mb-6">
        ${escapeHtml(safeText(data.title) || "Default Title")}
      </h1>

      <p class="text-gray-500 max-w-lg mx-auto mb-8">
        ${escapeHtml(safeText(data.subtitle))}
      </p>

      <button class="bg-primary text-white px-6 py-3 rounded-lg">
        ${escapeHtml(safeText(data.cta) || "Get Started")}
      </button>
    </section>
  `,

  // -------------------------
  // FEATURES
  // -------------------------
  features: (data = {}) => `
    <section class="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
      ${(data.items || [])
        .map(i => `
          <div class="p-4 bg-gray-100 rounded">
            ${escapeHtml(safeText(i))}
          </div>
        `)
        .join("")}
    </section>
  `,

  // -------------------------
  // SERVICES (OBJECT SAFE)
  // -------------------------
  services: (data = {}) => `
    <section class="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
      ${(data.items || [])
        .map(i => `
          <div class="p-4 bg-gray-50 border rounded">
            <h3 class="font-semibold mb-1">
              ${escapeHtml(safeText(i.service))}
            </h3>
            <p class="text-gray-600">
              ${escapeHtml(safeText(i.description))}
            </p>
          </div>
        `)
        .join("")}
    </section>
  `,

  // -------------------------
  // TESTIMONIALS (FULL SAFE)
  // -------------------------
  testimonials: (data = {}) => `
    <section class="p-10 bg-gray-100 text-center space-y-4">
      ${(data.items || [])
        .map(i => {
          const text =
            typeof i === "string"
              ? i
              : i.text || i.message || JSON.stringify(i);

          const name =
            typeof i === "object"
              ? i.name || ""
              : "";

          return `
            <div class="italic">
              ${escapeHtml(text)}
              ${name ? `<div class="font-semibold mt-2">${escapeHtml(name)}</div>` : ""}
            </div>
          `;
        })
        .join("")}
    </section>
  `,

  // -------------------------
  // CTA
  // -------------------------
  cta: (data = {}) => `
    <section class="text-center py-20 bg-primary text-white">
      <h2 class="text-3xl font-semibold mb-4">
        ${escapeHtml(safeText(data.title) || "Ready to get started?")}
      </h2>

      <button class="bg-white text-primary px-6 py-3 rounded-lg">
        ${escapeHtml(safeText(data.button) || "Start")}
      </button>
    </section>
  `,

  // -------------------------
  // CONTACT
  // -------------------------
  contact: (data = {}) => `
    <section class="p-10 text-center">
      <p class="mb-2">
        ${escapeHtml(safeText(data.text) || "Contact us today")}
      </p>

      ${data.phone ? `<p>${escapeHtml(data.phone)}</p>` : ""}
      ${data.email ? `<p>${escapeHtml(data.email)}</p>` : ""}
    </section>
  `
};