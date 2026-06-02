import items from "./cityGrid.data";

export default function CityGridSlot() {
  return (
    <section data-region="city-grid">
      {items.map((it) => (
        <a key={it.label} href={it.href}>
          {it.label}
        </a>
      ))}
    </section>
  );
}
