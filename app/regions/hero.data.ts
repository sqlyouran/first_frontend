export type HeroContent = {
  title: string;
  subtitle: string;
  /** Reserved for future CTA button (visual-v1 uses search input instead) */
  ctaLabel: string;
  /** Reserved for future CTA navigation (visual-v1 uses search input instead) */
  ctaHref: string;
  searchPlaceholder: string;
  backgroundImage: string;
};

const hero: HeroContent = {
  title: "Wander Beyond the Postcard.",
  subtitle: "Discover the China that travel guides miss.",
  ctaLabel: "Start Exploring",
  ctaHref: "#",
  searchPlaceholder: "Where would you like to go?",
  backgroundImage: "https://picsum.photos/1920/1080?random=1",
};

export default hero;
