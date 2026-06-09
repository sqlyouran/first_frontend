import hero from "./hero.data";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function HeroSlot() {
  return (
    <section
      data-region="hero"
      className="relative h-[600px] bg-cover bg-center bg-slate-800"
      style={{ backgroundImage: `url(${hero.backgroundImage})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />
      <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-start justify-center px-6">
        <h1 className="mb-4 text-5xl font-bold text-white lg:text-6xl">
          {hero.title}
        </h1>
        <p className="mb-8 text-xl text-white/90">{hero.subtitle}</p>
        <div className="flex w-full max-w-md gap-2">
          <Input
            type="text"
            placeholder={hero.searchPlaceholder}
            className="flex-1 bg-white/90 backdrop-blur"
          />
          <Button size="icon" className="bg-blue-700 hover:bg-blue-800">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
