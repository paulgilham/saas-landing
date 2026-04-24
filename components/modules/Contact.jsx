export default function Contact({ data }) {
  return (
    <section className="p-10 text-center">
      <p className="mb-2">{data.text || "Contact us"}</p>

      {data.phone && <p>{data.phone}</p>}
      {data.email && <p>{data.email}</p>}
    </section>
  );
}