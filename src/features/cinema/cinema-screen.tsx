import { Design } from "@/src/constants/design";
import { useAppTheme } from "@/src/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "./cinema.styles";
import { CinemaHeader } from "./components/cinema-header";
import {
  ErrorAlertModal,
  PhotoActionModal,
  PhotoViewerModal,
} from "./components/cinema-modals";
import {
  CinemaClipsSkeleton,
  CinemaGoalsSkeleton,
  CinemaPhotosSkeleton,
  CinemaWeeksSkeleton,
} from "./components/cinema-skeleton";
import { ClipsContent } from "./components/clips-content";
import { GoalCard } from "./components/goal-card";
import { GoalWeeksContent } from "./components/goal-weeks-content";
import { JourneyClipModal } from "./components/journey-clip-modal";
import { StorageQuotaCard } from "./components/storage-quota-card";
import { WeekOptionsContent } from "./components/week-options-content";
import { WeekPhotosContent } from "./components/week-photos-content";
import { useCinema } from "./hooks/use-cinema";
import { useEntitlement } from "@/src/features/subscription/hooks/use-entitlement";
import { UpgradeModal } from "@/src/components/ui/upgrade-modal";

export default function CinemaScreen() {
  const router = useRouter();
  const [isJourneyModalVisible, setIsJourneyModalVisible] = useState(false);
  const [isUpgradeModalVisible, setIsUpgradeModalVisible] = useState(false);
  const { hasFeature } = useEntitlement();
  const isMultiAngleUnlocked = hasFeature("MULTI_ANGLE_TEMPLATES");

  const handleJourneyClipPress = () => {
    if (!isMultiAngleUnlocked) {
      setIsUpgradeModalVisible(true);
      return;
    }
    setIsJourneyModalVisible(true);
  };

  const handleViewJourneyClipsPress = () => {
    if (!isMultiAngleUnlocked) {
      setIsUpgradeModalVisible(true);
      return;
    }
    void handleSelectJourneyClips();
  };

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
    isViewingJourneyClips,
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
    storageQuota,
    isQuotaLoading,
    loadStorageQuota,
    handleSelectGoal,
    handleSelectWeek,
    handleSelectWeekPhotos,
    handleSelectWeekClips,
    handleSelectJourneyClips,
    handlePhotoPress,
    handleSelectPhoto,
    handleToggleSelectAll,
    handleCreateClip,
    handleBack,
    handlePostClip,
    handleDeleteClip,
  } = useCinema();
  const { isNight } = useAppTheme();

  return (
    <SafeAreaView edges={["top"]} style={[styles.safeArea, isNight && { backgroundColor: "#0B132B" }]}>
      <CinemaHeader
        isNight={isNight}
        onBack={handleBack}
        onQueryChange={setQuery}
        query={query}
        selectedGoal={selectedGoal}
      />

      {selectedGoal ? (
        isPhotosLoading ? (
          <CinemaPhotosSkeleton />
        ) : isClipsLoading ? (
          <CinemaClipsSkeleton />
        ) : selectedWeekPhotos ? (
          <WeekPhotosContent
            clip={clip}
            data={selectedWeekPhotos}
            isNight={isNight}
            onCreateClip={() => void handleCreateClip()}
            onPhotoPress={handlePhotoPress}
            onToggleSelectAll={handleToggleSelectAll}
            onViewClips={() => void handleSelectWeekClips()}
            selectedPhotoIds={selectedPhotoIds}
            selectionMessage={selectionMessage}
          />
        ) : selectedWeekClips ? (
          <ClipsContent
            clips={selectedWeekClips}
            emptySubtitle={
              isViewingJourneyClips
                ? "Hãy nhấn 'Tạo Clip Mới' để bắt đầu ghép video từ ảnh check-in các tuần."
                : "Hãy tạo video từ danh sách ảnh của tuần này."
            }
            emptyTitle={
              isViewingJourneyClips
                ? "Chưa có clip hành trình nào"
                : "Chưa có video nào"
            }
            isNight={isNight}
            onDeleteClip={handleDeleteClip}
            onPostPress={handlePostClip}
            subtitle={
              isViewingJourneyClips
                ? "Các video tổng kết toàn hành trình đa tuần (Multi-Angle)"
                : `Các video đã tạo trong Tuần ${selectedWeek?.weekNumber ?? ""}`
            }
            title={
              isViewingJourneyClips
                ? "CLIP HÀNH TRÌNH (Multi-Angle)"
                : `Danh sách video Tuần ${selectedWeek?.weekNumber ?? ""}`
            }
          />
        ) : selectedWeek ? (
          <WeekOptionsContent
            onClipsPress={() => void handleSelectWeekClips()}
            onPhotosPress={() => void handleSelectWeekPhotos()}
            week={selectedWeek}
          />
        ) : isWeeksLoading ? (
          <CinemaWeeksSkeleton />
        ) : selectedGoalWeeks ? (
          <GoalWeeksContent
            data={selectedGoalWeeks}
            isMultiAngleUnlocked={isMultiAngleUnlocked}
            onJourneyClipPress={handleJourneyClipPress}
            onViewJourneyClipsPress={handleViewJourneyClipsPress}
            onWeekPress={handleSelectWeek}
          />
        ) : null
      ) : isLoading ? (
        <CinemaGoalsSkeleton />
      ) : (
        <FlatList
          contentContainerStyle={[
            styles.listContent,
            filteredGoals.length === 0 && styles.emptyListContent,
          ]}
          data={filteredGoals}
          keyExtractor={(goal) => String(goal.goalId)}
          ListHeaderComponent={
            <StorageQuotaCard
              isLoading={isQuotaLoading}
              onUpgradePress={() => router.push("/membership")}
              quota={storageQuota}
            />
          }
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

      {/* Journey Clip Modal (Multi-Angle) */}
      {selectedGoal && (
        <JourneyClipModal
          goalId={selectedGoal.goalId}
          goalName={selectedGoal.goalName}
          onClose={() => setIsJourneyModalVisible(false)}
          onSuccess={async () => {
            setIsJourneyModalVisible(false);
            void loadStorageQuota();
            await handleSelectJourneyClips();
          }}
          visible={isJourneyModalVisible}
        />
      )}

      {/* Modals for Error Handling */}
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
      {/* Upgrade Modal khi bấm vào Multi-Angle mà chưa có gói */}
      <UpgradeModal
        featureName="Multi-Angle & Dynamic Templates"
        description="Tính năng tạo và xem clip hành trình ghép đa tuần (Multi-Angle) chỉ dành riêng cho các thành viên đã nâng cấp gói VIP / Premium."
        onClose={() => setIsUpgradeModalVisible(false)}
        requiredPlanName="Premium"
        visible={isUpgradeModalVisible}
      />
    </SafeAreaView>
  );
}
