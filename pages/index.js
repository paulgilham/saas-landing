import Head from "next/head";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const input = document.getElementById("promptInput");
    const loader = document.getElementById("loader");
    const progress = document.getElementById("progress");
    const steps = document.getElementById("steps");
    const s2 = document.getElementById("s2");
    const s3 = document.getElementById("s3");

    const prompt = input.value;
    if (!prompt) return;

    setLoading(true);

    loader.classList.remove("hidden");
    steps.classList.remove("hidden");

    // fake progress animation
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      progress.style.width = p + "%";
      if (p >= 100) clearInterval(interval);
    }, 150);

    setTimeout(() => s2.classList.remove("hidden"), 600);
    setTimeout(() => s3.classList.remove("hidden"), 1200);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();

      console.log("API RESPONSE:", data);

      // -----------------------------
      // SAFE CHECK (PREVENT /undefined BUG)
      // -----------------------------
      if (!data.siteId) {
        alert("Generation failed: no siteId returned");
        setLoading(false);
        return;
      }

      // redirect to generated site
      window.location.href = `/site/${data.siteId}`;

    } catch (err) {
      console.error("Frontend error:", err);
      alert("Server error");
    }

    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>SiteForge</title>

        <script src="https://cdn.tailwindcss.com"></script>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: 'class',
                theme: {
                  extend: {
                    colors: {
                      primary: "#4F46E5"
                    }
                  }
                }
              }
            `,
          }}
        />
      </Head>

      <div className="bg-white text-gray-900 font-sans dark:bg-gray-950 dark:text-white transition">

        {/* NAV */}
        <header className="sticky top-0 backdrop-blur bg-white/70 dark:bg-gray-950/70 border-b dark:border-gray-800 z-50">
          <div className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">

            <div className="font-semibold tracking-tight">SiteForge</div>

            <div className="hidden md:flex gap-8 text-sm text-gray-500 dark:text-gray-400">
              <a>Features</a>
              <a>Pricing</a>
              <a>Contact</a>
            </div>

            <div className="flex items-center gap-3">
              <button>🌙</button>
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm">
                Login
              </button>
              <button className="md:hidden text-2xl">☰</button>
            </div>

          </div>
        </header>

        {/* HERO */}
        <section className="text-center py-28 px-6">

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6">
            Generate a <span className="text-primary">Real Website</span><br />
            From One Sentence
          </h1>

          <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-10">
            Type your business. Watch it build live.
          </p>

          {/* DEMO */}
          <div className="max-w-3xl mx-auto rounded-2xl shadow-2xl border dark:border-gray-800 overflow-hidden">

            {/* INPUT */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 text-left">
              <input
                id="promptInput"
                className="w-full bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe your business..."
              />
            </div>

            {/* BUTTON */}
            <div className="p-4 text-left">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium shadow"
              >
                {loading ? "Generating..." : "Generate Website"}
              </button>
            </div>

            {/* LOADER */}
            <div id="loader" className="hidden h-1 bg-gray-200 dark:bg-gray-800">
              <div id="progress" className="h-1 bg-primary w-0"></div>
            </div>

            {/* STATUS */}
            <div id="steps" className="hidden text-left px-4 py-3 text-sm text-gray-500 space-y-1">
              <div>Generating layout...</div>
              <div id="s2" className="hidden">Writing content...</div>
              <div id="s3" className="hidden">Finalising design...</div>
            </div>

          </div>

        </section>

        {/* CTA */}
        <section className="text-center py-24 bg-primary text-white">
          <h2 className="text-3xl font-semibold mb-6">Start building today</h2>
          <button className="bg-white text-primary px-8 py-3 rounded-lg shadow">
            Get Started
          </button>
        </section>

      </div>
    </>
  );
}