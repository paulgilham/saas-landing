export default function Hero({ data }) {
  return (
    <section className="text-center py-24 px-6 bg-white">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
        {data.title || "Welcome"}
      </h1>
      <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
        {data.subtitle || ""}
      </p>
      <button className="bg-primary text-white px-8 py-3 rounded-xl text-sm font-semibold shadow-lg hover:bg-indigo-700 transition-colors">
        {data.cta || "Get Started"}
      </button>
    </section>
  );
}
