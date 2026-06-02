export type HotSpotItem = {
  name: string;
  nameZh: string;
  href: string;
  image: string;
  tags: string[];
};

const items: readonly HotSpotItem[] = [
  { name: "Zhangjiajie Glass Bridge", nameZh: "张家界玻璃桥", href: "#", image: "https://picsum.photos/400/300?random=30", tags: ["Nature", "Thrill"] },
  { name: "Yuanyang Rice Terraces", nameZh: "元阳梯田", href: "#", image: "https://picsum.photos/400/300?random=31", tags: ["Nature", "Photography"] },
  { name: "Dunhuang Mogao Caves", nameZh: "敦煌莫高窟", href: "#", image: "https://picsum.photos/400/300?random=32", tags: ["History", "Art"] },
  { name: "Fenghuang Ancient Town", nameZh: "凤凰古城", href: "#", image: "https://picsum.photos/400/300?random=33", tags: ["Culture", "Architecture"] },
  { name: "Daocheng Yading", nameZh: "稻城亚丁", href: "#", image: "https://picsum.photos/400/300?random=34", tags: ["Nature", "Hiking"] },
  { name: "Pingyao Old Town", nameZh: "平遥古城", href: "#", image: "https://picsum.photos/400/300?random=35", tags: ["History", "Architecture"] },
  { name: "Hukou Waterfall", nameZh: "壶口瀑布", href: "#", image: "https://picsum.photos/400/300?random=36", tags: ["Nature", "Photography"] },
  { name: "Tiger Leaping Gorge", nameZh: "虎跳峡", href: "#", image: "https://picsum.photos/400/300?random=37", tags: ["Nature", "Hiking"] },
];

export default items;
