"use client";

import type { InterestTag } from "@/lib/api/profile";

interface TagSelectorProps {
  tags: InterestTag[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxSelections?: number;
}

export default function TagSelector({
  tags,
  selected,
  onChange,
  maxSelections = 10,
}: TagSelectorProps) {
  const grouped = tags.reduce<Record<string, InterestTag[]>>((acc, tag) => {
    const cat = tag.category;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tag);
    return acc;
  }, {});

  function toggleTag(name: string) {
    if (selected.includes(name)) {
      onChange(selected.filter((t) => t !== name));
    } else if (selected.length < maxSelections) {
      onChange([...selected, name]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(grouped).map(([category, categoryTags]) => (
        <div key={category}>
          <p className="mb-2 text-xs font-medium capitalize text-muted-foreground">
            {category}
          </p>
          <div className="flex flex-wrap gap-2">
            {categoryTags.map((tag) => {
              const isSelected = selected.includes(tag.value);
              const isDisabled = !isSelected && selected.length >= maxSelections;

              return (
                <button
                  key={tag.value}
                  type="button"
                  data-selected={isSelected}
                  disabled={isDisabled}
                  onClick={() => toggleTag(tag.value)}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-primary text-primary-foreground"
                      : isDisabled
                        ? "cursor-not-allowed bg-muted text-muted-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {tag.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
