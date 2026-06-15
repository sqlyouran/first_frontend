export type HotPostItem = {
  title: string;
  location: string;
  href: string;
  image: string;
  excerpt: string;
};

const items: readonly HotPostItem[] = [
  { title: "3-Day Yunnan Hidden Tea Trail", location: "云南", href: "/posts/3-day-yunnan-hidden-tea-trail-demo1", image: "https://picsum.photos/800/600?random=20", excerpt: "Discover ancient tea villages beyond the tourist path." },
  { title: "Beijing Hutong Coffee Crawl", location: "北京", href: "/posts/beijing-hutong-coffee-crawl-demo2", image: "https://picsum.photos/800/600?random=21", excerpt: "Where tradition meets third-wave coffee culture." },
  { title: "Silk Road Sunrise: Xi'an to Dunhuang", location: "甘肃", href: "/posts/silk-road-sunrise-xian-to-dunhuang-demo3", image: "https://picsum.photos/800/600?random=22", excerpt: "Chasing dawn across 1,500km of desert highway." },
  { title: "Chengdu's Late-Night Food Map", location: "成都", href: "/posts/chengdus-late-night-food-map-demo4", image: "https://picsum.photos/800/600?random=23", excerpt: "Hotpot, skewers, and street food after midnight." },
  { title: "Hangzhou's West Lake at Dawn", location: "杭州", href: "/posts/hangzhous-west-lake-at-dawn-demo5", image: "https://picsum.photos/800/600?random=24", excerpt: "Why 6am is the magic hour for China's most famous lake." },
  { title: "Guilin's Karst by Kayak", location: "桂林", href: "/posts/guilins-karst-by-kayak-demo6", image: "https://picsum.photos/800/600?random=25", excerpt: "Paddling the Li River without the tour groups." },
];

export default items;
