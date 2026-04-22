export default function SitePage({ site, slug }) {
  // SAFE FALLBACK (prevents 500)
  if (!site) {
    return (
      <div style={{ padding: 40, fontFamily: "sans-serif" }}>
        <h1>Site: {slug}</h1>
        <p>⚠️ No stored data found for this site.</p>
        <p>This is expected until a database is connected.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>{site.businessName}</h1>

      <h2>{site.content?.home?.hero?.title}</h2>
      <p>{site.content?.home?.hero?.subtitle}</p>

      <button>
        {site.content?.home?.hero?.cta}
      </button>

      <div style={{ marginTop: 20 }}>
        {site.content?.home?.features?.items?.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>
    </div>
  );
}

// -----------------------------
// SAFE SSR (NO MEMORY DEPENDENCY)
// -----------------------------
export async function getServerSideProps({ params }) {
  const slug = params.slug;

  // TEMP SAFE MOCK (prevents crash)
  const site = {
    siteId: slug,
    businessName: slug,
    pages: ["home"],
    structure: {
      home: ["hero", "features", "cta"]
    },
    content: {
      home: {
        hero: {
          title: slug,
          subtitle: "Generated preview site",
          cta: "Get Started"
        },
        features: {
          items: ["Fast", "Simple", "AI Powered"]
        },
        cta: {
          title: "Start now",
          button: "Launch"
        }
      }
    }
  };

  return {
    props: {
      slug,
      site
    }
  };
}