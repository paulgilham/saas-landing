export function normalizeContent(moduleName, data = {}) {
  switch (moduleName) {
    case "hero":
      return {
        title: data.title || "Default Title",
        subtitle: data.subtitle || "",
        cta: data.cta || "Get Started"
      };

    case "cta":
      return {
        title: data.title || "Ready to get started?",
        button: data.button || "Start"
      };

    case "features":
    case "services":
      return {
        items: data.items || []
      };

    default:
      return data;
  }
}