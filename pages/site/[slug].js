import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { modules } from "../../lib/modules";
import { reactModules } from "../../lib/reactModules";
import { normalizeContent } from "../../lib/normalizeContent";

export default function SitePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------------
  // FUTURE SWITCH (KEEP FALSE FOR NOW)
  // -----------------------------------
  const USE_REACT = false;

  // -----------------------------------
  // FETCH SITE FROM API
  // -----------------------------------
  useEffect(() => {
    if (!slug) return;

    const fetchSite = async () => {
      try {
        const res = await fetch(`/api/site?slug=${slug}`);
        const data = await res.json();

        setSite(data.site || null);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [slug]);

  // -----------------------------------
  // MODULE RENDERER
  // -----------------------------------
  const renderModules = () => {
    if (!site?.structure?.home) return null;

    return site.structure.home.map((moduleName, i) => {
      const moduleFn = modules[moduleName];

      if (!moduleFn) {
        console.warn("Missing module:", moduleName);
        return null;
      }

      // =====================================
      // 🧠 CRITICAL FIX: NORMALIZATION LAYER
      // =====================================
      const rawData = site.content?.[moduleName] || {};
      const data = normalizeContent(moduleName, rawData);

      // -------------------------
      // REACT MODE (FUTURE)
      // -------------------------
      if (USE_REACT) {
        const Component = reactModules[moduleName];

        if (!Component) {
          console.warn("Missing React module:", moduleName);
          return null;
        }

        return <Component key={i} data={data} />;
      }

      // -------------------------
      // STRING MODE (CURRENT)
      // -------------------------
      return (
        <div
          key={i}
          dangerouslySetInnerHTML={{
            __html: moduleFn(data),
          }}
        />
      );
    });
  };

  // -----------------------------------
  // LOADING STATE
  // -----------------------------------
  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  // -----------------------------------
  // ERROR STATE
  // -----------------------------------
  if (!site) {
    return <div className="p-10 text-center">Site not found</div>;
  }

  // -----------------------------------
  // RENDER PAGE
  // -----------------------------------
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {renderModules()}
    </div>
  );
}