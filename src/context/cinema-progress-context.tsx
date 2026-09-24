import { Design, FontFamily } from "@/src/constants/design";
import { cinemaService } from "@/src/services/cinemaService";
import type { Clip } from "@/src/types/api/cinema";
import { Ionicons } from "@expo/vector-icons";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CinemaProgressContextValue = {
  clip: Clip | null;
  clipErrorMessage: string | null;
  startClip: (goalId: number, weekNumber: number, photoIds: number[]) => Promise<Clip>;
  clearClipError: () => void;
  dismissProgress: () => void;
};

const CinemaProgressContext = createContext<CinemaProgressContextValue | null>(null);

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const responseData = "response" in error
      ? (error.response as { data?: { message?: string; error?: string } } | undefined)?.data
      : undefined;
    if (responseData?.message) return responseData.message;
    if (responseData?.error) return responseData.error;
  }
  return error instanceof Error ? error.message : "Không thể tạo video.";
}

function getClipProgress(status: Clip["status"]) {
  return { PENDING: 10, PROCESSING: 55, UPLOADING: 85, COMPLETED: 100, FAILED: 0 }[status];
}

function getClipStatusLabel(status: Clip["status"]) {
  return {
    PENDING: "Đang xếp hàng xử lý...",
    PROCESSING: "Đang render video...",
    UPLOADING: "Đang tải video lên...",
    COMPLETED: "Video đã sẵn sàng.",
    FAILED: "Tạo video thất bại.",
  }[status];
}

export function CinemaProgressProvider({ children }: { children: ReactNode }) {
  const [clip, setClip] = useState<Clip | null>(null);
  const [clipErrorMessage, setClipErrorMessage] = useState<string | null>(null);
  const [isProgressDismissed, setIsProgressDismissed] = useState(false);

  const startClip = async (goalId: number, weekNumber: number, photoIds: number[]) => {
    setClipErrorMessage(null);
    setIsProgressDismissed(false);
    setClip(null);
    const createdClip = await cinemaService.createClip(goalId, weekNumber, photoIds);
    setClip(createdClip);
    return createdClip;
  };

  useEffect(() => {
    if (!clip || ["COMPLETED", "FAILED"].includes(clip.status)) return;

    let isPolling = true;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const pollClip = async () => {
      try {
        const updatedClip = await cinemaService.getClip(clip.clipId);
        if (!isPolling) return;
        setClip(updatedClip);
        if (updatedClip.status !== "COMPLETED" && updatedClip.status !== "FAILED") {
          timer = setTimeout(() => void pollClip(), 2500);
        }
      } catch (error) {
        if (isPolling) setClipErrorMessage(getErrorMessage(error));
      }
    };

    timer = setTimeout(() => void pollClip(), 2500);
    return () => {
      isPolling = false;
      if (timer) clearTimeout(timer);
    };
  }, [clip]);

  return (
    <CinemaProgressContext.Provider
      value={{
        clip,
        clipErrorMessage,
        startClip,
        clearClipError: () => setClipErrorMessage(null),
        dismissProgress: () => setIsProgressDismissed(true),
      }}>
      <View style={styles.root}>
        {!isProgressDismissed && clip ? (
          <SafeAreaView edges={["top"]} style={styles.bannerSafeArea}>
            <CinemaProgressBanner
              clip={clip}
              errorMessage={clipErrorMessage}
              onDismiss={() => setIsProgressDismissed(true)}
            />
          </SafeAreaView>
        ) : null}
        <View style={styles.content}>{children}</View>
      </View>
    </CinemaProgressContext.Provider>
  );
}

export function useCinemaProgress() {
  const context = useContext(CinemaProgressContext);
  if (!context) throw new Error("useCinemaProgress must be used within CinemaProgressProvider");
  return context;
}

function CinemaProgressBanner({
  clip,
  errorMessage,
  onDismiss,
}: {
  clip: Clip;
  errorMessage: string | null;
  onDismiss: () => void;
}) {
  const progress = getClipProgress(clip.status);
  const isCompleted = clip.status === "COMPLETED";
  const isFailed = clip.status === "FAILED";

  return (
    <View
      accessibilityLabel={
        isFailed ? "Tạo video thất bại" : `Tiến trình tạo video ${progress}%`
      }
      accessibilityRole={isFailed ? "alert" : "progressbar"}
      style={[styles.progressBanner, isFailed && styles.progressBannerFailed]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          {!isCompleted && !isFailed ? (
            <View style={styles.icon}>
              <Ionicons color={Design.colors.white} name="videocam-outline" size={16} />
            </View>
          ) : null}
          <Text style={[styles.title, isFailed && styles.failedTitle]}>
            {isCompleted
              ? "Tạo video hoàn tất"
              : isFailed
                ? "Tạo video thất bại"
                : "Đang tạo video"}
          </Text>
        </View>
        {isCompleted || isFailed ? (
          <Pressable
            accessibilityLabel="Đóng thanh tiến trình"
            accessibilityRole="button"
            hitSlop={8}
            onPress={onDismiss}>
            <Ionicons
              color={isFailed ? "#B33A3A" : Design.colors.primaryGreen}
              name={isFailed ? "close-circle" : "checkmark-circle"}
              size={25}
            />
          </Pressable>
        ) : (
          <Text style={styles.percent}>{progress}%</Text>
        )}
      </View>
      <View style={[styles.track, isFailed && styles.failedTrack]}>
        <View style={[styles.fill, isFailed && styles.failedFill, { width: `${progress}%` }]} />
      </View>
      <Text style={[styles.status, isFailed && styles.failedStatus]}>
        {isCompleted
          ? "Video đã sẵn sàng. Nhấn dấu tích để đóng."
          : isFailed
            ? errorMessage || clip.errorMessage || "Video không thể render."
            : errorMessage || getClipStatusLabel(clip.status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  bannerSafeArea: { backgroundColor: Design.colors.white },
  content: { flex: 1 },
  progressBanner: {
    backgroundColor: Design.colors.white,
    borderBottomColor: "#EAF3ED",
    borderBottomWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  progressBannerFailed: { borderBottomColor: "#FDEAEA" },
  header: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" },
  titleContainer: { alignItems: "center", flexDirection: "row", gap: 8 },
  icon: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 12,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  completedIcon: { backgroundColor: "#3D865D" },
  title: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 2,
  },
  percent: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 2,
  },
  track: { backgroundColor: "#DCE8DF", borderRadius: 4, height: 7, marginTop: 9, overflow: "hidden" },
  fill: { backgroundColor: Design.colors.primaryGreen, borderRadius: 4, height: "100%" },
  failedFill: { backgroundColor: "#B33A3A" },
  failedStatus: { color: "#B33A3A" },
  failedTitle: { color: "#B33A3A" },
  failedTrack: { backgroundColor: "#FDEAEA" },
  status: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
    marginTop: 6,
  },
});
