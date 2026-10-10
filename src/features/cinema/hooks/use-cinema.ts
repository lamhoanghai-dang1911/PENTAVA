import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useCinemaProgress } from "@/src/context/cinema-progress-context";
import { cinemaService } from "@/src/services/cinemaService";
import type {
  Clip,
  GoalSummary,
  GoalWeeksResponse,
  WeekPhotosResponse,
  WeekSummary,
} from "@/src/types/api/cinema";
import { getErrorMessage } from "../utils/cinema-utils";

export function useCinema() {
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

  const { clip, clearClipError, startClip } = useCinemaProgress();

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

  const handleSelectWeek = (week: WeekSummary) => {
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
      const selectablePhotoIds = selectedWeekPhotos.photos
        .slice(0, 20)
        .map((photo) => photo.photoId);
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

  const handleBack = () => {
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
      router.replace("/(tabs)");
    }
  };

  const handlePostClip = (clipToPost: Clip) => {
    if (!clipToPost.videoUrl) return;
    router.push({
      pathname: "/social-post",
      params: {
        clipId: String(clipToPost.clipId),
        videoUrl: clipToPost.videoUrl,
      },
    });
  };

  return {
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
  };
}
