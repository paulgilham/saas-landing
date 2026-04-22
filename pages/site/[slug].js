import { getSite } from "../../data/sites";
import { modules } from "../../lib/modules";

export default function Site({ blueprint }) {

  function renderPage() {
    const structure = blueprint.structure.home;
    const content = blueprint.content.home;

    return structure.map(m => {
      const fn = modules[m];
      return fn(content[m] || {});
    }).join("");
  }

  return (
    <div dangerouslySetInnerHTML={{ __html: renderPage() }} />
  );
}

export async function getServerSideProps(context) {
  const { slug } = context.params;

  const blueprint = getSite(slug) || null;

  return {
    props: { blueprint }
  };
}