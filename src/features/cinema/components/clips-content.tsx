import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { ClipVideoCard } from "./clip-video-card";
import { styles } from "../cinema.styles";
import type { ClipsContentProps } from "../types/cinema";

export function ClipsContent({
  clips,
  onPostPress,
  onDeleteClip,
  title = "Danh sách PENTA-CINEMA",
  subtitle = "Các video đã tạo trong tuần này",
  emptyTitle = "Chưa có video nào",
  emptySubtitle = "Hãy tạo video từ danh sách ảnh của tuần này.",
}: ClipsContentProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.clipsContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.photosSectionTitle}>{title}</Text>
      <Text style={styles.photosSectionHint}>{subtitle}</Text>
      {clips.length === 0 ? (
        <View style={styles.emptyPhotosCard}>
          <Ionicons
            color={Design.colors.disabled}
            name="film-outline"
            size={40}
          />
          <Text style={styles.emptyTitle}>{emptyTitle}</Text>
          <Text style={styles.stateText}>{emptySubtitle}</Text>
        </View>
      ) : (
        clips.map((clip) => (
          <ClipVideoCard
            clip={clip}
            key={clip.clipId}
            onDeleteClip={onDeleteClip}
            onPostPress={() => onPostPress(clip)}
          />
        ))
      )}
    </ScrollView>
  );
}
