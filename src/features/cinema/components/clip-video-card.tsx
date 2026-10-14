import React from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { formatDate, getClipStatusLabel } from "../utils/cinema-utils";
import { styles } from "../cinema.styles";
import type { ClipVideoCardProps } from "../types/cinema";

function sanitizeError(errorMessage: string | null | undefined, status: string): string {
  if (errorMessage && (errorMessage.toLowerCase().includes("ffmpeg")
      || errorMessage.toLowerCase().includes("cannot run program")
      || errorMessage.includes("error=2")
      || errorMessage.includes("No such file"))) {
    return "Quá trình tạo video trước đây bị gián đoạn. Bạn có thể xóa để tạo lại.";
  }
  return errorMessage || getClipStatusLabel(status as any);
}

export function ClipVideoCard({ clip, onPostPress, onDeleteClip }: ClipVideoCardProps) {
  const player = useVideoPlayer(clip.videoUrl ?? "", (videoPlayer) => {
    videoPlayer.loop = false;
  });

  const handleDelete = () => {
    if (!onDeleteClip) return;
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc chắn muốn xóa video này không?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => onDeleteClip(clip),
        },
      ]
    );
  };

  return (
    <View style={styles.clipVideoCard}>
      {clip.videoUrl ? (
        <VideoView
          contentFit="contain"
          fullscreenOptions={{ enable: true }}
          nativeControls
          player={player}
          style={styles.clipVideo}
        />
      ) : (
        <View style={styles.clipUnavailable}>
          <Ionicons color={Design.colors.disabled} name="videocam-off-outline" size={36} />
          <Text style={styles.stateText}>Video chưa sẵn sàng</Text>
        </View>
      )}
      <View style={styles.clipVideoDetails}>
        <Text style={styles.clipVideoMeta}>
          {clip.photoCount} ảnh · {formatDate(clip.createdAt.slice(0, 10))}
        </Text>
        {clip.status !== "COMPLETED" ? (
          <Text style={styles.clipErrorText}>
            {sanitizeError(clip.errorMessage, clip.status)}
          </Text>
        ) : null}
        {clip.status === "COMPLETED" ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đăng video lên PENTAVA social"
            onPress={onPostPress}
            style={({ pressed }) => [
              styles.socialPostButton,
              pressed && styles.cardPressed,
            ]}
          >
            <Ionicons color={Design.colors.white} name="share-social-outline" size={18} />
            <Text style={styles.socialPostButtonText}>Đăng lên PENTAVA social</Text>
          </Pressable>
        ) : null}
        {clip.status === "FAILED" && onDeleteClip ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Xóa video lỗi"
            onPress={handleDelete}
            style={({ pressed }) => [
              styles.socialPostButton,
              { backgroundColor: "#B33A3A", marginTop: 10 },
              pressed && styles.cardPressed,
            ]}
          >
            <Ionicons color={Design.colors.white} name="trash-outline" size={18} />
            <Text style={styles.socialPostButtonText}>Xóa video này</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
