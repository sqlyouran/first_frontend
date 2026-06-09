import items from "./hotSpots.data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HotSpotsSlot() {
  return (
    <section data-region="hot-spots">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-900 lg:text-4xl">
            Off-the-Beaten-Path Spots
          </h2>
          <a
            href="#all-spots"
            className="font-medium text-blue-700 hover:text-blue-800"
          >
            See all →
          </a>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible">
          {items.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="w-64 flex-shrink-0 snap-start md:w-auto"
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <div
                  className="aspect-[4/3] bg-cover bg-center bg-slate-100"
                  style={{ backgroundImage: `url(${item.image})` }}
                  aria-hidden="true"
                />
                <div className="p-4">
                  <h3 className="mb-1 text-lg font-semibold text-slate-900">
                    {item.name}
                  </h3>
                  <p className="mb-2 text-sm text-slate-500">{item.nameZh}</p>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
