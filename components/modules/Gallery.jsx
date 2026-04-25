export default function Gallery({ data }) {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {data.title || "Gallery"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(data.images || []).map((img, i) => (
            <img key={i} src={img} alt="" className="w-full h-56 object-cover rounded-2xl shadow-sm" />
          ))}
        </div>
      </div>
    </section>
  );
}
