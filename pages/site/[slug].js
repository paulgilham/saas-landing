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
        setSite(data.site || null);
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
  // LOADING STATES
  // -----------------------------------
  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!site) {
    return <div className="p-10 text-center">Site not found</div>;
  }

  // -----------------------------------
  // 🧪 DEBUG RENDERER (KEY ADDITION)
  // -----------------------------------
  const renderModules = () => {
    return site.structure.home.map((moduleName, i) => {
      const moduleData = site.content?.home?.[moduleName];

      console.log("DEBUG:", moduleName, moduleData);

      const Component = modules[moduleName];
      if (!Component) return null;

      return (
        <div
          key={i}
          style={{
            border: "2px solid red",
            marginBottom: "20px",
            padding: "10px"
          }}
          onMouseEnter={() => setActiveModule(moduleName)}
          onMouseLeave={() => setActiveModule(null)}
        >
          {/* DEBUG INFO */}
          <div style={{ fontSize: "12px", color: "red", marginBottom: "10px" }}>
            <strong>Module:</strong> {moduleName} <br />
            <strong>Variant:</strong> {moduleData?.variant || "none"} <br />
            <strong>Data:</strong>
            <pre style={{ whiteSpace: "pre-wrap" }}>
              {JSON.stringify(moduleData, null, 2)}
            </pre>
          </div>

          {/* MODULE */}
          <div>
            <Component data={moduleData?.data || {}} />
          </div>

          {/* HOVER CONTROL */}
          {activeModule === moduleName && (
            <div style={{ position: "absolute", top: 10, right: 10 }}>
              <button
                onClick={() => regenerateModule(moduleName)}
                style={{
                  background: "black",
                  color: "white",
                  fontSize: "12px",
                  padding: "6px 10px",
                  borderRadius: "4px",
                  opacity: 0.8
                }}
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
  // UI
  // -----------------------------------
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* TOP BAR */}
      <div className="sticky top-0 bg-white border-b p-4 flex justify-between">
        <div className="font-semibold">{site.slug}</div>

        <button
          onClick={loadHistory}
          className="bg-gray-900 text-white px-4 py-2 rounded"
        >
          Refresh History
        </button>
      </div>

      {/* PAGE CONTENT */}
      <div>{renderModules()}</div>

      {/* VERSION HISTORY */}
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
                <span className="font-semibold">
                  v{v.version}
                </span>
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