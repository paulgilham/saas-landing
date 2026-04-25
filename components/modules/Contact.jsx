export default function Contact({ data }) {
  return (
    <section className="py-20 px-6 bg-white text-center">
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {data.title || "Get In Touch"}
        </h2>
        <p className="text-gray-500 mb-8">
          {data.text || "We'd love to hear from you."}
        </p>
        {data.email && (
          <a href={`mailto:${data.email}`} className="block text-primary font-medium hover:underline mb-2">
            {data.email}
          </a>
        )}
        {data.phone && (
          <a href={`tel:${data.phone}`} className="block text-primary font-medium hover:underline">
            {data.phone}
          </a>
        )}
      </div>
    </section>
  );
}
