"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "./TagInput";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

interface PostFormProps {
  onSubmit: (data: PostFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export interface PostFormData {
  title: string;
  content: string;
  cover_image: string | null;
  tags: string[];
  status: string;
}

interface FormErrors {
  title?: string;
  content?: string;
  cover_image?: string;
}

export function PostForm({ onSubmit, isSubmitting = false }: PostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [status, setStatus] = useState("published");
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!title.trim()) {
      newErrors.title = "标题不能为空";
    } else if (title.length > 200) {
      newErrors.title = "标题不能超过 200 字符";
    }

    if (!content.trim()) {
      newErrors.content = "正文不能为空";
    } else if (content.length > 50000) {
      newErrors.content = "正文不能超过 50000 字符";
    }

    if (coverImage && !/^https?:\/\/.+$/.test(coverImage)) {
      newErrors.cover_image = "封面图必须是有效的 URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    await onSubmit({
      title: title.trim(),
      content,
      cover_image: coverImage.trim() || null,
      tags,
      status,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="p-8 shadow-sm border border-slate-200">
        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">
              标题 <span className="text-red-500">*</span>
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入帖子标题"
              maxLength={200}
            />
            {errors.title && (
              <p className="text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Markdown Editor */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium text-slate-700">
              正文 <span className="text-red-500">*</span>
            </label>
            <div data-color-mode="light" className="overflow-hidden rounded-lg border border-slate-200">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || "")}
                height={400}
                preview="live"
              />
            </div>
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content}</p>
            )}
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label htmlFor="cover_image" className="text-sm font-medium text-slate-700">
              封面图 URL
            </label>
            <Input
              id="cover_image"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              maxLength={2048}
            />
            {errors.cover_image && (
              <p className="text-sm text-red-600">{errors.cover_image}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">标签</label>
            <TagInput value={tags} onChange={setTags} />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              发布状态
            </label>
            <Select value={status} onValueChange={(val) => { if (val) setStatus(val); }}>
              <SelectTrigger className="w-full" aria-label="发布状态">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">发布</SelectItem>
                <SelectItem value="draft">草稿</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-700 hover:bg-blue-800 text-white gap-2"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "发布中..." : "发布帖子"}
      </Button>
    </form>
  );
}
