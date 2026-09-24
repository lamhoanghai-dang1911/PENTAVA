import { getSupabase } from "@/src/services/supabaseClient";

const AVATAR_BUCKET = "avatar";

function getImageInfo(uri: string) {
  const cleanUri = uri.split(/[?#]/)[0];
  const extension = cleanUri.split(".").pop()?.toLowerCase();
  const supportedExtensions = ["jpeg", "jpg", "png", "webp"];
  const safeExtension =
    extension && supportedExtensions.includes(extension) ? extension : "jpg";

  return {
    extension: safeExtension === "jpg" ? "jpeg" : safeExtension,
    contentType:
      safeExtension === "png"
        ? "image/png"
        : safeExtension === "webp"
          ? "image/webp"
          : "image/jpeg",
  };
}

export async function uploadAvatar(imageUri: string, userId: number) {
  try {
    if (!imageUri) {
      throw new Error("Không tìm thấy ảnh đại diện đã chọn.");
    }

    const { extension, contentType } = getImageInfo(imageUri);
    const response = await fetch(imageUri);

    // Some native file URIs return status 0 even though their bytes are readable.
    if (!response.ok && response.status !== 0) {
      throw new Error(`Không đọc được ảnh đã chọn (${response.status}).`);
    }

    const fileData = await response.arrayBuffer();
    if (fileData.byteLength === 0) {
      throw new Error("Ảnh đã chọn không có dữ liệu.");
    }

    const filePath = `users/${userId}/${Date.now()}.${extension}`;
    const supabase = getSupabase();
    const { error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, fileData, {
        contentType,
        upsert: false,
      });

    if (error) {
      if (error.message.toLowerCase().includes("row-level security")) {
        throw new Error(
          "Supabase chưa có Storage policy INSERT cho bucket avatar. Hãy cấp quyền upload cho bucket này.",
        );
      }

      if (error.message.toLowerCase().includes("bucket not found")) {
        throw new Error('Không tìm thấy bucket Supabase "avatar".');
      }

      throw new Error(`Supabase upload avatar lỗi: ${error.message}`);
    }

    const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Không thể upload ảnh đại diện lên Supabase.",
    );
  }
}
