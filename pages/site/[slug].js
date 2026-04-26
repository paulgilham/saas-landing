import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { moduleRegistry } from "@/lib/moduleRegistry";
import { selectVariant } from "@/lib/moduleVariants";
import ModuleWrapper from "@/components/modules/ModuleWrapper";

export default function SitePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [site, setSite]                 = useState(null);
  const [history, setHistory]           = useState([]);
  const [panelOpen, setPanelOpen]       = useState(false);
  const [hoveredModule, setHoveredModule] = useState(null);
  const [regenTarget, setRegenTarget]   = useState(null);
  const [regenInstruction, setRegenInstruction] = useState("");
  const [regenSuggestions, setRegenSuggestions] = useState([]);
  const [regenLoading, setRegenLoading] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    loadSite();
    loadHistory();
  }, [slug]);

  const loadSite = async () => {
    const res  = await fetch(`/api/site?slug=${slug}`);
    const data = await res.json();
    if (!data?.site) return;
    setSite(data.site);
  };

  const loadHistory = async () => {
    const res  = await fetch(`/api/site-history?slug=${slug}`);
    const data = await res.json();
    if (data?.versions) setHistory(data.versions);
  };

  // -----------------------------
  // OPEN REGEN PANEL
  // -----------------------------
  const openRegen = async (moduleName) => {
    setRegenTarget(moduleName);
    setRegenInstruction("");
    setRegenSuggestions([]);
    setSuggestLoading(true);

    try {
      const res  = await fetch("/api/regenerate-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, moduleName, suggestOnly: true }),
      });
      const data = await res.json();
      if (data.suggestions) setRegenSuggestions(data.suggestions);
    } catch (e) {
      console.error("Suggest error", e);
    }
    setSuggestLoading(false);
  };

  // -----------------------------
  // ROLLBACK
  // -----------------------------
  const handleRollback = async (version) => {
    const res  = await fetch("/api/rollback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, version }),
    });
    const data = await res.json();
    if (data.success) {
      await loadSite();
      await loadHistory();
      setPanelOpen(false);
    }
  };

  // -----------------------------
  // REGENERATE MODULE
  // -----------------------------
  const handleRegen = async (instruction) => {
    setRegenLoading(true);
    const res  = await fetch("/api/regenerate-module", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        moduleName: regenTarget,
        instruction,
        suggestOnly: false,
      }),
    });
    const data = await res.json();
    if (data.success) {
      setSite(data.site);
      await loadHistory();
    }
    setRegenLoading(false);
    setRegenTarget(null);
    setRegenInstruction("");
    setRegenSuggestions([]);
  };

  // -----------------------------
  // RENDER MODULES
  // -----------------------------
  const renderModules = () => {
    const structure = site?.structure?.home || [];
    const tier      = site?.tier    || "medium";
    const traits    = site?.traits  || [];

    return structure.map((moduleName, i) => {
      const Component = moduleRegistry[moduleName];
      if (!Component) return null;

      const rawData = site?.content?.home?.[moduleName] || {};
      const isTarget  = regenTarget    === moduleName;
      const isHovered = hoveredModule  === moduleName;

      // Select visual variant based on traits + tier
      const variant = selectVariant(moduleName, { traits, tier });

      return (
        <div
          key={`${moduleName}-${i}`}
          className="relative"
          onMouseEnter={() => setHoveredModule(moduleName)}
          onMouseLeave={() => setHoveredModule(null)}
        >
          {/* ACTIVE SECTION HIGHLIGHT */}
          <div className={`transition-all duration-200 ${isTarget ? "ring-2 ring-primary ring-inset" : ""}`}>

            {/* TRAIT-DRIVEN SPACING + CONTAINER via ModuleWrapper */}
            <ModuleWrapper moduleName={moduleName} traits={traits} tier={tier}>
              <Component data={rawData} variant={variant} />
            </ModuleWrapper>

          </div>

          {/* IMPROVE BUTTON — hover only */}
          <button
            onClick={() => openRegen(moduleName)}
            className={`
              absolute top-3 right-3 z-10
              bg-primary text-white text-xs font-semibold
              px-3 py-1.5 rounded-lg shadow-md
              transition-opacity duration-150
              ${isHovered && !isTarget ? "opacity-100" : "opacity-0 pointer-events-none"}
            `}
          >
            ✦ Improve
          </button>

          {/* INLINE REGEN PANEL */}
          {isTarget && (
            <div className="bg-gray-50 border-t border-b border-gray-200 px-6 py-5">
              <div className="max-w-2xl mx-auto">

                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm font-semibold text-gray-900">
                    Improve: <span className="text-primary">{regenTarget}</span>
                  </p>
                  <button
                    onClick={() => { setRegenTarget(null); setRegenSuggestions([]); }}
                    className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  >
                    ✕
                  </button>
                </div>

                {suggestLoading && (
                  <p className="text-xs text-gray-400 mb-4 animate-pulse">
                    Generating suggestions...
                  </p>
                )}

                {!suggestLoading && regenSuggestions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Suggested improvements
                    </p>
                    <div className="flex flex-col gap-2">
                      {regenSuggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleRegen(s)}
                          disabled={regenLoading}
                          className="text-left bg-white border border-gray-200 hover:border-primary text-gray-700 text-sm px-4 py-2.5 rounded-lg transition-colors duration-150 disabled:opacity-50"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Or write your own
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Make it more urgent, use friendly tone..."
                    value={regenInstruction}
                    onChange={e => setRegenInstruction(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && regenInstruction && handleRegen(regenInstruction)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={() => handleRegen(regenInstruction)}
                    disabled={regenLoading || !regenInstruction}
                    className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                  >
                    {regenLoading ? "Applying..." : "Apply"}
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      );
    });
  };

  if (!site) return (
    <div className="flex items-center justify-center min-h-screen text-gray-400 text-sm">
      Loading...
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">

      {/* TOOLBAR */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center px-6 py-3 max-w-7xl mx-auto">
          <span className="font-bold text-primary text-sm tracking-tight">SiteForge</span>
          <button
            onClick={() => { setPanelOpen(!panelOpen); loadHistory(); }}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Version History
          </button>
        </div>
      </div>

      {/* VERSION HISTORY DRAWER */}
      {panelOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setPanelOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-72 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-base">Version History</h2>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {history.length === 0 && (
                <p className="text-gray-400 text-sm text-center mt-8">No history yet.</p>
              )}
              {[...history].reverse().map((v) => (
                <div
                  key={v.version}
                  className="mb-3 p-3 border border-gray-200 rounded-xl text-sm hover:border-primary transition-colors"
                >
                  <div className="font-semibold text-gray-900 mb-0.5">
                    Version {v.version}
                  </div>
                  {v.updatedAt && (
                    <div className="text-gray-400 text-xs mb-3">
                      {new Date(v.updatedAt).toLocaleString()}
                    </div>
                  )}
                  <button
                    onClick={() => handleRollback(v.version)}
                    className="bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* SITE CONTENT */}
      {renderModules()}

    </div>
  );
}
