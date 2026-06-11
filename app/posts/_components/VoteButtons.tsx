"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/stores/auth";
import { vote, fetchVoteStats, type VoteStatsData } from "@/lib/api/interactions";

interface VoteButtonsProps {
  postId: string;
  initialVoteStats: VoteStatsData;
}

export default function VoteButtons({ postId, initialVoteStats }: VoteButtonsProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [upCount, setUpCount] = useState(initialVoteStats.up_count);
  const [downCount, setDownCount] = useState(initialVoteStats.down_count);
  const [userVote, setUserVote] = useState(initialVoteStats.user_vote);
  const [loading, setLoading] = useState(false);

  // On mount, if logged in, re-fetch to get personal vote state
  useEffect(() => {
    if (isAuthenticated) {
      fetchVoteStats(postId).then((res) => {
        if (res.data) {
          setUpCount(res.data.up_count);
          setDownCount(res.data.down_count);
          setUserVote(res.data.user_vote);
        }
      });
    }
  }, [postId, isAuthenticated]);

  const handleVote = async (voteType: "up" | "down") => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    // Save previous state for rollback
    const prevUpCount = upCount;
    const prevDownCount = downCount;
    const prevUserVote = userVote;

    // Optimistic update
    setLoading(true);
    if (userVote === voteType) {
      // Toggle off
      setUserVote(null);
      if (voteType === "up") setUpCount((c) => c - 1);
      else setDownCount((c) => c - 1);
    } else if (userVote === null) {
      // New vote
      setUserVote(voteType);
      if (voteType === "up") setUpCount((c) => c + 1);
      else setDownCount((c) => c + 1);
    } else {
      // Switch vote type
      setUserVote(voteType);
      if (voteType === "up") {
        setUpCount((c) => c + 1);
        setDownCount((c) => c - 1);
      } else {
        setDownCount((c) => c + 1);
        setUpCount((c) => c - 1);
      }
    }

    const result = await vote(postId, voteType);

    if (result.status === 200 && result.data) {
      // Confirm with server response
      setUserVote(result.data.vote_type);
    } else {
      // Rollback
      setUpCount(prevUpCount);
      setDownCount(prevDownCount);
      setUserVote(prevUserVote);
      toast.error("投票失败，请重试");
    }

    setLoading(false);
  };

  const upActive = userVote === "up";
  const downActive = userVote === "down";

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => handleVote("up")}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          upActive
            ? "bg-blue-50 text-blue-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        aria-label="赞同"
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{upCount}</span>
      </button>

      <button
        onClick={() => handleVote("down")}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
          downActive
            ? "bg-blue-50 text-blue-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
        aria-label="不赞同"
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{downCount}</span>
      </button>
    </div>
  );
}
