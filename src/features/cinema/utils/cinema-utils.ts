import type { Clip } from "@/src/types/api/cinema";

export const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Đã hoàn thành",
  IN_PROGRESS: "Đang thực hiện",
  PAUSED: "Tạm dừng",
  FAILED: "Chưa hoàn thành",
};

export const WEEK_COLORS = ["#FBC653", "#F45D61", "#3D865D", "#4D96F4"] as const;

export function formatDate(date: string) {
  if (!date) return "";
  const parts = date.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return date;
}

export function getClipProgress(status: Clip["status"]) {
  return { PENDING: 10, PROCESSING: 55, UPLOADING: 85, COMPLETED: 100, FAILED: 0 }[status];
}

export function getClipStatusLabel(status: Clip["status"]) {
  return {
    PENDING: "Đang xếp hàng xử lý...",
    PROCESSING: "Đang render video...",
    UPLOADING: "Đang tải video lên...",
    COMPLETED: "Video đã sẵn sàng.",
    FAILED: "Tạo video thất bại.",
  }[status];
}

export function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const responseData = "response" in error
      ? (error.response as { data?: { message?: string; error?: string } } | undefined)?.data
      : undefined;
    if (responseData?.message) return responseData.message;
    if (responseData?.error) return responseData.error;
  }
  return error instanceof Error
    ? error.message
    : "Không thể tải dữ liệu PENTA-CINEMA.";
}
