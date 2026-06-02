export type CityGridItem = {
  label: string;
  labelZh: string;
  href: string;
  image: string;
  description: string;
  bestSeason: string;
};

const items: readonly CityGridItem[] = [
  { label: "Beijing", labelZh: "北京", href: "#", image: "https://picsum.photos/800/600?random=10", description: "Ancient capital with imperial grandeur", bestSeason: "Autumn" },
  { label: "Shanghai", labelZh: "上海", href: "#", image: "https://picsum.photos/800/600?random=11", description: "Modern metropolis on the Huangpu", bestSeason: "Spring" },
  { label: "Chengdu", labelZh: "成都", href: "#", image: "https://picsum.photos/800/600?random=12", description: "Home of pandas and spicy cuisine", bestSeason: "Spring" },
  { label: "Xi'an", labelZh: "西安", href: "#", image: "https://picsum.photos/800/600?random=13", description: "Terracotta warriors and Silk Road heritage", bestSeason: "Autumn" },
  { label: "Hangzhou", labelZh: "杭州", href: "#", image: "https://picsum.photos/800/600?random=14", description: "West Lake and tea plantations", bestSeason: "Spring" },
  { label: "Guilin", labelZh: "桂林", href: "#", image: "https://picsum.photos/800/600?random=15", description: "Karst mountains and Li River cruises", bestSeason: "Summer" },
  { label: "Lijiang", labelZh: "丽江", href: "#", image: "https://picsum.photos/800/600?random=16", description: "Naxi old town and Jade Dragon Snow Mountain", bestSeason: "Winter" },
  { label: "Xiamen", labelZh: "厦门", href: "#", image: "https://picsum.photos/800/600?random=17", description: "Coastal charm and Gulangyu Island", bestSeason: "Autumn" },
];

export default items;
