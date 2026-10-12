import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { ClipVideoCard } from "./clip-video-card";
import { styles } from "../cinema.styles";
import type { ClipsContentProps } from "../types/cinema";

export function ClipsContent({
  clips,
  onPostPress,
  onRefresh,
  isRefreshing,
  errorMessage,
}: ClipsContentProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.clipsContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            colors={[Design.colors.primaryGreen]}
            onRefresh={onRefresh}
            refreshing={Boolean(isRefreshing)}
            tintColor={Design.colors.primaryGreen}
          />
        ) : undefined
      }
    >
      <View style={styles.clipsHeaderRow}>
        <View style={styles.clipsHeaderTitleWrapper}>
          <Text style={styles.photosSectionTitle}>Danh sách PENTA-CINEMA</Text>
          <Text style={styles.photosSectionHint}>Các video đã tạo trong tuần này</Text>
        </View>

        {onRefresh ? (
          <TouchableOpacity
            accessibilityLabel="Tải lại danh sách video"
            accessibilityRole="button"
            disabled={isRefreshing}
            onPress={onRefresh}
            style={styles.retryHeaderButton}
          >
            {isRefreshing ? (
              <ActivityIndicator color={Design.colors.primaryGreen} size="small" />
            ) : (
              <>
                <Ionicons color={Design.colors.primaryGreen} name="reload-outline" size={16} />
                <Text style={styles.retryHeaderButtonText}>Tải lại</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      {errorMessage ? (
        <View style={styles.clipsErrorCard}>
          <Ionicons color="#B33A3A" name="alert-circle-outline" size={24} />
          <View style={styles.clipsErrorTextContainer}>
            <Text style={styles.clipsErrorTitle}>Không thể tải danh sách video</Text>
            <Text style={styles.clipsErrorDetail}>{errorMessage}</Text>
          </View>
          {onRefresh ? (
            <TouchableOpacity
              disabled={isRefreshing}
              onPress={onRefresh}
              style={styles.retryActionButton}
            >
              <Text style={styles.retryActionButtonText}>Thử lại</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      {clips.length === 0 ? (
        <View style={styles.emptyPhotosCard}>
          <Ionicons color={Design.colors.disabled} name="film-outline" size={40} />
          <Text style={styles.emptyTitle}>Chưa có video nào</Text>
          <Text style={styles.stateText}>Hãy tạo video từ danh sách ảnh của tuần này.</Text>
          {onRefresh ? (
            <TouchableOpacity
              disabled={isRefreshing}
              onPress={onRefresh}
              style={styles.emptyRetryButton}
            >
              <Ionicons color={Design.colors.primaryGreen} name="reload-outline" size={16} />
              <Text style={styles.emptyRetryButtonText}>Tải lại</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        clips.map((clip) => (
          <ClipVideoCard clip={clip} key={clip.clipId} onPostPress={() => onPostPress(clip)} />
        ))
      )}
    </ScrollView>
  );
}
