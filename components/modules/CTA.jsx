export default function CTA({ data }) {
  return (
    <section className="text-center py-20 bg-primary text-white">
      <h2 className="text-3xl font-semibold mb-4">
        {data.title || "Ready?"}
      </h2>

      <button className="bg-white text-primary px-6 py-3 rounded-lg">
        {data.button || "Start"}
      </button>
    </section>
  );
}
