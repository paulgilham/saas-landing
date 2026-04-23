import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { modules } from "../../lib/modules";

export default function SitePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  // -----------------------------
  // FETCH SITE DATA
  // -----------------------------
  useEffect(() => {
    if (!slug) return;

    const fetchSite = async () => {
      try {
        const res = await fetch(`/api/site?slug=${slug}`);
        const data = await res.json();

        setSite(data.site);
      } catch (err) {
        console.error("FETCH ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [slug]);

  // -----------------------------
  // RENDER MODULES (DYNAMIC)
  // -----------------------------
  const renderModules = () => {
    if (!site || !site.structure || !site.content) return "";

    return (site.structure.home || [])
      .map((moduleName) => {
        const fn = modules[moduleName];

        if (!fn) {
          console.warn("Missing module:", moduleName);
          return "";
        }

        const data = site.content.home?.[moduleName] || {};

        try {
          return fn(data);
        } catch (err) {
          console.error("MODULE ERROR:", moduleName, err);
          return "";
        }
      })
      .join("");
  };

  // -----------------------------
  // STATES
  // -----------------------------
  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!site) {
    return <div className="p-10 text-center">Site not found</div>;
  }

  // -----------------------------
  // RENDER PAGE
  // -----------------------------
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div
        dangerouslySetInnerHTML={{
          __html: renderModules(),
        }}
      />
    </div>
  );
}