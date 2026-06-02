import featureNavItems from "./featureNav.data";
import { MapPin, BookOpen, Compass, Sparkles } from "lucide-react";

const iconMap = { MapPin, BookOpen, Compass, Sparkles } as const;

export default function FeatureNavSlot() {
  return (
    <section data-region="feature-nav" className="bg-slate-50 py-12">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 md:grid-cols-4">
        {featureNavItems.map((item) => {
          const Icon = iconMap[item.icon];
          return (
            <a
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <Icon className="h-8 w-8 text-blue-700" />
              <span className="font-medium text-slate-900">{item.label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
