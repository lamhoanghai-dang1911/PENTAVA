export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")} VNĐ`;
}

export function formatTopupStatus(status?: string | null): string {
  switch (status?.toUpperCase()) {
    case "PENDING":
      return "Đang chờ thanh toán";
    case "SUCCESS":
      return "Thành công";
    case "FAILED":
      return "Thất bại";
    case "EXPIRED":
      return "Đã hết hạn";
    default:
      return status || "Đang chờ thanh toán";
  }
}

