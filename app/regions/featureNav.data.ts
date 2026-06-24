export type FeatureNavItem = {
  label: string;
  href: string;
  icon: "MapPin" | "BookOpen" | "Compass" | "Sparkles";
  description: string;
};

const featureNavItems: readonly FeatureNavItem[] = [
  { label: "Cities", href: "#", icon: "MapPin", description: "Browse iconic and off-map destinations" },
  { label: "Stories", href: "#", icon: "BookOpen", description: "Deep-dive itineraries from real travelers" },
  { label: "Hidden Spots", href: "#", icon: "Compass", description: "Discover places no guidebook mentions" },
  { label: "Plan with AI", href: "#", icon: "Sparkles", description: "Build your perfect itinerary in minutes" },
];

export default featureNavItems;
