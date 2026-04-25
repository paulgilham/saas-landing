export default function CTA({ data }) {
  return (
    <section className="py-24 px-6 bg-primary text-white text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
          {data.title || "Ready to get started?"}
        </h2>
        <p className="text-indigo-200 mb-8 text-lg">
          {data.subtitle || ""}
        </p>
        <button className="bg-white text-primary font-semibold px-8 py-3 rounded-xl shadow hover:shadow-lg hover:scale-105 transition-all">
          {data.button || "Get Started"}
        </button>
      </div>
    </section>
  );
}
