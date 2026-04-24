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

import ModuleWrapper from "@/components/modules/ModuleWrapper";

// -----------------------------
// WRAPPED MODULE REGISTRY
// -----------------------------
export const moduleRegistry = {
  hero: (props) => (
    <ModuleWrapper {...props}>
      <Hero {...props} />
    </ModuleWrapper>
  ),

  services: (props) => (
    <ModuleWrapper {...props}>
      <Services {...props} />
    </ModuleWrapper>
  ),

  features: (props) => (
    <ModuleWrapper {...props}>
      <Features {...props} />
    </ModuleWrapper>
  ),

  testimonials: (props) => (
    <ModuleWrapper {...props}>
      <Testimonials {...props} />
    </ModuleWrapper>
  ),

  cta: (props) => (
    <ModuleWrapper {...props}>
      <CTA {...props} />
    </ModuleWrapper>
  ),

  contact: (props) => (
    <ModuleWrapper {...props}>
      <Contact {...props} />
    </ModuleWrapper>
  ),

  pricing: (props) => (
    <ModuleWrapper {...props}>
      <Pricing {...props} />
    </ModuleWrapper>
  ),

  faq: (props) => (
    <ModuleWrapper {...props}>
      <FAQ {...props} />
    </ModuleWrapper>
  ),

  gallery: (props) => (
    <ModuleWrapper {...props}>
      <Gallery {...props} />
    </ModuleWrapper>
  ),

  booking: (props) => (
    <ModuleWrapper {...props}>
      <Booking {...props} />
    </ModuleWrapper>
  ),

  about: (props) => (
    <ModuleWrapper {...props}>
      <About {...props} />
    </ModuleWrapper>
  )
};