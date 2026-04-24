export default function Testimonials({ data }) {
  return (
    <section className="p-10 bg-gray-100 text-center space-y-4">
      {(data.items || []).map((item, i) => (
        <div key={i} className="italic">
          <p>{item.quote || ""}</p>
          {item.name && (
            <div className="font-semibold mt-2">
              {item.name}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}