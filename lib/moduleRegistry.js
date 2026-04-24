import Hero from "@/components/modules/Hero";
import Services from "@/components/modules/Services";
import Features from "@/components/modules/Features";
import Testimonials from "@/components/modules/Testimonials";
import CTA from "@/components/modules/CTA";
import Contact from "@/components/modules/Contact";

import Pricing from "@/components/modules/Pricing";
import FAQ from "@/components/modules/FAQ";
import Gallery from "@/components/modules/Gallery";
import Booking from "@/components/modules/Booking";
import About from "@/components/modules/About";

// -----------------------------
// SINGLE SOURCE OF TRUTH (RENDER LAYER)
// -----------------------------
export const moduleRegistry = {
  hero: Hero,
  services: Services,
  features: Features,
  testimonials: Testimonials,
  cta: CTA,
  contact: Contact,

  // NEW BLUEPRINT MODULES
  pricing: Pricing,
  faq: FAQ,
  gallery: Gallery,
  booking: Booking,
  about: About
};