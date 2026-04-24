import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { modules } from "../../lib/modules";

export default function SitePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeModule, setActiveModule] = useState(null);
  const [loadingModule, setLoadingModule] = useState(null);

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSite();
  }, [slug]);

  // -----------------------------------
  // LOAD HISTORY
  // -----------------------------------
  const loadHistory = async () => {
    setLoadingHistory(true);

    try {
      const res = await fetch(`/api/site-history?slug=${slug}`);
      const data = await res.json();
      setHistory(data.versions || []);
    } catch (err) {
      console.error("history error", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (slug) loadHistory();
  }, [slug]);

  // -----------------------------------
  // MODULE REGENERATION
  // -----------------------------------
  const regenerateModule = async (moduleName, instruction = "") => {
    setLoadingModule(moduleName);

    try {
      const res = await fetch("/api/regenerate-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          moduleName,
          instruction
        })
      });

      const data = await res.json();

      if (data?.site) {
        setSite(data.site);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingModule(null);
    }
  };

  // -----------------------------------
  // ROLLBACK
  // -----------------------------------
  const rollback = async (version) => {
    try {
      await fetch("/api/rollback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, version })
      });

      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  // -----------------------------------
  // SAFE HELPERS (CRITICAL)
  // -----------------------------------
  const safeObject = (val) => {
    if (!val || typeof val !== "object") return {};
    if (Array.isArray(val)) return val;
    return val;
  };

  // -----------------------------------
  // MODULE RENDERER (HARDENED)
  // -----------------------------------
  const renderModules = () => {
    const structure = site?.structure?.home || [];

    return structure.map((moduleName, i) => {
      const Component = modules[moduleName];

      if (!Component) return null;

      const rawData = site?.content?.home?.[moduleName];
      const data = safeObject(rawData);

      return (
        <div
          key={`${moduleName}-${i}`}
          className="relative group border-b border-gray-100"
          onMouseEnter={() => setActiveModule(moduleName)}
          onMouseLeave={() => setActiveModule(null)}
        >
          {/* MODULE */}
          <div>
            {(() => {
              try {
                return Component(data);
              } catch (err) {
                console.error("Render error:", moduleName, err);
                return null;
              }
            })()}
          </div>

          {/* MODULE CONTROLS */}
          {activeModule === moduleName && (
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={() => regenerateModule(moduleName)}
                className="bg-black text-white text-xs px-3 py-1 rounded opacity-80 hover:opacity-100"
              >
                {loadingModule === moduleName
                  ? "Improving..."
                  : "Improve"}
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  // -----------------------------------
  // LOADING STATE
  // -----------------------------------
  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!site) {
    return <div className="p-10 text-center">Site not found</div>;
  }

  // -----------------------------------
  // UI
  // -----------------------------------
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* TOP BAR */}
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between">
        <div className="font-semibold">
          {site.slug} • {site.vertical} • {site.tier}
        </div>

        <button
          onClick={loadHistory}
          className="bg-gray-900 text-white px-4 py-2 rounded"
        >
          Refresh History
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div>{renderModules()}</div>

      {/* HISTORY PANEL */}
      <div className="border-t p-4 bg-gray-50">
        <h3 className="font-semibold mb-3">Version History</h3>

        {loadingHistory && (
          <div className="text-sm text-gray-500">
            Loading history...
          </div>
        )}

        {!loadingHistory && history.length === 0 && (
          <div className="text-sm text-gray-500">
            No history found
          </div>
        )}

        <div className="space-y-2">
          {history.map((v) => (
            <div
              key={v.version}
              className="flex justify-between items-center bg-white p-2 border rounded"
            >
              <div className="text-sm">
                <span className="font-semibold">v{v.version}</span>
              </div>

              <button
                onClick={() => rollback(v.version)}
                className="text-blue-600 text-sm"
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}