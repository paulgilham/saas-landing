export default function Features({ data }) {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {data.title || "Features"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(data.items || []).map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-gray-900 mb-2">
                {item.title || item}
              </h3>
              {item.description && (
                <p className="text-sm text-gray-500">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
