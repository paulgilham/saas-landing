import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { modules } from "../../lib/modules";

export default function SitePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [activeModule, setActiveModule] = useState(null);
  const [loadingModule, setLoadingModule] = useState(null);

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
  // REGENERATE MODULE (CORE ACTION)
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
      console.error("regen error:", err);
    } finally {
      setLoadingModule(null);
    }
  };

  // -----------------------------------
  // AI CHAT HANDLER (SMART ROUTER)
  // -----------------------------------
  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const input = chatInput.toLowerCase();

    // SIMPLE INTENT ROUTING (CAN EVOLVE LATER)
    let targetModule = "hero";

    if (input.includes("service")) targetModule = "services";
    if (input.includes("testimonial")) targetModule = "testimonials";
    if (input.includes("cta")) targetModule = "cta";

    await regenerateModule(targetModule, chatInput);

    setChatInput("");
    setChatOpen(false);
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
  // RENDER MODULES WITH CONTROLS
  // -----------------------------------
  const renderModules = () => {
    return site.structure.home.map((moduleName, i) => {
      const data = site.content?.[moduleName] || {};
      const Component = modules[moduleName];

      if (!Component) return null;

      return (
        <div
          key={i}
          className="relative group border-b border-gray-100"
          onMouseEnter={() => setActiveModule(moduleName)}
          onMouseLeave={() => setActiveModule(null)}
        >
          {/* MODULE CONTENT */}
          <div>{Component(data)}</div>

          {/* CLEAN HOVER CONTROL (NO CLUTTER) */}
          {activeModule === moduleName && (
            <div className="absolute top-2 right-2">
              <button
                onClick={() => regenerateModule(moduleName)}
                className="bg-black text-white text-xs px-3 py-1 rounded opacity-80 hover:opacity-100"
              >
                {loadingModule === moduleName ? "Improving..." : "Improve"}
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
          onClick={() => setChatOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded"
        >
          AI Assist
        </button>
      </div>

      {/* PAGE CONTENT */}
      <div>{renderModules()}</div>

      {/* -----------------------------------
          AI CHAT PANEL (SIMPLE + CLEAN)
      ----------------------------------- */}
      {chatOpen && (
        <div className="fixed bottom-0 right-0 w-96 h-[400px] bg-white border shadow-xl flex flex-col">
          
          <div className="p-3 border-b font-semibold">
            AI Assistant
          </div>

          <div className="flex-1 p-3 text-sm text-gray-500">
            Try:
            <br />
            “make this more luxury”
            <br />
            “improve testimonials”
            <br />
            “better for conversions”
          </div>

          <div className="p-3 border-t flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 border p-2 text-sm"
              placeholder="Ask AI to improve site..."
            />

            <button
              onClick={handleChat}
              className="bg-black text-white px-3 py-2 text-sm"
            >
              Send
            </button>
          </div>
        </div>
      )}

    </div>
  );
}