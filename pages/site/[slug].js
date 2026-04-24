import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { modules } from "../../lib/modules";
import { validateModule } from "../../lib/validateModule";

export default function SitePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------------
  // FETCH SITE
  // -----------------------------------
  useEffect(() => {
    if (!slug) return;

    const fetchSite = async () => {
      try {
        const res = await fetch(`/api/site?slug=${slug}`);
        const data = await res.json();

        setSite(data.site || data || null);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [slug]);

  // -----------------------------------
  // MODULE RENDERER (REACT ONLY)
  // -----------------------------------
  const renderModules = () => {
    const structure = site?.structure?.home || [];

    return structure.map((moduleName, i) => {
      const Component = modules[moduleName];

      if (!Component) return null;

      const rawData = site?.content?.home?.[moduleName];

      // 🔒 STRICT VALIDATION (STEP 4 FIX APPLIED)
      const data = validateModule(moduleName, rawData);

      if (!data) {
        console.warn(`Invalid module data for: ${moduleName}`);
        return null;
      }

      return (
        <div key={`${moduleName}-${i}`}>
          <Component {...data} />
        </div>
      );
    });
  };

  // -----------------------------------
  // STATES
  // -----------------------------------
  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading...
      </div>
    );
  }

  if (!site) {
    return (
      <div className="p-10 text-center">
        Site not found
      </div>
    );
  }

  // -----------------------------------
  // RENDER
  // -----------------------------------
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {renderModules()}
    </div>
  );
}
