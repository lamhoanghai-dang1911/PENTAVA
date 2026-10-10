import React from "react";
import { View, Text, ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Design } from "@/src/constants/design";
import { useCinema } from "./hooks/use-cinema";
import { CinemaHeader } from "./components/cinema-header";
import { GoalCard } from "./components/goal-card";
import { GoalWeeksContent } from "./components/goal-weeks-content";
import { WeekOptionsContent } from "./components/week-options-content";
import { WeekPhotosContent } from "./components/week-photos-content";
import { ClipsContent } from "./components/clips-content";
import {
  ErrorAlertModal,
  PhotoActionModal,
  PhotoViewerModal,
} from "./components/cinema-modals";
import { styles } from "./cinema.styles";

export default function CinemaScreen() {
  const {
    goals,
    query,
    setQuery,
    isLoading,
    filteredGoals,
    selectedGoal,
    selectedGoalWeeks,
    isWeeksLoading,
    selectedWeek,
    selectedWeekPhotos,
    selectedWeekClips,
    isPhotosLoading,
    isClipsLoading,
    weekErrorMessage,
    setWeekErrorMessage,
    clipsErrorMessage,
    setClipsErrorMessage,
    selectedPhotoIds,
    photoActionId,
    setPhotoActionId,
    isPhotoViewerVisible,
    setIsPhotoViewerVisible,
    selectionMessage,
    selectedPhoto,
    clip,
    handleSelectGoal,
    handleSelectWeek,
    handleSelectWeekPhotos,
    handleSelectWeekClips,
    handlePhotoPress,
    handleSelectPhoto,
    handleToggleSelectAll,
    handleCreateClip,
    handleBack,
    handlePostClip,
  } = useCinema();

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <CinemaHeader
        onBack={handleBack}
        onQueryChange={setQuery}
        query={query}
        selectedGoal={selectedGoal}
      />

      {selectedGoal ? (
        isPhotosLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={Design.colors.primaryGreen} size="large" />
            <Text style={styles.stateText}>Đang tải ảnh check-in...</Text>
          </View>
        ) : isClipsLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={Design.colors.primaryGreen} size="large" />
            <Text style={styles.stateText}>Đang tải danh sách video...</Text>
          </View>
        ) : selectedWeekPhotos ? (
          <WeekPhotosContent
            clip={clip}
            data={selectedWeekPhotos}
            onCreateClip={() => void handleCreateClip()}
            onPhotoPress={handlePhotoPress}
            onToggleSelectAll={handleToggleSelectAll}
            selectedPhotoIds={selectedPhotoIds}
            selectionMessage={selectionMessage}
          />
        ) : selectedWeekClips ? (
          <ClipsContent clips={selectedWeekClips} onPostPress={handlePostClip} />
        ) : selectedWeek ? (
          <WeekOptionsContent
            onClipsPress={() => void handleSelectWeekClips()}
            onPhotosPress={() => void handleSelectWeekPhotos()}
            week={selectedWeek}
          />
        ) : isWeeksLoading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color={Design.colors.primaryGreen} size="large" />
            <Text style={styles.stateText}>Đang tải 4 tuần...</Text>
          </View>
        ) : selectedGoalWeeks ? (
          <GoalWeeksContent data={selectedGoalWeeks} onWeekPress={handleSelectWeek} />
        ) : null
      ) : isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Design.colors.primaryGreen} size="large" />
          <Text style={styles.stateText}>Đang tải mục tiêu...</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={[
            styles.listContent,
            filteredGoals.length === 0 && styles.emptyListContent,
          ]}
          data={filteredGoals}
          keyExtractor={(goal) => String(goal.goalId)}
          ListEmptyComponent={
            <View style={styles.centerState}>
              <Ionicons color={Design.colors.disabled} name="flag-outline" size={40} />
              <Text style={styles.emptyTitle}>
                {goals.length === 0 ? "Bạn chưa có mục tiêu nào" : "Không tìm thấy mục tiêu"}
              </Text>
              <Text style={styles.stateText}>
                {goals.length === 0
                  ? "Các mục tiêu của bạn sẽ xuất hiện ở đây."
                  : "Hãy thử tìm kiếm với từ khóa khác."}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <GoalCard goal={item} onPress={() => void handleSelectGoal(item)} />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Modals */}
      <ErrorAlertModal
        iconName="calendar-outline"
        message={weekErrorMessage}
        onClose={() => setWeekErrorMessage(null)}
        title="Không thể mở tuần"
        visible={weekErrorMessage !== null}
      />

      <ErrorAlertModal
        iconName="film-outline"
        message={clipsErrorMessage}
        onClose={() => setClipsErrorMessage(null)}
        title="Không thể tải danh sách video"
        visible={clipsErrorMessage !== null}
      />

      <PhotoActionModal
        isSelected={photoActionId !== null && selectedPhotoIds.has(photoActionId)}
        onClose={() => setPhotoActionId(null)}
        onToggleSelect={handleSelectPhoto}
        onView={() => setIsPhotoViewerVisible(true)}
        photoId={photoActionId}
        visible={photoActionId !== null && !isPhotoViewerVisible}
      />

      <PhotoViewerModal
        checkinDate={selectedPhoto ? selectedPhoto.checkinDate : null}
        onClose={() => {
          setIsPhotoViewerVisible(false);
          setPhotoActionId(null);
        }}
        photoUrl={selectedPhoto ? selectedPhoto.imageUrl : null}
        visible={isPhotoViewerVisible && selectedPhoto !== undefined}
      />
    </SafeAreaView>
  );
}
