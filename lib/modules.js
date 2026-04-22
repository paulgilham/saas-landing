export const modules = {

  hero: (data) => `
    <section class="text-center py-24 px-6">
      <h1 class="text-4xl md:text-6xl font-semibold mb-6">
        ${data.title || "Default Title"}
      </h1>
      <p class="text-gray-500 max-w-lg mx-auto mb-8">
        ${data.subtitle || ""}
      </p>
      <button class="bg-primary text-white px-6 py-3 rounded-lg">
        ${data.cta || "Get Started"}
      </button>
    </section>
  `,

  features: (data) => `
    <section class="grid grid-cols-2 gap-4 p-6">
      ${(data.items || []).map(i => `
        <div class="p-4 bg-gray-100 rounded">${i}</div>
      `).join("")}
    </section>
  `,

  cta: (data) => `
    <section class="text-center py-20 bg-primary text-white">
      <h2 class="text-3xl font-semibold mb-4">${data.title || "Ready?"}</h2>
      <button class="bg-white text-primary px-6 py-3 rounded-lg">
        ${data.button || "Start"}
      </button>
    </section>
  `,

  contact: () => `
    <section class="p-10 text-center">
      <p>Contact us today</p>
    </section>
  `
};