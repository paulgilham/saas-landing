import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { moduleRegistry } from "@/lib/moduleRegistry";
import { LAYOUT_RULES, MODULE_PRIORITY } from "@/lib/layoutRules";

export default function SitePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [site, setSite] = useState(null);
  const [history, setHistory] = useState([]);
  const [regenTarget, setRegenTarget] = useState(null);
  const [regenInstruction, setRegenInstruction] = useState("");
  const [regenLoading, setRegenLoading] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);

  // -----------------------------
  // LOAD SITE
  // -----------------------------
  useEffect(() => {
    if (!slug) return;
    loadSite();
    loadHistory();
  }, [slug]);

  const loadSite = async () => {
    const res = await fetch(`/api/site?slug=${slug}`);
    const data = await res.json();
    if (!data?.site) { console.error("Site not found"); return; }
    setSite(data.site);
  };

  const loadHistory = async () => {
    const res = await fetch(`/api/site-history?slug=${slug}`);
    const data = await res.json();
    if (data?.versions) setHistory(data.versions);
  };

  // -----------------------------
  // ROLLBACK
  // -----------------------------
  const handleRollback = async (version) => {
    const res = await fetch("/api/rollback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, version }),
    });
    const data = await res.json();
    if (data.success) {
      await loadSite();
      await loadHistory();
    }
  };

  // -----------------------------
  // REGENERATE MODULE
  // -----------------------------
  const handleRegen = async (moduleName) => {
    setRegenLoading(true);
    const res = await fetch("/api/regenerate-module", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, moduleName, instruction: regenInstruction }),
    });
    const data = await res.json();
    if (data.success) {
      setSite(data.site);
      await loadHistory();
    }
    setRegenLoading(false);
    setRegenTarget(null);
    setRegenInstruction("");
  };

  // -----------------------------
  // LAYOUT ENGINE
  // -----------------------------
  const getLayoutStyle = (moduleName, tier) => {
    const rules = LAYOUT_RULES[tier] || LAYOUT_RULES.medium;
    const priority = MODULE_PRIORITY[moduleName] || 1;
    return {
      sectionSpacing: rules.sectionSpacing,
      containerWidth: rules.containerWidth,
      priority,
    };
  };

  // -----------------------------
  // RENDER MODULES
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
          className={`w-full ${layout.sectionSpacing} flex justify-center relative group`}
          data-priority={layout.priority}
        >
          <div className={`w-full ${layout.containerWidth}`}>
            <Component data={rawData} />
          </div>

          {/* REGENERATE BUTTON — appears on hover */}
          <button
            onClick={() => setRegenTarget(moduleName)}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-indigo-600 text-white text-xs px-3 py-1 rounded-lg shadow"
          >
            ✦ Improve
          </button>
        </div>
      );
    });
  };

  if (!site) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* TOOLBAR */}
      <div className="sticky top-0 z-50 bg-white border-b px-6 py-3 flex justify-between items-center text-sm shadow-sm">
        <div className="font-semibold text-indigo-600">SiteForge</div>
        <div className="flex gap-3">
          <button
            onClick={() => setPanelOpen(!panelOpen)}
            className="bg-gray-100 px-4 py-1.5 rounded-lg text-gray-700"
          >
            Refresh History
          </button>
        </div>
      </div>

      {/* VERSION HISTORY PANEL */}
      {panelOpen && (
        <div className="fixed right-0 top-0 h-full w-72 bg-white border-l shadow-xl z-50 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Version History</h2>
            <button onClick={() => setPanelOpen(false)} className="text-gray-400 text-xl">✕</button>
          </div>
          {history.length === 0 && <p className="text-gray-400 text-sm">No history yet.</p>}
          {history.map((v) => (
            <div key={v.version} className="mb-3 p-3 border rounded-lg text-sm">
              <div className="font-medium">v{v.version}</div>
              {v.updatedAt && (
                <div className="text-gray-400 text-xs mb-2">
                  {new Date(v.updatedAt).toLocaleString()}
                </div>
              )}
              <button
                onClick={() => handleRollback(v.version)}
                className="bg-indigo-600 text-white px-3 py-1 rounded text-xs"
              >
                Restore
              </button>
            </div>
          ))}
        </div>
      )}

      {/* MODULE REGENERATION MODAL */}
      {regenTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="font-semibold text-lg mb-1">Improve: {regenTarget}</h2>
            <p className="text-sm text-gray-500 mb-4">
              Describe what to change, or leave blank to auto-improve.
            </p>
            <textarea
              className="w-full border rounded-lg p-3 text-sm mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              placeholder="e.g. Make it more professional, add urgency..."
              value={regenInstruction}
              onChange={(e) => setRegenInstruction(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setRegenTarget(null); setRegenInstruction(""); }}
                className="px-4 py-2 text-sm text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRegen(regenTarget)}
                disabled={regenLoading}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium"
              >
                {regenLoading ? "Regenerating..." : "Regenerate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SITE CONTENT */}
      {renderModules()}
    </div>
  );
}
