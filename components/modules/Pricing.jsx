export default function Pricing({ data }) {
  return (
    <section className="p-10 text-center">
      <h2 className="text-3xl font-semibold mb-6">
        {data.title || "Pricing"}
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {(data.items || []).map((item, i) => (
          <div key={i} className="border p-6 rounded">
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
            <div className="mt-2 font-semibold">{item.price}</div>
          </div>
        ))}
      </div>
    </section>
  );
}