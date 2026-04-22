export default function SitePage({ site }) {
  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>{site.businessName}</h1>

      <h2>{site.content.home.hero.title}</h2>
      <p>{site.content.home.hero.subtitle}</p>

      <button>{site.content.home.hero.cta}</button>

      <div style={{ marginTop: 20 }}>
        {site.content.home.features.items.map((f, i) => (
          <div key={i}>{f}</div>
        ))}
      </div>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  // TEMP INLINE GENERATION (NO STORAGE DEPENDENCY)
  const siteId = params.slug;

  const site = {
    siteId,
    businessName: siteId,
    pages: ["home"],
    structure: {
      home: ["hero", "features", "cta"]
    },
    content: {
      home: {
        hero: {
          title: siteId,
          subtitle: "Generated site",
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
      site
    }
  };
}