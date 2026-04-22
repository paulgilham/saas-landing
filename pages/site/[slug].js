import { getSite } from "../../data/sites";

export default function SitePage({ site }) {
  if (!site) {
    return <div>Site not found (memory reset)</div>;
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>{site.businessName || site.siteId}</h1>
      <p>Site loaded successfully</p>
    </div>
  );
}

export async function getServerSideProps({ params }) {
  const site = getSite(params.slug);

  return {
    props: {
      site: site || null
    }
  };
}