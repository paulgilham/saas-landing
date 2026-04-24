import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { modules } from "../../lib/modules";
import { validateModule } from "../../lib/validateModule";
import { applyFallbacks } from "../../lib/contentSchema";

export default function SitePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [site, setSite] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const load = async () => {
      const res = await fetch(`/api/site?slug=${slug}`);
      const data = await res.json();
      setSite(data.site);
    };

    load();
  }, [slug]);

  const renderModules = () => {
    const structure = site?.structure?.home || [];

    return structure.map((moduleName, i) => {
      const Component = modules[moduleName];
      if (!Component) return null;

      const raw = site?.content?.home?.[moduleName];

      const valid = validateModule(moduleName, raw);
      if (!valid) return null;

      const data = applyFallbacks(moduleName, valid);

      return (
        <div key={i}>
          {Component(data)}
        </div>
      );
    });
  };

  if (!site) return <div>Loading...</div>;

  return <div>{renderModules()}</div>;
}