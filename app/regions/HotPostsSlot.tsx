import items from "./hotPosts.data";
import { Card } from "@/components/ui/card";

export default function HotPostsSlot() {
  const [featured, ...rest] = items.slice(0, 3);

  return (
    <section data-region="hot-posts" className="bg-slate-50">
      <div className="mx-auto max-w-6xl px-8 sm:px-12 lg:px-16">
        <h2 className="mb-8 text-3xl font-bold text-slate-900 lg:text-4xl">
          Stories from the Road
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Large featured card */}
          <a href={featured.href} className="md:col-span-2">
            <Card className="h-full overflow-hidden transition-shadow hover:shadow-lg">
              <div
                className="relative aspect-[16/9] bg-cover bg-center bg-slate-100"
                style={{ backgroundImage: `url(${featured.image})` }}
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" aria-hidden="true" />
              </div>
              <div className="p-6">
                <h3 className="mb-2 text-2xl font-bold text-slate-900">
                  {featured.title}
                </h3>
                <p className="mb-2 text-sm text-slate-500">
                  {featured.location}
                </p>
                <p className="text-slate-600">{featured.excerpt}</p>
              </div>
            </Card>
          </a>
          {/* Small cards stack */}
          <div className="flex flex-col gap-6">
            {rest.map((item) => (
              <a key={item.title} href={item.href}>
                <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                  <div className="flex gap-4 p-4">
                    <div
                      className="aspect-square w-24 flex-shrink-0 overflow-hidden rounded bg-cover bg-center bg-slate-100"
                      style={{ backgroundImage: `url(${item.image})` }}
                      aria-hidden="true"
                    />
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-500">{item.location}</p>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
