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
  // 🧠 BASE LAYOUT STYLE
  // -----------------------------
  const getLayoutStyle = (tier) => {
    return LAYOUT_RULES[tier] || LAYOUT_RULES.medium;
  };

  // -----------------------------
  // 🧠 TRAIT-AWARE PRIORITY ENGINE
  // -----------------------------
  const getPriority = (moduleName, traits = []) => {
    let base = MODULE_PRIORITY[moduleName] || 1;

    // SAFE bounded boosts
    if (traits.includes("conversion_focus") && moduleName === "cta") {
      base += 2;
    }

    if (traits.includes("trust_heavy") && moduleName === "testimonials") {
      base += 1;
    }

    if (traits.includes("visual_rich") && moduleName === "gallery") {
      base += 1;
    }

    if (traits.includes("service_heavy") && moduleName === "services") {
      base += 1;
    }

    if (traits.includes("info_heavy") && moduleName === "faq") {
      base += 1;
    }

    return base;
  };

  // -----------------------------
  // 🧠 ORDERING ENGINE (SAFE)
  // -----------------------------
  const orderModules = (structure, traits) => {
    return [...structure].sort((a, b) => {
      // 🔒 HARD LOCKS
      if (a === "hero") return -1;
      if (b === "hero") return 1;

      if (a === "contact") return 1;
      if (b === "contact") return -1;

      // 🧠 PRIORITY SORT
      return (
        getPriority(b, traits) -
        getPriority(a, traits)
      );
    });
  };

  // -----------------------------
  // 🎨 RENDER
  // -----------------------------
  const renderModules = () => {
    const structure = site?.structure?.home || [];
    const tier = site?.tier || "medium";
    const traits = site?.traits || [];

    const layout = getLayoutStyle(tier);
    const ordered = orderModules(structure, traits);

    return ordered.map((moduleName, i) => {
      const Component = moduleRegistry[moduleName];
      if (!Component) return null;

      const data = site?.content?.home?.[moduleName] || {};

      return (
        <div
          key={`${moduleName}-${i}`}
          className={`w-full ${layout.sectionSpacing} flex justify-center`}
        >
          <div className={`w-full ${layout.containerWidth}`}>
            <Component data={data} />
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