export type FeatureNavItem = {
  label: string;
  href: string;
  icon: "MapPin" | "BookOpen" | "Compass" | "Sparkles";
};

const featureNavItems: readonly FeatureNavItem[] = [
  { label: "Cities", href: "#", icon: "MapPin" },
  { label: "Stories", href: "#", icon: "BookOpen" },
  { label: "Hidden Spots", href: "#", icon: "Compass" },
  { label: "Plan with AI", href: "#", icon: "Sparkles" },
];

export default featureNavItems;
