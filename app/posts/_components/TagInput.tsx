"use client";

import { useState, type KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  maxTagLength?: number;
  placeholder?: string;
}

export function TagInput({
  value,
  onChange,
  maxTags = 10,
  maxTagLength = 30,
  placeholder = "输入标签后按回车添加",
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const tag = inputValue.trim();

      if (!tag) return;
      if (tag.length > maxTagLength) return;
      if (value.length >= maxTags) return;
      if (value.includes(tag)) {
        setInputValue("");
        return;
      }

      onChange([...value, tag]);
      setInputValue("");
    }
  };

  const removeTag = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length >= maxTags ? `已达上限（${maxTags} 个）` : placeholder}
        disabled={value.length >= maxTags}
        maxLength={maxTagLength}
      />

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((tag, index) => (
            <Badge key={`${tag}-${index}`} variant="secondary" className="gap-1 pr-1">
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-slate-300 transition-colors"
                aria-label={`删除标签 ${tag}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </Badge>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-500">
        {value.length} / {maxTags} 个标签，每个最多 {maxTagLength} 字符
      </p>
    </div>
  );
}
