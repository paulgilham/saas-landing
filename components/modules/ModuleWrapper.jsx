import { getUIIntensity } from "@/lib/uiIntensity";

// -----------------------------
// MODULE WRAPPER
// Applies trait-driven spacing and container sizing to every module.
// Props:
//   moduleName  — string
//   traits      — array from site object
//   tier        — string
//   children    — the module component
// -----------------------------
export default function ModuleWrapper({
  moduleName,
  traits = [],
  tier = "medium",
  children
}) {
  const intensity = getUIIntensity(traits, tier);

  return (
    <div
      data-module={moduleName}
      className={`w-full ${intensity.section}`}
    >
      <div className={intensity.container}>
        {children}
      </div>
    </div>
  );
}
