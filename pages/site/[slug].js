export default function SitePage({ site }) {
  if (!site) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif" }}>
        <h2>Site not found</h2>
        <p>This usually means the server memory reset (expected on Vercel).</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>{site.businessName}</h1>

      <h2>{site.content.home.hero.title}</h2>
      <p>{site.content.home.hero.subtitle}</p>

      <button>
        {site.content.home.cta.button}
      </button>

      <div style={{ marginTop: 20 }}>
        {site.content.home.features.items.map((f, i) => (
          <div key={i}>{f}</div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------
// SERVER SIDE LOAD
// -----------------------------
export async function getServerSideProps({ params }) {
  const siteId = params.slug;

  const site = global.sites?.[siteId] || null;

  return {
    props: {
      site
    }
  };
}