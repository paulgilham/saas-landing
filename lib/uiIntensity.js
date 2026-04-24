export function getUIIntensity(traits = []) {
  let intensity = {
    spacing: "normal",
    density: "normal",
    emphasis: "balanced"
  };

  if (traits.includes("visual_heavy")) {
    intensity.spacing = "relaxed";
    intensity.density = "low";
  }

  if (traits.includes("conversion_focused")) {
    intensity.emphasis = "high";
  }

  if (traits.includes("trust_critical")) {
    intensity.spacing = "relaxed";
    intensity.emphasis = "high";
  }

  if (traits.includes("minimal_ui")) {
    intensity.spacing = "tight";
    intensity.density = "high";
  }

  return intensity;
}