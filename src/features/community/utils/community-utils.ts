import type { FeedPost } from "@/src/types/api/cinema";
import type { CommunityPost } from "../types/community";

export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error.response as {
      data?: { message?: string; error?: string };
    } | undefined)?.data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
  }
  return error instanceof Error ? error.message : "Không thể tải bảng tin.";
}

export function formatPostDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Mới đây";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  });
}

export function toCommunityPost(post: FeedPost): CommunityPost {
  return { ...post, comments: [] };
}
