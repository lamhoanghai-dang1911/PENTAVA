import type {
  Clip,
  GoalSummary,
  GoalWeeksResponse,
  WeekPhotosResponse,
  WeekSummary,
} from "@/src/types/api/cinema";
import type { Ionicons } from "@expo/vector-icons";

export type GoalCardProps = {
  goal: GoalSummary;
  onPress: () => void;
};

export type WeekCardProps = {
  week: WeekSummary;
  index: number;
  onPress: () => void;
};

export type GoalWeeksContentProps = {
  data: GoalWeeksResponse;
  onWeekPress: (week: WeekSummary) => void;
};

export type WeekOptionsContentProps = {
  week: WeekSummary;
  onPhotosPress: () => void;
  onClipsPress: () => void;
};

export type ClipVideoCardProps = {
  clip: Clip;
  onPostPress: () => void;
};

export type ClipsContentProps = {
  clips: Clip[];
  onPostPress: (clip: Clip) => void;
};

export type WeekPhotosContentProps = {
  data: WeekPhotosResponse;
  selectedPhotoIds: Set<number>;
  onPhotoPress: (photoId: number) => void;
  onToggleSelectAll: () => void;
  onCreateClip: () => void;
  clip: Clip | null;
  selectionMessage: string | null;
};

export type CinemaHeaderProps = {
  selectedGoal: GoalSummary | null;
  query: string;
  onQueryChange: (query: string) => void;
  onBack: () => void;
};

export type ErrorAlertModalProps = {
  visible: boolean;
  title: string;
  message: string | null;
  iconName: keyof typeof Ionicons.glyphMap;
  onClose: () => void;
};

export type PhotoActionModalProps = {
  visible: boolean;
  photoId: number | null;
  isSelected: boolean;
  onView: () => void;
  onToggleSelect: () => void;
  onClose: () => void;
};

export type PhotoViewerModalProps = {
  visible: boolean;
  photoUrl: string | null;
  checkinDate: string | null;
  onClose: () => void;
};
