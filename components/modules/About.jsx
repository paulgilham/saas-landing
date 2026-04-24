export default function About({ data }) {
  return (
    <section className="p-10 max-w-3xl mx-auto text-center">
      <h2 className="text-3xl font-semibold mb-4">
        {data.title || "About Us"}
      </h2>

      <p className="text-gray-600">
        {data.text || ""}
      </p>
    </section>
  );
}