export default function Features({ data }) {
  return (
    <section className="grid grid-cols-2 gap-4 p-6">
      {(data.items || []).map((item, i) => (
        <div key={i} className="p-4 bg-gray-100 rounded">
          {item}
        </div>
      ))}
    </section>
  );
}
