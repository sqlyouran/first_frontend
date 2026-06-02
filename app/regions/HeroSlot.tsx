import hero from "./hero.data";

export default function HeroSlot() {
  return (
    <section data-region="hero">
      <h1>{hero.title}</h1>
      <button type="button" data-cta-href={hero.ctaHref}>
        {hero.ctaLabel}
      </button>
    </section>
  );
}
