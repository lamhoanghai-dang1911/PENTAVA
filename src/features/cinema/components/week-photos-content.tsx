import React from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { formatDate } from "../utils/cinema-utils";
import { styles } from "../cinema.styles";
import type { WeekPhotosContentProps } from "../types/cinema";

export function WeekPhotosContent({
  data,
  selectedPhotoIds,
  onPhotoPress,
  onToggleSelectAll,
  onCreateClip,
  onViewClips,
  clip,
  selectionMessage,
  isNight,
}: WeekPhotosContentProps) {
  const selectablePhotoCount = Math.min(data.photos.length, 20);
  const selectablePhotoIds = data.photos
    .slice(0, 20)
    .map((photo) => photo.photoId);
  const areAllPhotosSelected =
    selectablePhotoCount > 0 &&
    selectablePhotoIds.every((photoId) => selectedPhotoIds.has(photoId));

  return (
    <ScrollView
      contentContainerStyle={styles.photosContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.photosHero, isNight && { backgroundColor: "#111C44", borderColor: "#1E293B" }]}>
        <View style={styles.photosHeroIcon}>
          <Ionicons color={Design.colors.primaryGreen} name="images-outline" size={24} />
        </View>
        <View style={styles.photosHeroText}>
          <Text style={[styles.photosTitle, isNight && { color: "#F8FAFC" }]}>WEEK {data.weekNumber}</Text>
          <Text style={[styles.photosRange, isNight && { color: "#94A3B8" }]}>
            {formatDate(data.weekStart)} - {formatDate(data.weekEnd)}
          </Text>
        </View>
        <View style={styles.photoCountBadge}>
          <Text style={styles.photoCount}>{data.photos.length}</Text>
          <Text style={styles.photoCountLabel}>ẢNH</Text>
        </View>
      </View>
      <View style={styles.photosSectionHeader}>
        <View>
          <Text style={[styles.photosSectionTitle, isNight && { color: "#F8FAFC" }]}>Ảnh check-in</Text>
          <Text style={[styles.photosSectionHint, isNight && { color: "#94A3B8" }]}>Nhấn ảnh để xem hoặc chọn</Text>
        </View>
        <View style={styles.photosSelectionActions}>
          <Pressable
            accessibilityLabel={areAllPhotosSelected ? "Bỏ chọn tất cả ảnh" : "Chọn tất cả ảnh"}
            accessibilityRole="button"
            disabled={data.photos.length === 0}
            onPress={onToggleSelectAll}
            style={({ pressed }) => [
              styles.selectAllButton,
              data.photos.length === 0 && styles.disabledButton,
              pressed && styles.cardPressed,
            ]}
          >
            <Ionicons
              color={Design.colors.white}
              name={areAllPhotosSelected ? "checkmark-circle" : "checkmark-circle-outline"}
              size={19}
            />
            <Text style={styles.selectAllButtonText}>
              {areAllPhotosSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </Text>
          </Pressable>
          <Text style={[styles.selectedCount, isNight && { color: "#94A3B8" }]}>{selectedPhotoIds.size}/20 đã chọn</Text>
        </View>
      </View>
      {data.photos.length === 0 ? (
        <View style={[styles.emptyPhotosCard, isNight && { backgroundColor: "#111C44", borderColor: "#1E293B" }]}>
          <Ionicons color={Design.colors.disabled} name="images-outline" size={40} />
          <Text style={[styles.emptyTitle, isNight && { color: "#F8FAFC" }]}>Tuần này chưa có ảnh check-in</Text>
          <Text style={[styles.stateText, isNight && { color: "#94A3B8" }]}>Hãy hoàn thành check-in để lưu lại khoảnh khắc.</Text>
        </View>
      ) : (
        <View style={styles.photoGrid}>
          {data.photos.map((photo) => (
            <Pressable
              accessibilityLabel={`Chọn ảnh check-in ngày ${formatDate(photo.checkinDate)}`}
              accessibilityRole="button"
              key={photo.photoId}
              onPress={() => onPhotoPress(photo.photoId)}
              style={({ pressed }) => [
                styles.photoItem,
                isNight && { backgroundColor: "#111C44", borderColor: "#1E293B" },
                selectedPhotoIds.has(photo.photoId) && styles.photoItemSelected,
                pressed && styles.cardPressed,
              ]}
            >
              <Image
                accessibilityLabel={`Ảnh check-in ngày ${formatDate(photo.checkinDate)}`}
                cachePolicy="memory-disk"
                contentFit="cover"
                source={photo.imageUrl}
                style={styles.photo}
                transition={150}
              />
              <View style={[styles.photoCaption, isNight && { backgroundColor: "#0E1A38" }]}>
                <Ionicons color={Design.colors.primaryGreen} name="calendar-outline" size={14} />
                <Text style={[styles.photoDate, isNight && { color: "#E2E8F0" }]}>{formatDate(photo.checkinDate)}</Text>
                {selectedPhotoIds.has(photo.photoId) ? (
                  <Ionicons color={Design.colors.primaryGreen} name="checkmark-circle" size={18} />
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
      {selectionMessage ? <Text style={styles.selectionMessage}>{selectionMessage}</Text> : null}
      {selectedPhotoIds.size < 3 ? (
        <Text style={[styles.minimumPhotosHint, isNight && { color: "#94A3B8" }]}>
          Chọn ít nhất 3 hình ảnh để có thể tạo video.
        </Text>
      ) : (
        <Pressable
          accessibilityRole="button"
          disabled={
            clip?.status === "PENDING" ||
            clip?.status === "PROCESSING" ||
            clip?.status === "UPLOADING"
          }
          onPress={onCreateClip}
          style={({ pressed }) => [
            styles.createClipButton,
            pressed && styles.cardPressed,
          ]}
        >
          <Ionicons color={Design.colors.white} name="videocam-outline" size={19} />
          <Text style={styles.createClipButtonText}>Tạo video</Text>
        </Pressable>
      )}

      {onViewClips ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Xem các video đã tạo"
          onPress={onViewClips}
          style={({ pressed }) => [
            styles.viewClipsButton,
            isNight && styles.viewClipsButtonNight,
            pressed && styles.cardPressed,
          ]}
        >
          <Ionicons
            color={isNight ? "#34D399" : "#059669"}
            name="film-outline"
            size={19}
          />
          <Text
            style={[
              styles.viewClipsButtonText,
              isNight && styles.viewClipsButtonTextNight,
            ]}
          >
            Xem các video đã tạo
          </Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
