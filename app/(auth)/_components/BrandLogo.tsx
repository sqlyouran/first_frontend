import { Compass } from "lucide-react";

export default function BrandLogo() {
  return (
    <div className="flex items-center gap-2">
      <Compass className="h-6 w-6" data-testid="brand-logo-icon" />
      <span className="font-heading text-xl font-bold">Wanderchina</span>
    </div>
  );
}
