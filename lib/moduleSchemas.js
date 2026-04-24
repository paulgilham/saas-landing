export const moduleSchemas = {
  hero: {
    headline: "string",
    subtext: "string",
    cta: "string"
  },

  services: {
    title: "string",
    items: [
      {
        title: "string",
        description: "string"
      }
    ]
  },

  testimonials: {
    title: "string",
    items: [
      {
        quote: "string",
        author: "string"
      }
    ]
  },

  cta: {
    headline: "string",
    buttonText: "string"
  },

  contact: {
    title: "string",
    phone: "string?",
    email: "string?"
  }
};