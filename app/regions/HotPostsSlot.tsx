import items from "./hotPosts.data";

export default function HotPostsSlot() {
  return (
    <section data-region="hot-posts">
      {items.map((it) => (
        <a key={it.label} href={it.href}>
          {it.label}
        </a>
      ))}
    </section>
  );
}
