export default function Testimonials({ data }) {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {data.title || "What Our Customers Say"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(data.items || []).map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <p className="text-gray-600 italic mb-4">
                "{item.text || item.quote || ""}"
              </p>
              {item.name && (
                <div className="font-semibold text-gray-900 text-sm">
                  — {item.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
