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
        items: {
          type: "object",
          required: ["title", "description"],
          properties: {
            title: "string",
            description: "string"
          }
        }
      }
    }
  },

  // -------------------------
  // SERVICES
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
  },

  // -------------------------
  // PRICING
  // -------------------------
  pricing: {
    type: "object",
    required: ["title", "items"],
    properties: {
      title: "string",
      items: {
        type: "array",
        items: {
          type: "object",
          required: ["title", "price", "description"],
          properties: {
            title: "string",
            price: "string",
            description: "string"
          }
        }
      }
    }
  },

  // -------------------------
  // FAQ
  // -------------------------
  faq: {
    type: "object",
    required: ["title", "items"],
    properties: {
      title: "string",
      items: {
        type: "array",
        items: {
          type: "object",
          required: ["question", "answer"],
          properties: {
            question: "string",
            answer: "string"
          }
        }
      }
    }
  },

  // -------------------------
  // GALLERY
  // -------------------------
  gallery: {
    type: "object",
    required: ["title"],
    properties: {
      title: "string",
      images: {
        type: "array",
        items: "string"
      }
    }
  },

  // -------------------------
  // BOOKING
  // -------------------------
  booking: {
    type: "object",
    required: ["title", "cta"],
    properties: {
      title: "string",
      subtitle: "string",
      cta: "string"
    }
  },

  // -------------------------
  // ABOUT
  // -------------------------
  about: {
    type: "object",
    required: ["title", "text"],
    properties: {
      title: "string",
      text: "string"
    }
  }

};
