export default function Booking({ data }) {
  return (
    <section className="p-10 text-center">
      <h2 className="text-3xl font-semibold mb-4">
        {data.title || "Book Now"}
      </h2>

      <button className="bg-primary text-white px-6 py-3 rounded">
        {data.cta || "Schedule Appointment"}
      </button>
    </section>
  );
}