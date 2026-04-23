export function normalizeContent(moduleName, data = {}) {
  switch (moduleName) {

    case "hero":
      return {
        title: data.title || "",
        subtitle: data.subtitle || "",
        cta: data.cta || ""
      };

    case "features":
      return {
        items: Array.isArray(data.items) ? data.items : []
      };

    case "services":
      return {
        items: Array.isArray(data.items)
          ? data.items.map(i => ({
              service: i.service || "",
              description: i.description || ""
            }))
          : []
      };

    case "testimonials":
      return {
        items: Array.isArray(data.items)
          ? data.items.map(i => ({
              name: i.name || "",
              text: i.text || ""
            }))
          : []
      };

    default:
      return data;
  }
}