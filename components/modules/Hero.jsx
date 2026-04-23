export default function Hero({ data }) {
  return (
    <section className="text-center py-24 px-6">
      <h1 className="text-4xl md:text-6xl font-semibold mb-6">
        {data.title || "Default Title"}
      </h1>

      <p className="text-gray-500 max-w-lg mx-auto mb-8">
        {data.subtitle || ""}
      </p>

      <button className="bg-primary text-white px-6 py-3 rounded-lg">
        {data.cta || "Get Started"}
      </button>
    </section>
  );
}
