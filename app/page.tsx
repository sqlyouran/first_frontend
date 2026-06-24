import HeroSlot from "./regions/HeroSlot";
import FeatureNavSlot from "./regions/FeatureNavSlot";
import CityGridSlot from "./regions/CityGridSlot";
import HotPostsSlot from "./regions/HotPostsSlot";
import HotSpotsSlot from "./regions/HotSpotsSlot";
import AiLauncherSlot from "./regions/AiLauncherSlot";

export default function Home() {
  return (
    <>
      <HeroSlot />
      <FeatureNavSlot />
      <CityGridSlot />
      <HotPostsSlot />
      <HotSpotsSlot />
      <AiLauncherSlot />
    </>
  );
}
