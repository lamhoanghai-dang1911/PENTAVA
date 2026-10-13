import { API_ENDPOINTS } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { getSupabase } from "@/src/services/supabaseClient";
import type {
  CheckinRequestDTO,
  CheckinResponse,
} from "@/src/types/api/checkin";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

const CHECKIN_BUCKET =
  process.env.EXPO_PUBLIC_SUPABASE_CHECKIN_BUCKET || "pentava-checkin-images";

// Bộ nhớ đệm tạm thời trên client để hiển thị ảnh ngay lập tức khi đang upload ngầm
const localCheckinCache = new Map<number, string>();

async function compressImageForUpload(uri: string): Promise<string> {
  if (uri.startsWith("http://") || uri.startsWith("https://") || uri.startsWith("data:")) {
    return uri;
  }

  try {
    const result = await manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      {
        compress: 0.7,
        format: SaveFormat.JPEG,
      },
    );
    return result.uri;
  } catch (error) {
    console.warn("Không thể nén ảnh check-in, dùng ảnh gốc:", error);
    return uri;
  }
}

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
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.CHECKIN.GET_IMAGE(progressId),
      );

      if (response.data?.imageUrl) {
        localCheckinCache.set(progressId, response.data.imageUrl);
        return response.data;
      }

      if (localCheckinCache.has(progressId)) {
        return {
          message: "Ảnh check-in từ thiết bị",
          taskProgressId: progressId,
          imageUrl: localCheckinCache.get(progressId)!,
          checkinDate: new Date().toISOString().split("T")[0],
        };
      }

      return response.data;
    } catch (error) {
      if (localCheckinCache.has(progressId)) {
        return {
          message: "Ảnh check-in từ thiết bị",
          taskProgressId: progressId,
          imageUrl: localCheckinCache.get(progressId)!,
          checkinDate: new Date().toISOString().split("T")[0],
        };
      }
      throw error;
    }
  },

  async uploadImage(imageUri: string, progressId: number): Promise<{ publicUrl: string; fileSizeBytes: number }> {
    try {
      const optimizedUri = await compressImageForUpload(imageUri);
      const { extension, contentType } = getImageInfo(optimizedUri);
      const response = await fetch(optimizedUri);

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
      return { publicUrl: data.publicUrl, fileSizeBytes: fileData.byteLength };
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Không thể upload ảnh check-in lên Supabase.",
      );
    }
  },

  async saveImage(progressId: number, imageUrl: string, fileSizeBytes?: number): Promise<CheckinResponse> {
    const payload: CheckinRequestDTO = { imageUrl, fileSizeBytes };
    const response = await apiClient.post(
      API_ENDPOINTS.CHECKIN.SAVE_IMAGE(progressId),
      payload,
    );
    return response.data;
  },

  uploadAndSaveInBackground(imageUri: string, progressId: number): void {
    localCheckinCache.set(progressId, imageUri);

    (async () => {
      try {
        const uploadResult = await this.uploadImage(imageUri, progressId);
        await this.saveImage(progressId, uploadResult.publicUrl, uploadResult.fileSizeBytes);
        localCheckinCache.set(progressId, uploadResult.publicUrl);
      } catch (error) {
        console.error(`[checkinService] Lỗi upload ngầm ảnh check-in (task: ${progressId}):`, error);
      }
    })();
  },
};
