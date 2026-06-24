import items from "./cityGrid.data";
import { Card } from "@/components/ui/card";

export default function CityGridSlot() {
  return (
    <section data-region="city-grid" className="bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-8 sm:px-12 lg:px-16">
        <h2 className="mb-8 text-3xl font-bold text-slate-900 lg:text-4xl">
          Explore by City
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((item) => (
            <a key={item.label} href={item.href}>
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <div
                  className="relative aspect-[4/3] bg-cover bg-center bg-slate-100"
                  style={{ backgroundImage: `url(${item.image})` }}
                  aria-hidden="true"
                >
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-slate-700">
                    {item.bestSeason}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {item.label}
                  </h3>
                  <p className="text-sm font-medium text-blue-700">{item.labelZh}</p>
                  <p className="mt-1.5 line-clamp-2 text-sm text-slate-500">
                    {item.description}
                  </p>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
