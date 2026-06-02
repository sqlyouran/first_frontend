import featureNavItems from "./featureNav.data";

export default function FeatureNavSlot() {
  return (
    <section data-region="feature-nav" aria-label="feature-nav placeholder">
      {featureNavItems.map((item) => (
        <a key={item.label} href={item.href}>
          {item.label}
        </a>
      ))}
    </section>
  );
}
