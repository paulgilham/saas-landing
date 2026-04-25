export default function Pricing({ data }) {
  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {data.title || "Pricing"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(data.items || []).map((item, i) => (
            <div key={i} className={`rounded-2xl p-6 border text-center ${i === 1 ? "bg-primary text-white border-primary shadow-xl scale-105" : "bg-white border-gray-200"}`}>
              <h3 className={`font-bold text-lg mb-2 ${i === 1 ? "text-white" : "text-gray-900"}`}>
                {item.title || ""}
              </h3>
              <div className={`text-3xl font-bold mb-4 ${i === 1 ? "text-white" : "text-primary"}`}>
                {item.price || ""}
              </div>
              <p className={`text-sm mb-6 ${i === 1 ? "text-indigo-200" : "text-gray-500"}`}>
                {item.description || ""}
              </p>
              <button className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${i === 1 ? "bg-white text-primary hover:bg-indigo-50" : "bg-primary text-white hover:bg-indigo-700"}`}>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
