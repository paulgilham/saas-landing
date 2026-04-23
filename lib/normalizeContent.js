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
    case "portfolio_grid":
      return {
        items: (data.items || []).map(item =>
          typeof item === "string"
            ? item
            : item?.title || item?.name || JSON.stringify(item)
        )
      };

    case "testimonials":
      return {
        items: (data.items || []).map(item => {
          if (typeof item === "string") return item;

          return `${item.name || "User"}: ${item.text || ""}`;
        })
      };

    default:
      return data;
  }
}