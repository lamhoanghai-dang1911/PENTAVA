import React from "react";
import { View, Text, Pressable } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { formatDate, getClipStatusLabel } from "../utils/cinema-utils";
import { styles } from "../cinema.styles";
import type { ClipVideoCardProps } from "../types/cinema";

export function ClipVideoCard({ clip, onPostPress }: ClipVideoCardProps) {
  const player = useVideoPlayer(clip.videoUrl ?? "", (videoPlayer) => {
    videoPlayer.loop = false;
  });

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
            {clip.errorMessage || getClipStatusLabel(clip.status)}
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
      </View>
    </View>
  );
}
