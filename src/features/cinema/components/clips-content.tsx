import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { ClipVideoCard } from "./clip-video-card";
import { styles } from "../cinema.styles";
import type { ClipsContentProps } from "../types/cinema";

export function ClipsContent({ clips, onPostPress }: ClipsContentProps) {
  return (
    <ScrollView contentContainerStyle={styles.clipsContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.photosSectionTitle}>Danh sách PENTA-CINEMA</Text>
      <Text style={styles.photosSectionHint}>Các video đã tạo trong tuần này</Text>
      {clips.length === 0 ? (
        <View style={styles.emptyPhotosCard}>
          <Ionicons color={Design.colors.disabled} name="film-outline" size={40} />
          <Text style={styles.emptyTitle}>Chưa có video nào</Text>
          <Text style={styles.stateText}>Hãy tạo video từ danh sách ảnh của tuần này.</Text>
        </View>
      ) : (
        clips.map((clip) => (
          <ClipVideoCard clip={clip} key={clip.clipId} onPostPress={() => onPostPress(clip)} />
        ))
      )}
    </ScrollView>
  );
}
