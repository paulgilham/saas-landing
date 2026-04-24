import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { moduleRegistry } from "@/lib/moduleRegistry";
import { LAYOUT_RULES, MODULE_PRIORITY } from "@/lib/layoutRules";

export default function SitePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [site, setSite] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      const res = await fetch(`/api/site?slug=${slug}`);
      const data = await res.json();
      setSite(data.site);
    };

    load();
  }, [slug]);

  // -----------------------------
  // 🧠 VISUAL LAYOUT ENGINE
  // -----------------------------
  const getLayoutStyle = (moduleName, tier) => {
    const rules = LAYOUT_RULES[tier] || LAYOUT_RULES.medium;

    const priority = MODULE_PRIORITY[moduleName] || 1;

    return {
      sectionSpacing: rules.sectionSpacing,
      containerWidth: rules.containerWidth,
      priority
    };
  };

  // -----------------------------
  // RENDER MODULES (UPGRADED)
  // -----------------------------
  const renderModules = () => {
    const structure = site?.structure?.home || [];
    const tier = site?.tier || "medium";

    return structure.map((moduleName, i) => {
      const Component = moduleRegistry[moduleName];
      if (!Component) return null;

      const rawData = site?.content?.home?.[moduleName] || {};

      const layout = getLayoutStyle(moduleName, tier);

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
            <Component data={rawData} />
          </div>
        </div>
      );
    });
  };

  if (!site) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {renderModules()}
    </div>
  );
}