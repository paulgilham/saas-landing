export const modules = {

  hero: ({ headline, subtext, cta }) => (
    <section className="text-center py-24 px-6">
      <h1 className="text-4xl md:text-6xl font-semibold mb-6">
        {headline}
      </h1>
      <p className="text-gray-500 max-w-lg mx-auto mb-8">
        {subtext}
      </p>
      <button className="bg-primary text-white px-6 py-3 rounded-lg">
        {cta}
      </button>
    </section>
  ),

  services: ({ title, items = [] }) => (
    <section className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        {title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((i, idx) => (
          <div key={idx} className="p-4 bg-gray-50 border rounded">
            <h3 className="font-semibold">{i.title}</h3>
            <p className="text-gray-600">{i.description}</p>
          </div>
        ))}
      </div>
    </section>
  ),

  testimonials: ({ title, items = [] }) => (
    <section className="p-10 bg-gray-100 text-center">
      <h2 className="text-2xl font-semibold mb-6">{title}</h2>

      {items.map((i, idx) => (
        <div key={idx} className="mb-4 italic">
          “{i.quote}”
          <div className="text-sm mt-1">- {i.author}</div>
        </div>
      ))}
    </section>
  ),

  cta: ({ headline, buttonText }) => (
    <section className="text-center py-20 bg-primary text-white">
      <h2 className="text-3xl font-semibold mb-4">
        {headline}
      </h2>
      <button className="bg-white text-primary px-6 py-3 rounded-lg">
        {buttonText}
      </button>
    </section>
  ),

  contact: ({ title, phone, email }) => (
    <section className="p-10 text-center">
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      {phone && <p>{phone}</p>}
      {email && <p>{email}</p>}
    </section>
  )
};