export type HotPostItem = {
  title: string;
  location: string;
  href: string;
  image: string;
  excerpt: string;
};

const items: readonly HotPostItem[] = [
  { title: "3-Day Yunnan Hidden Tea Trail", location: "云南", href: "#", image: "https://picsum.photos/800/600?random=20", excerpt: "Discover ancient tea villages beyond the tourist path." },
  { title: "Beijing Hutong Coffee Crawl", location: "北京", href: "#", image: "https://picsum.photos/800/600?random=21", excerpt: "Where tradition meets third-wave coffee culture." },
  { title: "Silk Road Sunrise: Xi'an to Dunhuang", location: "甘肃", href: "#", image: "https://picsum.photos/800/600?random=22", excerpt: "Chasing dawn across 1,500km of desert highway." },
  { title: "Chengdu's Late-Night Food Map", location: "成都", href: "#", image: "https://picsum.photos/800/600?random=23", excerpt: "Hotpot, skewers, and street food after midnight." },
  { title: "Hangzhou's West Lake at Dawn", location: "杭州", href: "#", image: "https://picsum.photos/800/600?random=24", excerpt: "Why 6am is the magic hour for China's most famous lake." },
  { title: "Guilin's Karst by Kayak", location: "桂林", href: "#", image: "https://picsum.photos/800/600?random=25", excerpt: "Paddling the Li River without the tour groups." },
];

export default items;
