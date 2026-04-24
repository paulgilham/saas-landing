import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { moduleRegistry } from "@/lib/moduleRegistry";
import { LAYOUT_RULES, MODULE_PRIORITY } from "@/lib/layoutRules";
import { getUIIntensity } from "@/lib/uiIntensity";

export default function SitePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [site, setSite] = useState(null);
  const [traits, setTraits] = useState([]);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      const res = await fetch(`/api/site?slug=${slug}`);
      const data = await res.json();

      const loaded = data.site || data;

      setSite(loaded);
      setTraits(loaded?.traits || []); // ✅ NEW
    };

    load();
  }, [slug]);

  // -----------------------------
  // 🧠 HYBRID VISUAL ENGINE
  // (tier + priority + traits)
  // -----------------------------
  const getLayoutStyle = (moduleName, tier, traits) => {
    const rules = LAYOUT_RULES[tier] || LAYOUT_RULES.medium;

    const priority = MODULE_PRIORITY[moduleName] || 1;

    // 🔥 NEW: trait-driven UI modulation
    const ui = getUIIntensity(traits);

    const spacingMap = {
      tight: "py-6",
      normal: rules.sectionSpacing,
      relaxed: "py-20"
    };

    const widthMap = {
      low: "max-w-6xl",
      normal: rules.containerWidth,
      high: "max-w-4xl"
    };

    return {
      sectionSpacing: spacingMap[ui.spacing],
      containerWidth: widthMap[ui.density],
      priority
    };
  };

  // -----------------------------
  // RENDER MODULES (FINAL)
  // -----------------------------
  const renderModules = () => {
    const structure = site?.structure?.home || [];
    const tier = site?.tier || "medium";

    return structure.map((moduleName, i) => {
      const Component = moduleRegistry[moduleName];
      if (!Component) return null;

      const rawData = site?.content?.home?.[moduleName] || {};

      const layout = getLayoutStyle(moduleName, tier, traits);

      return (
        <div
          key={`${moduleName}-${i}`}
          className={`
            w-full
            ${layout.sectionSpacing}
            flex justify-center
          `}
          data-priority={layout.priority}
        >
          <div className={`w-full ${layout.containerWidth}`}>
            <Component
              data={rawData}
              traits={traits}          // ✅ PASS DOWN
              moduleName={moduleName} // future-proof
            />
          </div>
        </div>
      );
    });
  };

  // -----------------------------
  // LOADING
  // -----------------------------
  if (!site) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {renderModules()}
    </div>
  );
}