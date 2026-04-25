export default function Booking({ data }) {
  return (
    <section className="py-20 px-6 bg-primary text-white text-center">
      <div className="max-w-lg mx-auto">
        <h2 className="text-3xl font-bold mb-4">
          {data.title || "Book an Appointment"}
        </h2>
        <p className="text-indigo-200 mb-8">
          {data.subtitle || "Choose a time that works for you."}
        </p>
        <button className="bg-white text-primary font-semibold px-8 py-3 rounded-xl shadow hover:shadow-lg transition-all">
          {data.cta || "Schedule Appointment"}
        </button>
      </div>
    </section>
  );
}
