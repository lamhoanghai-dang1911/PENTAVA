import { SectionTabs } from "@/src/components/home/section-tabs";
import { Design, FontFamily } from "@/src/constants/design";
import { useCinemaProgress } from "@/src/context/cinema-progress-context";
import { cinemaService } from "@/src/services/cinemaService";
import type {
  Clip,
  GoalSummary,
  GoalWeeksResponse,
  WeekPhotosResponse,
  WeekSummary,
} from "@/src/types/api/cinema";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const STATUS_LABELS: Record<string, string> = {
  COMPLETED: "Đã hoàn thành",
  IN_PROGRESS: "Đang thực hiện",
  PAUSED: "Tạm dừng",
  FAILED: "Chưa hoàn thành",
};
const WEEK_COLORS = ["#FBC653", "#F45D61", "#3D865D", "#4D96F4"] as const;

function formatDate(date: string) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
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

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const responseData = "response" in error
      ? (error.response as { data?: { message?: string; error?: string } } | undefined)?.data
      : undefined;
    if (responseData?.message) return responseData.message;
    if (responseData?.error) return responseData.error;
  }
  return error instanceof Error
    ? error.message
    : "Không thể tải dữ liệu PENTA-CINEMA.";
}

function GoalCard({ goal, onPress }: { goal: GoalSummary; onPress: () => void }) {
  const statusLabel = STATUS_LABELS[goal.status] ?? goal.status;

  return (
    <Pressable
      accessibilityLabel={`Mở mục tiêu ${goal.goalName}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.goalCard, pressed && styles.cardPressed]}>
      <View style={styles.goalCardHeader}>
        <View style={styles.goalIcon}>
          <Ionicons color={Design.colors.primaryGreen} name="flag-outline" size={20} />
        </View>
        <View style={styles.goalTitleContainer}>
          <Text style={styles.goalName}>{goal.goalName}</Text>
          {/* <Text style={styles.goalId}>Mục tiêu #{goal.goalId}</Text> */}
        </View>
      </View>

      <View style={styles.goalDetails}>
        <View style={styles.detailItem}>
          <Ionicons color={Design.colors.mutedText} name="calendar-outline" size={16} />
          <Text style={styles.detailText}>
            {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons color={Design.colors.mutedText} name="time-outline" size={16} />
          <Text style={styles.detailText}>
            {goal.expired ? "Đã hết hạn" : "Chưa hết hạn"}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statusBadge,
          goal.expired && styles.statusBadgeExpired,
          goal.status === "COMPLETED" && styles.statusBadgeCompleted,
        ]}>
        <Text
          style={[
            styles.statusText,
            goal.expired && styles.statusTextExpired,
            goal.status === "COMPLETED" && styles.statusTextCompleted,
          ]}>
          {statusLabel}
        </Text>
      </View>
    </Pressable>
  );
}

function WeekCard({
  week,
  index,
  onPress,
}: {
  week: WeekSummary;
  index: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Tuần ${week.weekNumber}`}
      onPress={onPress}
      style={[
        styles.weekCard,
        { backgroundColor: WEEK_COLORS[week.weekNumber - 1] ?? WEEK_COLORS[0] },
        index > 0 && styles.weekCardOverlap,
      ]}>
      <View style={styles.weekInfo}>
        <Text style={styles.weekTitle}>WEEK {week.weekNumber}</Text>
        <Text style={styles.weekDate}>
          {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
        </Text>
        <Text style={styles.weekProgress}>
          {week.photoCount} ảnh
          {week.eligible ? " · Đủ điều kiện" : ` · Cần thêm ${week.photosNeeded} ảnh`}
        </Text>
      </View>
      <View style={styles.weekAction}>
        {week.current ? <Text style={styles.currentLabel}>ĐANG DIỄN RA</Text> : null}
        <Ionicons color={Design.colors.white} name="chevron-forward" size={24} />
      </View>
    </Pressable>
  );
}

function GoalWeeksContent({
  data,
  onWeekPress,
}: {
  data: GoalWeeksResponse;
  onWeekPress: (week: WeekSummary) => void;
}) {
  return (
    <ScrollView
      contentContainerStyle={styles.weeksContent}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.weeksGoalName}>{data.goalName}</Text>
      <Text style={styles.goalHint}>
        Mỗi tuần cần tối thiểu {data.minPhotos} ảnh check-in
      </Text>
      <View style={styles.weekStack}>
        {data.weeks.map((week, index) => (
          <WeekCard
            key={week.weekNumber}
            index={index}
            onPress={() => onWeekPress(week)}
            week={week}
          />
        ))}
      </View>
    </ScrollView>
  );
}

function WeekOptionsContent({
  week,
  onPhotosPress,
  onClipsPress,
}: {
  week: WeekSummary;
  onPhotosPress: () => void;
  onClipsPress: () => void;
}) {
  return (
    <View style={styles.weekOptionsContent}>
      <Text style={styles.weeksGoalName}>WEEK {week.weekNumber}</Text>
      <Text style={styles.goalHint}>
        {formatDate(week.weekStart)} - {formatDate(week.weekEnd)}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPhotosPress}
        style={({ pressed }) => [styles.weekOption, pressed && styles.cardPressed]}>
        <View style={styles.weekOptionIcon}>
          <Ionicons color={Design.colors.primaryGreen} name="images-outline" size={26} />
        </View>
        <View style={styles.weekOptionText}>
          <Text style={styles.weekOptionTitle}>Danh sách ảnh</Text>
          <Text style={styles.weekOptionHint}>Xem và chọn ảnh check-in để tạo video</Text>
        </View>
        <Ionicons color={Design.colors.mutedText} name="chevron-forward" size={22} />
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={onClipsPress}
        style={({ pressed }) => [styles.weekOption, pressed && styles.cardPressed]}>
        <View style={styles.weekOptionIcon}>
          <Ionicons color={Design.colors.primaryGreen} name="film-outline" size={26} />
        </View>
        <View style={styles.weekOptionText}>
          <Text style={styles.weekOptionTitle}>Danh sách PENTA-CINEMA</Text>
          <Text style={styles.weekOptionHint}>Xem các video đã tạo trong tuần</Text>
        </View>
        <Ionicons color={Design.colors.mutedText} name="chevron-forward" size={22} />
      </Pressable>
    </View>
  );
}

function ClipVideoCard({
  clip,
  onPostPress,
}: {
  clip: Clip;
  onPostPress: () => void;
}) {
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
        {/* <Text style={styles.clipVideoTitle}>Video #{clip.clipId}</Text> */}
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
            ]}>
            <Ionicons color={Design.colors.white} name="share-social-outline" size={18} />
            <Text style={styles.socialPostButtonText}>Đăng lên PENTAVA social</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ClipsContent({
  clips,
  onPostPress,
}: {
  clips: Clip[];
  onPostPress: (clip: Clip) => void;
}) {
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

function WeekPhotosContent({
  data,
  selectedPhotoIds,
  onPhotoPress,
  onToggleSelectAll,
  onCreateClip,
  clip,
  selectionMessage,
}: {
  data: WeekPhotosResponse;
  selectedPhotoIds: Set<number>;
  onPhotoPress: (photoId: number) => void;
  onToggleSelectAll: () => void;
  onCreateClip: () => void;
  clip: Clip | null;
  selectionMessage: string | null;
}) {
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
      showsVerticalScrollIndicator={false}>
      <View style={styles.photosHero}>
        <View style={styles.photosHeroIcon}>
          <Ionicons color={Design.colors.primaryGreen} name="images-outline" size={24} />
        </View>
        <View style={styles.photosHeroText}>
          <Text style={styles.photosTitle}>WEEK {data.weekNumber}</Text>
          <Text style={styles.photosRange}>
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
          <Text style={styles.photosSectionTitle}>Ảnh check-in</Text>
          <Text style={styles.photosSectionHint}>Nhấn ảnh để xem hoặc chọn</Text>
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
            ]}>
            <Ionicons
              color={Design.colors.white}
              name={areAllPhotosSelected ? "checkmark-circle" : "checkmark-circle-outline"}
              size={19}
            />
            <Text style={styles.selectAllButtonText}>
              {areAllPhotosSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
            </Text>
          </Pressable>
          <Text style={styles.selectedCount}>{selectedPhotoIds.size}/20 đã chọn</Text>
        </View>
      </View>
      {data.photos.length === 0 ? (
        <View style={styles.emptyPhotosCard}>
          <Ionicons color={Design.colors.disabled} name="images-outline" size={40} />
          <Text style={styles.emptyTitle}>Tuần này chưa có ảnh check-in</Text>
          <Text style={styles.stateText}>Hãy hoàn thành check-in để lưu lại khoảnh khắc.</Text>
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
                selectedPhotoIds.has(photo.photoId) && styles.photoItemSelected,
                pressed && styles.cardPressed,
              ]}>
              <Image
                accessibilityLabel={`Ảnh check-in ngày ${formatDate(photo.checkinDate)}`}
                contentFit="cover"
                source={photo.imageUrl}
                style={styles.photo}
              />
              <View style={styles.photoCaption}>
                <Ionicons color={Design.colors.primaryGreen} name="calendar-outline" size={14} />
                <Text style={styles.photoDate}>{formatDate(photo.checkinDate)}</Text>
                {selectedPhotoIds.has(photo.photoId) ? (
                  <Ionicons color={Design.colors.primaryGreen} name="checkmark-circle" size={18} />
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>
      )}
      {selectionMessage ? <Text style={styles.selectionMessage}>{selectionMessage}</Text> : null}
      {clip ? (
        <View style={styles.clipProgressCard}>
          <View style={styles.clipProgressHeader}>
            <Text style={styles.clipProgressTitle}>Đang tạo video</Text>
            <Text style={styles.clipProgressPercent}>{getClipProgress(clip.status)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${getClipProgress(clip.status)}%` }]} />
          </View>
          <Text style={styles.clipProgressText}>{getClipStatusLabel(clip.status)}</Text>
          {clip.status === "FAILED" && clip.errorMessage ? (
            <Text style={styles.clipErrorText}>{clip.errorMessage}</Text>
          ) : null}
        </View>
      ) : null}
      {selectedPhotoIds.size < 3 ? (
        <Text style={styles.minimumPhotosHint}>
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
          ]}>
          <Ionicons color={Design.colors.white} name="videocam-outline" size={19} />
          <Text style={styles.createClipButtonText}>Tạo video</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

export default function CinemaScreen() {
  const [goals, setGoals] = useState<GoalSummary[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState<GoalSummary | null>(null);
  const [selectedGoalWeeks, setSelectedGoalWeeks] = useState<GoalWeeksResponse | null>(null);
  const [isWeeksLoading, setIsWeeksLoading] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<WeekSummary | null>(null);
  const [selectedWeekPhotos, setSelectedWeekPhotos] = useState<WeekPhotosResponse | null>(null);
  const [selectedWeekClips, setSelectedWeekClips] = useState<Clip[] | null>(null);
  const [isPhotosLoading, setIsPhotosLoading] = useState(false);
  const [isClipsLoading, setIsClipsLoading] = useState(false);
  const [weekErrorMessage, setWeekErrorMessage] = useState<string | null>(null);
  const [clipsErrorMessage, setClipsErrorMessage] = useState<string | null>(null);
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<number>>(new Set());
  const [photoActionId, setPhotoActionId] = useState<number | null>(null);
  const [isPhotoViewerVisible, setIsPhotoViewerVisible] = useState(false);
  const [selectionMessage, setSelectionMessage] = useState<string | null>(null);
  const {
    clip,
    clearClipError,
    startClip,
  } = useCinemaProgress();

  useEffect(() => {
    let isActive = true;

    const loadGoals = async () => {
      try {
        const response = await cinemaService.getGoals();
        if (isActive) setGoals(response);
      } catch (error) {
        if (isActive) Alert.alert("Không thể tải mục tiêu", getErrorMessage(error));
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadGoals();
    return () => {
      isActive = false;
    };
  }, []);

  const filteredGoals = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return goals;
    return goals.filter((goal) => goal.goalName.toLowerCase().includes(normalizedQuery));
  }, [goals, query]);

  const handleSelectGoal = async (goal: GoalSummary) => {
    setSelectedGoal(goal);
    setSelectedGoalWeeks(null);
    setSelectedWeekPhotos(null);
    setSelectedWeek(null);
    setSelectedWeekClips(null);
    setIsWeeksLoading(true);
    try {
      setSelectedGoalWeeks(await cinemaService.getGoalWeeks(goal.goalId));
    } catch (error) {
      Alert.alert("Không thể tải danh sách tuần", getErrorMessage(error));
    } finally {
      setIsWeeksLoading(false);
    }
  };

  const handleSelectWeek = async (week: WeekSummary) => {
    if (!selectedGoal) return;
    setSelectedWeek(week);
    setSelectedWeekPhotos(null);
    setSelectedWeekClips(null);
    setSelectedPhotoIds(new Set());
    setSelectionMessage(null);
    setWeekErrorMessage(null);
    setClipsErrorMessage(null);
  };

  const handleSelectWeekPhotos = async () => {
    if (!selectedGoal || !selectedWeek) return;
    setSelectedWeekPhotos(null);
    setSelectedWeekClips(null);
    setIsPhotosLoading(true);
    setWeekErrorMessage(null);
    try {
      const response = await cinemaService.getGoalWeekPhotos(
        selectedGoal.goalId,
        selectedWeek.weekNumber,
      );
      setSelectedWeekPhotos(response);
    } catch (error) {
      setWeekErrorMessage(getErrorMessage(error));
    } finally {
      setIsPhotosLoading(false);
    }
  };

  const handleSelectWeekClips = async () => {
    if (!selectedGoal || !selectedWeek) return;
    setSelectedWeekPhotos(null);
    setSelectedWeekClips(null);
    setIsClipsLoading(true);
    setClipsErrorMessage(null);
    try {
      const response = await cinemaService.getClips(
        selectedGoal.goalId,
        selectedWeek.weekNumber,
      );
      setSelectedWeekClips(response);
    } catch (error) {
      setClipsErrorMessage(getErrorMessage(error));
    } finally {
      setIsClipsLoading(false);
    }
  };

  const selectedPhoto = selectedWeekPhotos?.photos.find(
    (photo) => photo.photoId === photoActionId,
  );

  const handlePhotoPress = (photoId: number) => {
    setPhotoActionId(photoId);
    setSelectionMessage(null);
  };

  const handleSelectPhoto = () => {
    if (photoActionId === null) return;
    setSelectedPhotoIds((current) => {
      const next = new Set(current);
      if (next.has(photoActionId)) {
        next.delete(photoActionId);
      } else if (next.size < 20) {
        next.add(photoActionId);
      }
      return next;
    });
    setPhotoActionId(null);
  };

  const handleToggleSelectAll = () => {
    if (!selectedWeekPhotos) return;
    setSelectedPhotoIds((current) => {
      const selectablePhotoIds = selectedWeekPhotos.photos.slice(0, 20).map((photo) => photo.photoId);
      const areAllPhotosSelected =
        selectablePhotoIds.length > 0 &&
        selectablePhotoIds.every((photoId) => current.has(photoId));

      return areAllPhotosSelected ? new Set() : new Set(selectablePhotoIds);
    });
    setSelectionMessage(
      selectedWeekPhotos.photos.length > 20
        ? "Đã chọn tối đa 20 ảnh đầu tiên."
        : null,
    );
  };

  const handleCreateClip = async () => {
    if (!selectedGoal || !selectedWeekPhotos) return;
    if (selectedPhotoIds.size < 3) {
      setSelectionMessage("Vui lòng chọn ít nhất 3 hình ảnh để tạo video.");
      return;
    }
    setSelectionMessage(null);
    clearClipError();
    try {
      await startClip(
        selectedGoal.goalId,
        selectedWeekPhotos.weekNumber,
        Array.from(selectedPhotoIds),
      );
    } catch (error) {
      Alert.alert("Không thể tạo video", getErrorMessage(error));
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel={selectedGoal ? "Quay lại danh sách mục tiêu" : "Quay lại"}
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => {
            if (selectedWeekPhotos || selectedWeekClips !== null) {
              setSelectedWeekPhotos(null);
              setSelectedWeekClips(null);
              setSelectedPhotoIds(new Set());
              return;
            }
            if (selectedWeek) {
              setSelectedWeek(null);
              return;
            }
            if (selectedGoal) {
              setSelectedGoal(null);
              setSelectedGoalWeeks(null);
              return;
            }
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
          <Ionicons color={Design.colors.black} name="chevron-back" size={28} />
        </Pressable>

        {!selectedGoal && <SectionTabs active="cinema" />}
        <Text style={styles.title}>PENTAVA-CINEMA</Text>
        <Text style={styles.subtitle}>
          {selectedGoal ? "Tiến độ mục tiêu" : "Danh sách mục tiêu của bạn"}
        </Text>

        {!selectedGoal && (
          <View style={styles.searchBar}>
            <Ionicons color={Design.colors.mutedText} name="search-outline" size={16} />
            <TextInput
              accessibilityLabel="Tìm kiếm mục tiêu"
              onChangeText={setQuery}
              placeholder="Tìm kiếm mục tiêu"
              placeholderTextColor={Design.colors.disabled}
              style={styles.searchInput}
              value={query}
            />
          </View>
        )}
      </View>

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
          <ClipsContent
            clips={selectedWeekClips}
            onPostPress={(clipToPost) => {
              if (!clipToPost.videoUrl) return;
              router.push({
                pathname: "/social-post",
                params: {
                  clipId: String(clipToPost.clipId),
                  videoUrl: clipToPost.videoUrl,
                },
              });
            }}
          />
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
            <GoalCard
              goal={item}
              onPress={() => void handleSelectGoal(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        animationType="fade"
        onRequestClose={() => setWeekErrorMessage(null)}
        transparent
        visible={weekErrorMessage !== null}>
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.errorIcon}>
              <Ionicons color="#B33A3A" name="calendar-outline" size={26} />
            </View>
            <Text style={styles.errorModalTitle}>Không thể mở tuần</Text>
            <Text style={styles.errorModalMessage}>{weekErrorMessage}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đóng thông báo"
              onPress={() => setWeekErrorMessage(null)}
              style={({ pressed }) => [styles.modalButton, pressed && styles.cardPressed]}>
              <Text style={styles.modalButtonText}>Đã hiểu</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setClipsErrorMessage(null)}
        transparent
        visible={clipsErrorMessage !== null}>
        <View style={styles.modalOverlay}>
          <View style={styles.errorModal}>
            <View style={styles.errorIcon}>
              <Ionicons color="#B33A3A" name="film-outline" size={26} />
            </View>
            <Text style={styles.errorModalTitle}>Không thể tải danh sách video</Text>
            <Text style={styles.errorModalMessage}>{clipsErrorMessage}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đóng thông báo lỗi danh sách video"
              onPress={() => setClipsErrorMessage(null)}
              style={({ pressed }) => [styles.modalButton, pressed && styles.cardPressed]}>
              <Text style={styles.modalButtonText}>Đã hiểu</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => setPhotoActionId(null)}
        transparent
        visible={photoActionId !== null && !isPhotoViewerVisible}>
        <View style={styles.modalOverlay}>
          <View style={styles.photoActionModal}>
            <Text style={styles.errorModalTitle}>Bạn muốn làm gì với ảnh?</Text>
            <Pressable
              onPress={() => setIsPhotoViewerVisible(true)}
              style={styles.modalOption}>
              <Ionicons color={Design.colors.primaryGreen} name="eye-outline" size={23} />
              <Text style={styles.modalOptionText}>Xem hình ảnh</Text>
            </Pressable>
            <Pressable onPress={handleSelectPhoto} style={styles.modalOption}>
              <Ionicons color={Design.colors.primaryGreen} name="checkmark-circle-outline" size={23} />
              <Text style={styles.modalOptionText}>
                {photoActionId !== null && selectedPhotoIds.has(photoActionId)
                  ? "Bỏ chọn hình ảnh"
                  : "Chọn hình ảnh"}
              </Text>
            </Pressable>
            <Pressable onPress={() => setPhotoActionId(null)} style={styles.modalCancelButton}>
              <Text style={styles.modalCancelText}>Hủy</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        onRequestClose={() => {
          setIsPhotoViewerVisible(false);
          setPhotoActionId(null);
        }}
        transparent
        visible={isPhotoViewerVisible && selectedPhoto !== undefined}>
        <View style={styles.viewerOverlay}>
          <Pressable
            accessibilityLabel="Đóng hình ảnh"
            onPress={() => {
              setIsPhotoViewerVisible(false);
              setPhotoActionId(null);
            }}
            style={styles.viewerClose}>
            <Ionicons color={Design.colors.white} name="close" size={28} />
          </Pressable>
          {selectedPhoto ? (
            <Image contentFit="contain" source={selectedPhoto.imageUrl} style={styles.viewerImage} />
          ) : null}
          {selectedPhoto ? (
            <Text style={styles.viewerDate}>{formatDate(selectedPhoto.checkinDate)}</Text>
          ) : null}
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Design.colors.white },
  header: { paddingHorizontal: 24, paddingTop: 8 },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    color: Design.colors.black,
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: Design.fontSize.h2 - 2,
    letterSpacing: 1,
    textAlign: "center",
  },
  subtitle: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 2,
    marginBottom: 14,
    marginTop: 4,
    textAlign: "center",
  },
  searchBar: {
    alignItems: "center",
    borderColor: "#E9E9E9",
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    height: 40,
    marginBottom: 18,
    paddingHorizontal: 14,
  },
  searchInput: {
    color: Design.colors.black,
    flex: 1,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 2,
    paddingVertical: 0,
  },
  listContent: { gap: 12, paddingBottom: 24, paddingHorizontal: 24 },
  emptyListContent: { flexGrow: 1 },
  goalCard: {
    backgroundColor: Design.colors.white,
    borderColor: "#E9E9E9",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  cardPressed: { opacity: 0.8 },
  goalCardHeader: { flexDirection: "row", gap: 12 },
  goalIcon: {
    alignItems: "center",
    backgroundColor: "#EAF3ED",
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  goalTitleContainer: { flex: 1 },
  goalName: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
    lineHeight: 23,
  },
  goalId: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginTop: 2,
  },
  goalDetails: { gap: 8, marginTop: 16 },
  detailItem: { alignItems: "center", flexDirection: "row", gap: 8 },
  detailText: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 2,
  },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF4DC",
    borderRadius: 12,
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusBadgeExpired: { backgroundColor: "#FDEAEA" },
  statusBadgeCompleted: { backgroundColor: "#EAF3ED" },
  statusText: {
    color: "#A16C00",
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 1,
  },
  statusTextExpired: { color: "#B33A3A" },
  statusTextCompleted: { color: Design.colors.primaryGreen },
  centerState: { alignItems: "center", flex: 1, justifyContent: "center", padding: 24 },
  stateText: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 2,
    marginTop: 8,
    textAlign: "center",
  },
  emptyTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
    marginTop: 14,
    textAlign: "center",
  },
  weeksContent: { flexGrow: 1, paddingTop: 18 },
  weekOptionsContent: { flex: 1, paddingHorizontal: 24, paddingTop: 28 },
  weekOption: {
    alignItems: "center",
    backgroundColor: Design.colors.white,
    borderColor: "#E9E9E9",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    padding: 16,
  },
  weekOptionIcon: {
    alignItems: "center",
    backgroundColor: "#EAF3ED",
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  weekOptionText: { flex: 1 },
  weekOptionTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
  },
  weekOptionHint: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginTop: 4,
  },
  photosContent: { paddingBottom: 32, paddingHorizontal: 24, paddingTop: 18 },
  clipsContent: { paddingBottom: 32, paddingHorizontal: 24, paddingTop: 18 },
  clipVideoCard: {
    backgroundColor: Design.colors.white,
    borderColor: "#E9E9E9",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 16,
    overflow: "hidden",
  },
  clipVideo: { backgroundColor: "#111111", height: 210, width: "100%" },
  clipUnavailable: {
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    height: 160,
    justifyContent: "center",
  },
  clipVideoDetails: { padding: 14 },
  socialPostButton: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 22,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  socialPostButtonText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 2,
  },
  clipVideoTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
  },
  clipVideoMeta: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginTop: 4,
  },
  photosHero: {
    alignItems: "center",
    backgroundColor: "#EAF3ED",
    borderRadius: 20,
    flexDirection: "row",
    padding: 16,
  },
  photosHeroIcon: {
    alignItems: "center",
    backgroundColor: Design.colors.white,
    borderRadius: 24,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  photosHeroText: { flex: 1, marginLeft: 12 },
  photosTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: Design.fontSize.body,
    letterSpacing: 1,
  },
  photosRange: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginTop: 3,
  },
  photoCountBadge: { alignItems: "center", marginLeft: 8 },
  photoCount: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: Design.fontSize.title,
  },
  photoCountLabel: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption,
    marginTop: -2,
  },
  photosSectionHeader: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  photosSectionTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
  },
  photosSectionHint: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 16,
    marginTop: 12,
  },
  photoItem: {
    backgroundColor: Design.colors.white,
    borderColor: "#E9E9E9",
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    width: "48%",
  },
  photo: {
    backgroundColor: "#F2F2F2",
    aspectRatio: 0.86,
    width: "100%",
  },
  photoCaption: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    minHeight: 38,
    paddingHorizontal: 10,
  },
  photoDate: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
  },
  emptyPhotosCard: {
    alignItems: "center",
    backgroundColor: "#F8FAF8",
    borderColor: "#EAF3ED",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  selectedCount: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 1,
  },
  photosSelectionActions: {
    alignItems: "flex-end",
    gap: 5,
  },
  selectAllButton: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 18,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  selectAllButtonText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 1,
  },
  disabledButton: { opacity: 0.45 },
  photoItemSelected: {
    borderColor: Design.colors.primaryGreen,
    borderWidth: 2,
  },
  selectionMessage: {
    color: "#B33A3A",
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 1,
    marginTop: 14,
    textAlign: "center",
  },
  createClipButton: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 26,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 18,
    paddingVertical: 14,
  },
  minimumPhotosHint: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginTop: 18,
    textAlign: "center",
  },
  createClipButtonText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
  },
  clipProgressCard: {
    backgroundColor: "#F8FAF8",
    borderColor: "#EAF3ED",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 18,
    padding: 14,
  },
  clipProgressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  clipProgressTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 2,
  },
  clipProgressPercent: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 2,
  },
  progressTrack: {
    backgroundColor: "#DCE8DF",
    borderRadius: 4,
    height: 8,
    marginTop: 10,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 4,
    height: "100%",
  },
  clipProgressText: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginTop: 8,
  },
  clipErrorText: {
    color: "#B33A3A",
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginTop: 4,
  },
  weeksGoalName: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
    paddingHorizontal: 24,
    textAlign: "center",
  },
  goalHint: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 2,
    marginTop: 6,
    paddingHorizontal: 24,
    textAlign: "center",
  },
  weekStack: { flexGrow: 1, marginTop: 22 },
  weekCard: {
    alignItems: "flex-start",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    flexDirection: "row",
    flexGrow: 1,
    justifyContent: "space-between",
    minHeight: 108,
    paddingHorizontal: 22,
    paddingTop: 28,
  },
  weekCardOverlap: { marginTop: -30 },
  weekInfo: { flex: 1 },
  weekTitle: {
    color: Design.colors.white,
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: Design.fontSize.title,
    letterSpacing: 1,
  },
  weekDate: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 1,
    marginTop: 6,
  },
  weekProgress: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 1,
    marginTop: 4,
  },
  weekAction: { alignItems: "flex-end", gap: 16 },
  currentLabel: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption,
  },
  modalOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorModal: {
    alignItems: "center",
    backgroundColor: Design.colors.white,
    borderRadius: 22,
    maxWidth: 380,
    paddingHorizontal: 24,
    paddingVertical: 26,
    width: "100%",
  },
  resultModal: {
    alignItems: "center",
    backgroundColor: Design.colors.white,
    borderRadius: 22,
    maxWidth: 380,
    paddingHorizontal: 24,
    paddingVertical: 26,
    width: "100%",
  },
  resultIcon: {
    alignItems: "center",
    backgroundColor: "#EAF3ED",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    marginBottom: 14,
    width: 60,
  },
  resultIconFailed: { backgroundColor: "#FDEAEA" },
  errorIcon: {
    alignItems: "center",
    backgroundColor: "#FDEAEA",
    borderRadius: 28,
    height: 56,
    justifyContent: "center",
    marginBottom: 14,
    width: 56,
  },
  errorModalTitle: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.body,
    textAlign: "center",
  },
  errorModalMessage: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption + 2,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },
  modalButton: {
    alignItems: "center",
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 22,
    marginTop: 22,
    minWidth: 140,
    paddingHorizontal: 24,
    paddingVertical: 11,
  },
  modalButtonText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.caption + 2,
  },
  photoActionModal: {
    backgroundColor: Design.colors.white,
    borderRadius: 22,
    maxWidth: 380,
    padding: 22,
    width: "100%",
  },
  modalOption: {
    alignItems: "center",
    borderColor: "#E9E9E9",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
    padding: 14,
  },
  modalOptionText: {
    color: Design.colors.black,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.body,
  },
  modalCancelButton: { alignItems: "center", marginTop: 16, padding: 8 },
  modalCancelText: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 2,
  },
  viewerOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.92)",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  viewerClose: {
    position: "absolute",
    right: 20,
    top: 50,
    zIndex: 1,
  },
  viewerImage: { height: "78%", width: "100%" },
  viewerDate: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption + 2,
    marginTop: 12,
  },
});
