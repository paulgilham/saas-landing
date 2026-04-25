export default function FAQ({ data }) {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {data.title || "Frequently Asked Questions"}
        </h2>
        <div className="space-y-4">
          {(data.items || []).map((item, i) => (
            <div key={i} className="border border-gray-200 rounded-xl p-5 hover:border-primary transition-colors">
              <h3 className="font-semibold text-gray-900 mb-2">{item.question}</h3>
              <p className="text-sm text-gray-500">{item.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
