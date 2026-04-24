export default function Services({ data }) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
      {(data.items || []).map((item, i) => (
        <div key={i} className="p-4 bg-gray-50 border rounded">
          <h3 className="font-semibold mb-1">
            {item.title || ""}
          </h3>
          <p className="text-gray-600">
            {item.description || ""}
          </p>
        </div>
      ))}
    </section>
  );
}