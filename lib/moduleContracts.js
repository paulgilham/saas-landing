// -----------------------------
// MODULE CONTRACTS (SOURCE OF TRUTH)
// AI MUST FOLLOW THESE EXACT SHAPES
// -----------------------------
export const moduleContracts = {

  // -------------------------
  // HERO
  // -------------------------
  hero: {
    type: "object",
    required: ["title", "subtitle", "cta"],
    properties: {
      title: "string",
      subtitle: "string",
      cta: "string"
    }
  },

  // -------------------------
  // FEATURES
  // -------------------------
  features: {
    type: "object",
    required: ["items"],
    properties: {
      items: {
        type: "array",
        items: "string"
      }
    }
  },

  // -------------------------
  // SERVICES (STRUCTURED)
  // -------------------------
  services: {
    type: "object",
    required: ["items"],
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          required: ["service", "description"],
          properties: {
            service: "string",
            description: "string"
          }
        }
      }
    }
  },

  // -------------------------
  // TESTIMONIALS
  // -------------------------
  testimonials: {
    type: "object",
    required: ["items"],
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          required: ["name", "text"],
          properties: {
            name: "string",
            text: "string"
          }
        }
      }
    }
  },

  // -------------------------
  // CTA
  // -------------------------
  cta: {
    type: "object",
    required: ["title", "button"],
    properties: {
      title: "string",
      button: "string"
    }
  },

  // -------------------------
  // CONTACT
  // -------------------------
  contact: {
    type: "object",
    required: [],
    properties: {
      text: "string",
      phone: "string",
      email: "string"
    }
  }
};