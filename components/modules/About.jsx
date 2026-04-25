export default function About({ data }) {
  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          {data.title || "About Us"}
        </h2>
        <p className="text-gray-500 text-lg leading-relaxed">
          {data.text || ""}
        </p>
      </div>
    </section>
  );
}
