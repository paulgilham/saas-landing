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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, tier: "medium" }),
      });

      const data = await res.json();

      if (!data.slug) {
        alert("Generation failed: missing slug");
        setLoading(false);
        return;
      }

      window.location.href = `/site/${data.slug}`;
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
        <meta name="description" content="Generate a real website from one sentence" />
      </Head>

      <div className="bg-white text-gray-900 font-sans dark:bg-gray-950 dark:text-white transition">

        {/* NAV */}
        <header className="sticky top-0 backdrop-blur bg-white/70 dark:bg-gray-950/70 border-b border-gray-200 dark:border-gray-800 z-50">
          <div className="flex justify-between items-center px-6 py-4 max-w-6xl mx-auto">

            <div className="font-bold tracking-tight text-primary">SiteForge</div>

            <div className="hidden md:flex gap-8 text-sm text-gray-500 dark:text-gray-400">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Contact</a>
            </div>

            <div className="flex items-center gap-3">
              <button className="text-lg hover:opacity-70 transition-opacity">🌙</button>
              <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
                Login
              </button>
              <button className="md:hidden text-2xl">☰</button>
            </div>

          </div>
        </header>

        {/* HERO */}
        <section className="text-center py-28 px-6">

          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight mb-6 leading-tight">
            Generate a <span className="text-primary">Real Website</span><br />
            From One Sentence
          </h1>

          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-10 text-lg">
            Type your business. Watch it build live.
          </p>

          <div className="max-w-3xl mx-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">

            {/* INPUT ROW */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 text-left">
              <input
                id="promptInput"
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary transition"
                placeholder="e.g. A plumbing business in Brisbane..."
              />
            </div>

            {/* BUTTON ROW */}
            <div className="p-4 text-left bg-white dark:bg-gray-900">
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Generating..." : "Generate Website"}
              </button>
            </div>

            {/* PROGRESS BAR */}
            <div id="loader" className="hidden h-1 bg-gray-100 dark:bg-gray-800">
              <div
                id="progress"
                className="h-1 bg-primary w-0 transition-all duration-150"
              />
            </div>

            {/* STEPS */}
            <div id="steps" className="hidden text-left px-4 py-3 text-sm text-gray-400 space-y-1 bg-white dark:bg-gray-900">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Generating layout...
              </div>
              <div id="s2" className="hidden flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Writing content...
              </div>
              <div id="s3" className="hidden flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Finalising design...
              </div>
            </div>

          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 px-6 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-semibold tracking-tight mb-3">Everything you need</h2>
            <p className="text-gray-500 dark:text-gray-400">Built for speed. Designed to convert.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { icon: "⚡", title: "Instant Generation", desc: "Your website is live in under 30 seconds." },
              { icon: "✦", title: "AI-Powered Copy", desc: "Smart content written for your exact business." },
              { icon: "🎨", title: "Beautiful Design", desc: "Professional layouts that look custom-built." },
            ].map((f) => (
              <div key={f.title} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-left">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-24 px-6 bg-primary text-white">
          <h2 className="text-3xl font-semibold mb-4 tracking-tight">Start building today</h2>
          <p className="text-indigo-200 mb-8 max-w-md mx-auto">
            Join thousands of businesses who launched with SiteForge.
          </p>
          <button className="bg-white text-primary font-semibold px-8 py-3 rounded-lg shadow hover:shadow-lg hover:scale-105 transition-all">
            Get Started Free
          </button>
        </section>

        {/* FOOTER */}
        <footer className="text-center py-8 text-sm text-gray-400 border-t border-gray-100 dark:border-gray-800">
          © {new Date().getFullYear()} SiteForge. All rights reserved.
        </footer>

      </div>
    </>
  );
}
