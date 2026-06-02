export type FeatureNavItem = {
  label: string;
  href: string;
  icon: "MapPin" | "BookOpen" | "Compass" | "Sparkles";
};

const featureNavItems: readonly FeatureNavItem[] = [
  { label: "Cities", href: "#cities", icon: "MapPin" },
  { label: "Stories", href: "#stories", icon: "BookOpen" },
  { label: "Hidden Spots", href: "#spots", icon: "Compass" },
  { label: "Plan with AI", href: "#ai", icon: "Sparkles" },
];

export default featureNavItems;
