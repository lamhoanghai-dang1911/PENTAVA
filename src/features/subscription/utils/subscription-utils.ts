export function formatVnd(amount: number): string {
  return `${amount.toLocaleString("vi-VN")}đ`;
}

export function getPlanVisuals(code: string): { crownBg: string; crownEmoji: string } {
  const upper = code.toUpperCase();
  if (upper === "PREMIUM") {
    return { crownBg: "#FFF3CD", crownEmoji: "👑" };
  }
  if (upper === "GOLD") {
    return { crownBg: "#FFE4D6", crownEmoji: "⭐" };
  }
  return { crownBg: "#E2E8F0", crownEmoji: "🌱" };
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  } catch {
    return dateStr;
  }
}
