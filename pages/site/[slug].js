import { kv } from "@vercel/kv";

export async function getServerSideProps({ params }) {
  const { slug } = params;

  try {
    const site = await kv.get(slug);

    if (!site) {
      return {
        notFound: true
      };
    }

    return {
      props: {
        site
      }
    };
  } catch (err) {
    console.error("KV FETCH ERROR:", err);

    return {
      notFound: true
    };
  }
}

export default function SitePage({ site }) {
  const home = site?.content?.home;

  return (
    <div className="p-10 font-sans">
      <h1 className="text-3xl font-bold">
        {home?.hero?.title}
      </h1>

      <p className="text-gray-600 mt-2">
        {home?.hero?.subtitle}
      </p>

      <button className="mt-6 bg-black text-white px-4 py-2 rounded">
        {home?.hero?.cta}
      </button>

      <div className="grid grid-cols-2 gap-4 mt-10">
        {home?.features?.items?.map((item, i) => (
          <div key={i} className="p-4 border rounded">
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}