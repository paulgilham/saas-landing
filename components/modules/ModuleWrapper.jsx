import { getUIIntensity } from "@/lib/uiIntensity";

export default function ModuleWrapper({ children, traits = [], moduleName }) {
  const ui = getUIIntensity(traits);

  const spacingMap = {
    tight: "py-6",
    normal: "py-12",
    relaxed: "py-20"
  };

  const densityMap = {
    low: "max-w-6xl mx-auto",
    normal: "max-w-5xl mx-auto",
    high: "max-w-4xl mx-auto"
  };

  const emphasisMap = {
    balanced: "",
    high: "shadow-lg border border-gray-200 rounded-xl"
  };

  return (
    <div
      className={`
        ${spacingMap[ui.spacing]}
        ${densityMap[ui.density]}
        ${emphasisMap[ui.emphasis]}
        transition-all duration-300
      `}
      data-module={moduleName}
    >
      {children}
    </div>
  );
}