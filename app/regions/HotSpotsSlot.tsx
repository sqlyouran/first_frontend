import items from "./hotSpots.data";

export default function HotSpotsSlot() {
  return (
    <section data-region="hot-spots">
      {items.map((it) => (
        <a key={it.label} href={it.href}>
          {it.label}
        </a>
      ))}
    </section>
  );
}
