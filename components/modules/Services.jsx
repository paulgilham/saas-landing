export default function Services({ data }) {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {data.title || "Our Services"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data.items || []).map((item, i) => (
            <div key={i} className="p-6 bg-gray-50 border border-gray-200 rounded-2xl hover:border-primary transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">
                {item.service || item.title || ""}
              </h3>
              <p className="text-sm text-gray-500">
                {item.description || ""}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
