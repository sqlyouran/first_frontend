import { Star, Eye, Bookmark, Calendar, MapPin, Tag } from "lucide-react";

export interface SpotInfoData {
  city_name: string;
  name: string;
  name_zh: string;
  status: string;
  rating: string;
  view_count: number;
  bookmark_count: number;
  created_at: string;
}

interface SpotInfoProps {
  spot: SpotInfoData;
}

const infoRows = [
  {
    key: "city",
    label: "城市",
    icon: MapPin,
    render: (s: SpotInfoData) => s.city_name,
  },
  {
    key: "name_en",
    label: "英文名",
    icon: Tag,
    render: (s: SpotInfoData) => s.name,
  },
  {
    key: "name_zh",
    label: "中文名",
    icon: Tag,
    render: (s: SpotInfoData) => s.name_zh,
  },
  {
    key: "status",
    label: "状态",
    icon: null,
    render: (s: SpotInfoData) => s.status,
  },
  {
    key: "rating",
    label: "评分",
    icon: Star,
    render: (s: SpotInfoData) => s.rating,
    iconClass: "text-amber-500",
  },
  {
    key: "view_count",
    label: "浏览量",
    icon: Eye,
    render: (s: SpotInfoData) => s.view_count.toLocaleString(),
  },
  {
    key: "bookmark_count",
    label: "收藏量",
    icon: Bookmark,
    render: (s: SpotInfoData) => s.bookmark_count.toLocaleString(),
  },
  {
    key: "created_at",
    label: "创建时间",
    icon: Calendar,
    render: (s: SpotInfoData) =>
      new Date(s.created_at).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
  },
];

export default function SpotInfo({ spot }: SpotInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
      {infoRows.map(({ key, label, icon: Icon, render, iconClass }) => (
        <div key={key} className="flex items-center gap-3 py-2">
          <span className="text-sm text-slate-500 w-20 flex-shrink-0">{label}</span>
          <span className="flex items-center gap-1.5 text-sm text-slate-900">
            {Icon && <Icon className={`h-4 w-4 ${iconClass ?? "text-slate-400"}`} />}
            {render(spot)}
          </span>
        </div>
      ))}
    </div>
  );
}
