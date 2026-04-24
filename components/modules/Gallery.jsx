export default function Gallery({ data }) {
  return (
    <section className="p-10">
      <h2 className="text-3xl font-semibold text-center mb-6">
        {data.title || "Gallery"}
      </h2>

      <div className="grid md:grid-cols-3 gap-4">
        {(data.images || []).map((img, i) => (
          <img
            key={i}
            src={img}
            alt=""
            className="w-full h-48 object-cover rounded"
          />
        ))}
      </div>
    </section>
  );
}