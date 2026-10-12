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
    PENDING: "Đang xử lý...",
    PROCESSING: "Đang render video...",
    UPLOADING: "Đang tải video lên...",
    COMPLETED: "Video đã sẵn sàng.",
    FAILED: "Tạo video thất bại.",
  }[status];
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const axiosError = error as {
      response?: {
        data?: unknown;
        status?: number;
      };
      message?: string;
      code?: string;
    };

    const data = axiosError.response?.data;
    if (typeof data === "string" && data.trim().length > 0) {
      return data.trim();
    }
    if (typeof data === "object" && data !== null) {
      const obj = data as Record<string, unknown>;
      if (typeof obj.message === "string" && obj.message.trim().length > 0) {
        return obj.message.trim();
      }
      if (typeof obj.error === "string" && obj.error.trim().length > 0) {
        return obj.error.trim();
      }
      if (typeof obj.detail === "string" && obj.detail.trim().length > 0) {
        return obj.detail.trim();
      }
      if (typeof obj.title === "string" && obj.title.trim().length > 0) {
        return obj.title.trim();
      }
      if (Array.isArray(obj.errors) && obj.errors.length > 0) {
        const firstErr = obj.errors[0];
        if (typeof firstErr === "string") return firstErr;
        if (typeof firstErr === "object" && firstErr !== null && "defaultMessage" in firstErr) {
          return String((firstErr as any).defaultMessage);
        }
      }
    }

    if (axiosError.code === "ECONNABORTED" || axiosError.message?.includes("timeout")) {
      return "Hệ thống phản hồi chậm, vui lòng kiểm tra kết nối mạng và thử lại.";
    }
    if (axiosError.message?.includes("Network Error")) {
      return "Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.";
    }
  }

  return error instanceof Error
    ? error.message
    : "Không thể tải dữ liệu PENTA-CINEMA.";
}
