"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { MessageCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores/auth";
import { createConversation } from "@/lib/api/messages";

interface SendMessageButtonProps {
  recipientUsername: string;
}

export function SendMessageButton({ recipientUsername }: SendMessageButtonProps) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [loading, setLoading] = useState(false);

  // Don't render if not logged in or viewing own profile
  if (!isAuthenticated || !user || user.username === recipientUsername) {
    return null;
  }

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await createConversation(recipientUsername, "Hi!");
      if (res.status === 201 && res.data) {
        router.push(`/messages/${res.data.conversation_id}`);
      } else if (res.error) {
        toast.error(res.error.message || "Failed to start conversation");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-1.5"
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <MessageCircle className="size-4" />
      )}
      Send Message
    </Button>
  );
}
