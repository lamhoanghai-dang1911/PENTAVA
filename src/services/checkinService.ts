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

// Quản lý currentUserId đồng bộ cho memory cache
let cachedCurrentUserId = "anonymous";
getCurrentUserId().then((id) => {
  cachedCurrentUserId = id;
});
subscribeAuthState((userId) => {
  cachedCurrentUserId = userId || "anonymous";
});

function getMemKey(userId: string, progressId: number): string {
  return `${userId}:${progressId}`;
}

// Bộ nhớ đệm RAM theo user để hiển thị tức thì (0ms)
const localCheckinCache = new Map<string, string>();

// Subscriber để cập nhật real-time các component đang mở (vd: TaskCard)
const checkinListeners = new Map<number, Set<(url: string) => void>>();

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
  /**
   * Đăng ký lắng nghe thay đổi ảnh check-in cho một progressId (vd: khi upload ngầm hoàn tất)
   */
  subscribe(progressId: number, listener: (url: string) => void): () => void {
    if (!checkinListeners.has(progressId)) {
      checkinListeners.set(progressId, new Set());
    }
    checkinListeners.get(progressId)!.add(listener);
    return () => {
      checkinListeners.get(progressId)?.delete(listener);
    };
  },

  /**
   * Thông báo cho các subscriber đang nghe
   */
  notify(progressId: number, url: string): void {
    checkinListeners.get(progressId)?.forEach((cb) => {
      try {
        cb(url);
      } catch (err) {
        console.error("[checkinService] Lỗi subscriber:", err);
      }
    });
  },

  /**
   * Lấy ảnh check-in nhanh từ memory cache (đồng bộ, 0ms latency)
   */
  getCachedImage(progressId: number): string | null {
    const memKey = getMemKey(cachedCurrentUserId, progressId);
    if (localCheckinCache.has(memKey)) {
      return localCheckinCache.get(memKey)!;
    }
    const anonKey = getMemKey("anonymous", progressId);
    if (localCheckinCache.has(anonKey)) {
      return localCheckinCache.get(anonKey)!;
    }
    return null;
  },

  /**
   * Lấy ảnh check-in: ưu tiên đọc từ RAM cache, sau đó đến AsyncStorage.
   * Chỉ khi không còn cache thì mới gọi API server.
   */
  async getImage(progressId: number, forceRefresh = false): Promise<CheckinResponse> {
    const userId = await getCurrentUserId();
    const memKey = getMemKey(userId, progressId);

    // 1. Kiểm tra cache nếu không yêu cầu làm mới bắt buộc
    if (!forceRefresh) {
      // RAM cache
      const memImage = localCheckinCache.get(memKey) || localCheckinCache.get(getMemKey("anonymous", progressId));
      if (memImage) {
        return {
          message: "Ảnh check-in từ bộ nhớ tạm",
          taskProgressId: progressId,
          imageUrl: memImage,
          checkinDate: new Date().toISOString().split("T")[0],
        };
      }

      // Persistent cache (AsyncStorage theo userId)
      const diskImage = await getCachedCheckinImage(userId, progressId);
      if (diskImage) {
        localCheckinCache.set(memKey, diskImage);
        return {
          message: "Ảnh check-in từ bộ nhớ thiết bị",
          taskProgressId: progressId,
          imageUrl: diskImage,
          checkinDate: new Date().toISOString().split("T")[0],
        };
      }
    }

    // 2. Chỉ gọi API khi chưa có cache hoặc người dùng yêu cầu forceRefresh
    try {
      const response = await apiClient.get(
        API_ENDPOINTS.CHECKIN.GET_IMAGE(progressId),
      );

      if (response.data?.imageUrl) {
        localCheckinCache.set(memKey, response.data.imageUrl);
        await cacheCheckinImage(userId, progressId, response.data.imageUrl);
        return response.data;
      }

      if (localCheckinCache.has(memKey)) {
        return {
          message: "Ảnh check-in từ thiết bị",
          taskProgressId: progressId,
          imageUrl: localCheckinCache.get(memKey)!,
          checkinDate: new Date().toISOString().split("T")[0],
        };
      }

      return response.data;
    } catch (error) {
      if (localCheckinCache.has(memKey)) {
        return {
          message: "Ảnh check-in từ thiết bị",
          taskProgressId: progressId,
          imageUrl: localCheckinCache.get(memKey)!,
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
    // 1. Lưu ngay vào memory cache đồng bộ và notify (0ms latency cho UI hiển thị ngay)
    const currentMemKey = getMemKey(cachedCurrentUserId, progressId);
    localCheckinCache.set(currentMemKey, imageUri);
    this.notify(progressId, imageUri);

    // 2. Chạy ngầm lưu AsyncStorage và upload lên cloud
    (async () => {
      try {
        const userId = await getCurrentUserId();
        const memKey = getMemKey(userId, progressId);
        localCheckinCache.set(memKey, imageUri);
        await cacheCheckinImage(userId, progressId, imageUri);

        const uploadResult = await this.uploadImage(imageUri, progressId);
        await this.saveImage(progressId, uploadResult.publicUrl, uploadResult.fileSizeBytes);
        localCheckinCache.set(memKey, uploadResult.publicUrl);
        await cacheCheckinImage(userId, progressId, uploadResult.publicUrl);
        this.notify(progressId, uploadResult.publicUrl);
      } catch (error) {
        console.error(`[checkinService] Lỗi upload ngầm ảnh check-in (task: ${progressId}):`, error);
      }
    })();
  },
};

