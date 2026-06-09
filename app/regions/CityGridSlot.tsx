import items from "./cityGrid.data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CityGridSlot() {
  return (
    <section data-region="city-grid">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-8 text-3xl font-bold text-slate-900 lg:text-4xl">
          Explore by City
        </h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {items.map((item) => (
            <a key={item.label} href={item.href}>
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <div
                  className="aspect-[4/3] bg-cover bg-center bg-slate-100"
                  style={{ backgroundImage: `url(${item.image})` }}
                  aria-hidden="true"
                />
                <div className="p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {item.label}
                    </h3>
                    <Badge variant="secondary" className="text-xs">{item.bestSeason}</Badge>
                  </div>
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
