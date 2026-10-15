import { API_ENDPOINTS } from "@/src/constants/api";
import apiClient from "@/src/services/apiClient";
import { getCurrentUserId, subscribeAuthState } from "@/src/services/authStorage";
import { getSupabase } from "@/src/services/supabaseClient";
import {
  cacheCheckinImage,
  getCachedCheckinImage,
} from "@/src/services/taskCacheStorage";
import type {
  CheckinRequestDTO,
  CheckinResponse,
} from "@/src/types/api/checkin";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

const CHECKIN_BUCKET =
  process.env.EXPO_PUBLIC_SUPABASE_CHECKIN_BUCKET || "pentava-checkin-images";

export type CheckinUploadStatus = {
  isUploading: boolean;
  imageUrl?: string;
  error?: string;
};

type UploadListener = (status: CheckinUploadStatus) => void;

// Bộ nhớ đệm tạm thời trên client để hiển thị ảnh ngay lập tức khi đang upload ngầm
const localCheckinCache = new Map<number, string>();
const uploadingTasks = new Set<number>();
const uploadListeners = new Map<number, Set<UploadListener>>();

function notifyUploadListeners(progressId: number, status: CheckinUploadStatus) {
  const listeners = uploadListeners.get(progressId);
  if (listeners) {
    listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (e) {
        console.error(
          `[checkinService] Lỗi trong listener của task ${progressId}:`,
          e,
        );
      }
    });
  }
}

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
  } catch {
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
  isUploading(progressId: number): boolean {
    return uploadingTasks.has(progressId);
  },

  getCachedImage(progressId: number): string | null {
    return localCheckinCache.get(progressId) ?? null;
  },

  subscribeUploadStatus(progressId: number, listener: UploadListener): () => void {
    if (!uploadListeners.has(progressId)) {
      uploadListeners.set(progressId, new Set());
    }
    uploadListeners.get(progressId)!.add(listener);

    // Bắn ngay trạng thái hiện tại cho subscriber
    listener({
      isUploading: uploadingTasks.has(progressId),
      imageUrl: localCheckinCache.get(progressId),
    });

    return () => {
      const listeners = uploadListeners.get(progressId);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          uploadListeners.delete(progressId);
        }
      }
    };
  },

  async getImage(progressId: number): Promise<CheckinResponse> {
    const cachedUrl = localCheckinCache.get(progressId);

    // Nếu đang trong tiến trình upload ngầm và đã có ảnh local thì trả về ngay
    if (uploadingTasks.has(progressId) && cachedUrl) {
      return {
        message: "Ảnh check-in đang được tải lên",
        taskProgressId: progressId,
        imageUrl: cachedUrl,
        checkinDate: new Date().toISOString().split("T")[0],
      };
    }

    try {
      const response = await apiClient.get(
        API_ENDPOINTS.CHECKIN.GET_IMAGE(progressId),
      );

      if (response.data?.imageUrl) {
        localCheckinCache.set(memKey, response.data.imageUrl);
        await cacheCheckinImage(userId, progressId, response.data.imageUrl);
        return response.data;
      }

      if (cachedUrl) {
        return {
          message: "Ảnh check-in từ thiết bị",
          taskProgressId: progressId,
          imageUrl: cachedUrl,
          checkinDate: new Date().toISOString().split("T")[0],
        };
      }

      return response.data;
    } catch (error) {
      if (cachedUrl) {
        return {
          message: "Ảnh check-in từ thiết bị",
          taskProgressId: progressId,
          imageUrl: cachedUrl,
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
    try {
      const userId = await getCurrentUserId();
      localCheckinCache.set(getMemKey(userId, progressId), imageUrl);
      await cacheCheckinImage(userId, progressId, imageUrl);
      this.notify(progressId, imageUrl);
    } catch (e) {
      console.warn("[checkinService] Không thể lưu cache ảnh vừa lưu:", e);
    }
    return response.data;
  },

  uploadAndSaveInBackground(imageUri: string, progressId: number): void {
    localCheckinCache.set(progressId, imageUri);
    uploadingTasks.add(progressId);
    notifyUploadListeners(progressId, {
      isUploading: true,
      imageUrl: imageUri,
    });

    // 2. Chạy ngầm lưu AsyncStorage và upload lên cloud
    (async () => {
      try {
        const userId = await getCurrentUserId();
        const memKey = getMemKey(userId, progressId);
        localCheckinCache.set(memKey, imageUri);
        await cacheCheckinImage(userId, progressId, imageUri);

        const uploadResult = await this.uploadImage(imageUri, progressId);
        const saveRes = await this.saveImage(progressId, uploadResult.publicUrl, uploadResult.fileSizeBytes);
        const activeUrl = saveRes?.imageUrl || uploadResult.publicUrl;
        localCheckinCache.set(progressId, activeUrl);
        uploadingTasks.delete(progressId);
        notifyUploadListeners(progressId, {
          isUploading: false,
          imageUrl: activeUrl,
        });
      } catch (error) {
        console.error(`[checkinService] Lỗi upload ngầm ảnh check-in (task: ${progressId}):`, error);
        uploadingTasks.delete(progressId);
        localCheckinCache.delete(progressId);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Không thể tải ảnh check-in lên hệ thống.";
        notifyUploadListeners(progressId, {
          isUploading: false,
          error: errorMessage,
        });
      }
    })();
  },
};

