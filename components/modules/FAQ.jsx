export default function FAQ({ data }) {
  return (
    <section className="p-10">
      <h2 className="text-3xl font-semibold text-center mb-6">
        {data.title || "FAQ"}
      </h2>

      <div className="space-y-4">
        {(data.items || []).map((item, i) => (
          <div key={i} className="border p-4 rounded">
            <h3 className="font-semibold">{item.question}</h3>
            <p className="text-gray-600">{item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}