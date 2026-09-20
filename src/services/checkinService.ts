import { API_ENDPOINTS } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { getSupabase } from "@/src/services/supabaseClient";
import type {
  CheckinRequestDTO,
  CheckinResponse,
} from "@/src/types/api/checkin";

const CHECKIN_BUCKET =
  process.env.EXPO_PUBLIC_SUPABASE_CHECKIN_BUCKET || "checkins";

function getImageInfo(uri: string) {
  const dataUriMatch = uri.match(
    /^data:(image\/(?:jpeg|jpg|png|webp));base64,/i,
  );

  if (dataUriMatch) {
    const contentType = dataUriMatch[1].toLowerCase().replace("jpg", "jpeg");
    return {
      contentType,
      extension: contentType.split("/")[1],
      isBase64: true,
    };
  }

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
    isBase64: false,
  };
}

export const checkinService = {
  async getImage(progressId: number): Promise<CheckinResponse> {
    const response = await apiClient.get(
      API_ENDPOINTS.CHECKIN.GET_IMAGE(progressId),
    );
    return response.data;
  },

  async uploadImage(imageUri: string, progressId: number) {
    try {
      const { extension, contentType } = getImageInfo(imageUri);
      const response = await fetch(imageUri);

      if (!response.ok) {
        throw new Error(`Không đọc được ảnh local (${response.status}).`);
      }

      // ArrayBuffer is more reliable than Blob for local file URIs in React Native.
      const fileData = await response.arrayBuffer();
      const filePath = `tasks/${progressId}/${Date.now()}.${extension}`;
      const supabase = getSupabase();
      const { error } = await supabase.storage
        .from(CHECKIN_BUCKET)
        .upload(filePath, fileData, {
          contentType,
          upsert: false,
        });

      if (error) {
        throw new Error(`Supabase upload lỗi: ${error.message}`);
      }

      const { data } = supabase.storage
        .from(CHECKIN_BUCKET)
        .getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Không thể upload ảnh check-in lên Supabase.",
      );
    }
  },

  async saveImage(progressId: number, imageUrl: string): Promise<CheckinResponse> {
    const payload: CheckinRequestDTO = { imageUrl };
    const response = await apiClient.post(
      API_ENDPOINTS.CHECKIN.SAVE_IMAGE(progressId),
      payload,
    );
    return response.data;
  },
};
