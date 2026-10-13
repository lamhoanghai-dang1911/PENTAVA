import { NotificationModal } from "@/src/components/ui/notification-modal";
import { Design, FontFamily } from "@/src/constants/design";
import { useEntitlement } from "@/src/features/subscription/hooks/use-entitlement";
import { onboardingService } from "@/src/services/onboardingService";
import type {
  CurrentGoal,
  CustomTaskItem,
  PastGoalCatalog,
  PublicGoalSummary,
} from "@/src/types/api/onboarding";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type MoodKey = "BAD" | "NEUTRAL" | "GOOD";

interface MoodMeta {
  key: MoodKey;
  label: string;
  emoji: string;
  color: string;
  badgeBg: string;
  sub: string;
}

const MOOD_LIST: MoodMeta[] = [
  {
    key: "BAD",
    label: "Tâm trạng Tệ",
    emoji: "🌧️",
    color: "#EF4444",
    badgeBg: "#FEE2E2",
    sub: "Nhiệm vụ nhẹ nhàng, dễ làm để phục hồi năng lượng",
  },
  {
    key: "NEUTRAL",
    label: "Bình thường",
    emoji: "⛅",
    color: "#F59E0B",
    badgeBg: "#FEF3C7",
    sub: "Nhiệm vụ duy trì nhịp độ ổn định và đều đặn",
  },
  {
    key: "GOOD",
    label: "Tâm trạng Tốt",
    emoji: "☀️",
    color: "#10B981",
    badgeBg: "#D1FAE5",
    sub: "Nhiệm vụ bứt phá, năng suất cao khi dồi dào năng lượng",
  },
];

const extractErrorMessage = (error: any, defaultMsg: string = "Có lỗi xảy ra, vui lòng thử lại"): string => {
  if (!error) return defaultMsg;
  if (error.response?.data?.message) return String(error.response.data.message);
  if (typeof error.response?.data === "string" && error.response.data.trim()) return error.response.data;
  if (error.response?.data?.errors && typeof error.response.data.errors === "object") {
    const errorVals = Object.values(error.response.data.errors).filter(Boolean);
    if (errorVals.length > 0) return errorVals.join(", ");
  }
  if (error.response?.data && typeof error.response.data === "object") {
    const values = Object.values(error.response.data).filter((v) => typeof v === "string");
    if (values.length > 0) return values.join(", ");
  }
  if (error.message) return String(error.message);
  return defaultMsg;
};

export default function CustomRoadmapScreen() {
  const { hasFeature, isLoading: isEntitlementLoading } = useEntitlement();
  const isCustomRoadmapUnlocked = hasFeature("CUSTOM_ROADMAP");

  const [activeTab, setActiveTab] = useState<"custom" | "community">("custom");

  // Current active goal of user
  const [currentGoal, setCurrentGoal] = useState<CurrentGoal | null>(null);

  // State: Tự Thiết Kế 15 Tasks theo 3 Mood
  const [goalName, setGoalName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedMoodKey, setSelectedMoodKey] = useState<MoodKey>("BAD");
  const [moodTasksData, setMoodTasksData] = useState<Record<MoodKey, CustomTaskItem[]>>({
    BAD: [],
    NEUTRAL: [],
    GOOD: [],
  });
  const [newTaskInput, setNewTaskInput] = useState("");
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  // Modal notification for API responses
  const [modalNotification, setModalNotification] = useState<{
    visible: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
  } | null>(null);

  // State: Past Tasks Catalog Modal
  const [isCatalogModalVisible, setIsCatalogModalVisible] = useState(false);
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [pastCatalogs, setPastCatalogs] = useState<PastGoalCatalog[]>([]);
  const [selectedCatalogTaskIds, setSelectedCatalogTaskIds] = useState<Set<number>>(new Set());

  // State: Community Feed
  const [publicGoals, setPublicGoals] = useState<PublicGoalSummary[]>([]);
  const [isCommunityLoading, setIsCommunityLoading] = useState(false);
  const [cloningGoalId, setCloningGoalId] = useState<number | null>(null);

  // State: Clone Choice Modal (REPLACE_NOW vs SET_AS_NEXT)
  const [isCloneChoiceModalVisible, setIsCloneChoiceModalVisible] = useState(false);
  const [selectedPublicGoalForClone, setSelectedPublicGoalForClone] = useState<PublicGoalSummary | null>(null);

  useEffect(() => {
    void loadCurrentGoal();
  }, []);

  useEffect(() => {
    if (activeTab === "community") {
      void loadPublicGoals();
    }
  }, [activeTab]);

  const loadCurrentGoal = async () => {
    try {
      const res = await onboardingService.getCurrentGoal();
      setCurrentGoal(res.currentGoal);
    } catch {
      // ignore
    }
  };

  const loadPublicGoals = async () => {
    setIsCommunityLoading(true);
    try {
      const goals = await onboardingService.getPublicGoals();
      setPublicGoals(goals);
    } catch (error: any) {
      setModalNotification({
        visible: true,
        title: "Lỗi tải cộng đồng",
        message: extractErrorMessage(error, "Không thể tải danh sách lộ trình cộng đồng lúc này."),
      });
    } finally {
      setIsCommunityLoading(false);
    }
  };

  const handleOpenCatalog = async () => {
    setIsCatalogModalVisible(true);
    setIsCatalogLoading(true);
    setSelectedCatalogTaskIds(new Set());
    try {
      const catalogs = await onboardingService.getPastTasksCatalog();
      setPastCatalogs(catalogs);
    } catch (error: any) {
      setModalNotification({
        visible: true,
        title: "Lỗi danh mục",
        message: extractErrorMessage(error, "Không thể tải danh mục nhiệm vụ quá khứ."),
      });
    } finally {
      setIsCatalogLoading(false);
    }
  };

  const handleToggleCatalogTask = (taskId: number) => {
    setSelectedCatalogTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  const handleAddSelectedCatalogTasks = () => {
    if (selectedCatalogTaskIds.size === 0) {
      setIsCatalogModalVisible(false);
      return;
    }

    const currentList = moodTasksData[selectedMoodKey] || [];
    const remainingSlots = 5 - currentList.length;

    if (remainingSlots <= 0) {
      setModalNotification({
        visible: true,
        title: "Đã đủ 5 nhiệm vụ",
        message: "Tâm trạng này đã đạt tối đa 5 nhiệm vụ.",
      });
      setIsCatalogModalVisible(false);
      return;
    }

    const tasksToAdd: CustomTaskItem[] = [];
    pastCatalogs.forEach((goal) => {
      goal.tasks.forEach((t) => {
        if (selectedCatalogTaskIds.has(t.taskId)) {
          tasksToAdd.push({
            title: t.title,
            content: t.content,
            sourceTaskId: t.taskId,
          });
        }
      });
    });

    const toAdd = tasksToAdd.slice(0, remainingSlots);
    if (tasksToAdd.length > remainingSlots) {
      setModalNotification({
        visible: true,
        title: "Giới hạn 5 nhiệm vụ",
        message: `Chỉ lấy ${remainingSlots} nhiệm vụ đã chọn vì mỗi tâm trạng cần đúng 5 nhiệm vụ.`,
      });
    }

    setMoodTasksData((prev) => ({
      ...prev,
      [selectedMoodKey]: [...currentList, ...toAdd],
    }));

    setIsCatalogModalVisible(false);
  };

  const handleAddNewTask = () => {
    const trimmed = newTaskInput.trim();
    if (!trimmed) return;

    const currentList = moodTasksData[selectedMoodKey] || [];
    if (currentList.length >= 5) {
      setModalNotification({
        visible: true,
        title: "Đã đủ 5 nhiệm vụ",
        message: "Mỗi tâm trạng chỉ cần đúng 5 nhiệm vụ. Vui lòng chuyển sang tâm trạng khác.",
      });
      return;
    }

    setMoodTasksData((prev) => ({
      ...prev,
      [selectedMoodKey]: [...currentList, { title: trimmed }],
    }));
    setNewTaskInput("");
  };

  const handleRemoveTask = (mood: MoodKey, index: number) => {
    setMoodTasksData((prev) => ({
      ...prev,
      [mood]: prev[mood].filter((_, i) => i !== index),
    }));
  };

  const handleSubmitCustomGoal = async () => {
    if (!isCustomRoadmapUnlocked) {
      setModalNotification({
        visible: true,
        title: "Tính Năng Hội Viên",
        message: "Bạn cần nâng cấp gói cước để có thể tạo lộ trình tự thiết kế.",
        onConfirm: () => router.push("/membership"),
      });
      return;
    }

    if (!goalName.trim()) {
      setModalNotification({
        visible: true,
        title: "Thiếu thông tin",
        message: "Vui lòng nhập tên mục tiêu của bạn.",
      });
      return;
    }

    const badCount = (moodTasksData.BAD || []).length;
    const neutralCount = (moodTasksData.NEUTRAL || []).length;
    const goodCount = (moodTasksData.GOOD || []).length;

    if (badCount !== 5 || neutralCount !== 5 || goodCount !== 5) {
      setModalNotification({
        visible: true,
        title: "Chưa đủ 15 nhiệm vụ",
        message: `Lộ trình yêu cầu đúng 5 nhiệm vụ cho mỗi tâm trạng (Hiện có: 🌧️ Tệ ${badCount}/5, ⛅ Bình thường ${neutralCount}/5, ☀️ Tốt ${goodCount}/5). Vui lòng điền đủ 5 nhiệm vụ cho cả 3 tâm trạng.`,
      });
      return;
    }

    setIsSubmittingCustom(true);
    try {
      await onboardingService.createCustomGoal({
        goalName: goalName.trim(),
        description: description.trim(),
        isPublic,
        badTasks: moodTasksData.BAD,
        neutralTasks: moodTasksData.NEUTRAL,
        goodTasks: moodTasksData.GOOD,
      });

      setModalNotification({
        visible: true,
        title: "Tạo Lộ Trình Thành Công 🎉",
        message: "Lộ trình 15 nhiệm vụ mới đã được thiết lập làm mục tiêu hiện tại của bạn!",
        onConfirm: () => router.replace("/daily-tasks"),
      });
    } catch (error: any) {
      setModalNotification({
        visible: true,
        title: "Lỗi tạo lộ trình",
        message: extractErrorMessage(error, "Không thể tạo lộ trình. Vui lòng thử lại sau."),
      });
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  // Clone Community Goal Handler
  const handleInitiateClone = (item: PublicGoalSummary) => {
    if (!isCustomRoadmapUnlocked) {
      setModalNotification({
        visible: true,
        title: "Tính Năng Hội Viên",
        message: "Bạn cần nâng cấp gói cước để có thể nhận lộ trình cộng đồng.",
        onConfirm: () => router.push("/membership"),
      });
      return;
    }

    // Check if user currently has an active in-progress goal
    if (currentGoal && currentGoal.status === "IN_PROGRESS") {
      setSelectedPublicGoalForClone(item);
      setIsCloneChoiceModalVisible(true);
    } else {
      Alert.alert(
        "Áp Dụng Lộ Trình",
        `Bạn có chắc chắn muốn nhận lộ trình "${item.goalName}" của ${item.authorName} làm mục tiêu hiện tại?`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Áp dụng ngay",
            onPress: () => void executeClone(item.goalId, "REPLACE_NOW"),
          },
        ]
      );
    }
  };

  const executeClone = async (
    goalId: number,
    applyMode: "REPLACE_NOW" | "SET_AS_NEXT"
  ) => {
    setIsCloneChoiceModalVisible(false);
    setCloningGoalId(goalId);
    try {
      await onboardingService.clonePublicGoal(goalId, applyMode);
      const isReplace = applyMode === "REPLACE_NOW";
      setModalNotification({
        visible: true,
        title: "Thành Công! 🚀",
        message: isReplace
          ? "Đã kết thúc lộ trình cũ và áp dụng lộ trình cộng đồng mới thành công!"
          : "Đã lưu lộ trình cộng đồng làm mục tiêu tiếp theo! Lộ trình hiện tại vẫn đang tiếp tục.",
        onConfirm: () => {
          if (isReplace) {
            router.replace("/daily-tasks");
          } else {
            void loadCurrentGoal();
          }
        },
      });
    } catch (error: any) {
      setModalNotification({
        visible: true,
        title: "Lỗi sao chép",
        message: extractErrorMessage(error, "Không thể sao chép lộ trình này."),
      });
    } finally {
      setCloningGoalId(null);
    }
  };

  if (isEntitlementLoading) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Design.colors.black} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Lộ Trình Phát Triển</Text>
            <Text style={styles.headerSub}>Tự do thiết kế & Khám phá</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerBox}>
          <ActivityIndicator color={Design.colors.primaryGreen} size="large" />
          <Text style={styles.loadingText}>Đang kiểm tra quyền truy cập gói...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isCustomRoadmapUnlocked) {
    return (
      <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Design.colors.black} />
          </TouchableOpacity>
          <View style={styles.headerTitleWrap}>
            <Text style={styles.headerTitle}>Lộ Trình Phát Triển</Text>
            <Text style={styles.headerSub}>Tính năng đặc quyền</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.paywallContainer}>
          <View style={styles.paywallCard}>
            <View style={styles.paywallIconCircle}>
              <Ionicons color="#D97706" name="lock-closed" size={36} />
            </View>

            <View style={styles.paywallVipBadge}>
              <Text style={styles.paywallVipText}>GÓI HỘI VIÊN</Text>
            </View>

            <Text style={styles.paywallTitle}>Tự Thiết Kế Lộ Trình</Text>

            <Text style={styles.paywallDesc}>
              Tính năng tự do thiết kế lộ trình 15 nhiệm vụ theo tâm trạng và sao chép lộ trình từ cộng đồng chỉ dành riêng cho tài khoản đã nâng cấp gói hội viên.
            </Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push("/membership")}
              style={styles.paywallUpgradeBtn}
            >
              <Ionicons color="#FFFFFF" name="diamond-outline" size={18} />
              <Text style={styles.paywallUpgradeBtnText}>Nâng Cấp Gói Ngay</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.back()}
              style={styles.paywallBackBtn}
            >
              <Text style={styles.paywallBackBtnText}>Quay Lại Trang Chủ</Text>
            </TouchableOpacity>
          </View>
        </View>

        <NotificationModal
          message={modalNotification?.message ?? ""}
          onConfirm={() => {
            const onConfirm = modalNotification?.onConfirm;
            setModalNotification(null);
            onConfirm?.();
          }}
          title={modalNotification?.title ?? ""}
          visible={modalNotification?.visible ?? false}
        />
      </SafeAreaView>
    );
  }

  const activeMoodMeta = MOOD_LIST.find((m) => m.key === selectedMoodKey) || MOOD_LIST[0];
  const badCount = (moodTasksData.BAD || []).length;
  const neutralCount = (moodTasksData.NEUTRAL || []).length;
  const goodCount = (moodTasksData.GOOD || []).length;
  const totalTasksCount = badCount + neutralCount + goodCount;

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Design.colors.black} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Lộ Trình Phát Triển</Text>
          <Text style={styles.headerSub}>Tự do thiết kế & Khám phá</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab("custom")}
          style={[styles.tabItem, activeTab === "custom" && styles.tabItemActive]}
        >
          <Ionicons
            name="create-outline"
            size={18}
            color={activeTab === "custom" ? Design.colors.primaryGreen : Design.colors.mutedText}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "custom" && styles.tabTextActive,
            ]}
          >
            Tự Thiết Kế (15 việc)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("community")}
          style={[
            styles.tabItem,
            activeTab === "community" && styles.tabItemActive,
          ]}
        >
          <Ionicons
            name="people-outline"
            size={18}
            color={
              activeTab === "community" ? Design.colors.primaryGreen : Design.colors.mutedText
            }
          />
          <Text
            style={[
              styles.tabText,
              activeTab === "community" && styles.tabTextActive,
            ]}
          >
            Cộng Đồng
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "custom" ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Goal Info Card */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Thông Tin Lộ Trình</Text>

            <Text style={styles.inputLabel}>Tên mục tiêu *</Text>
            <TextInput
              onChangeText={setGoalName}
              placeholder="VD: Rèn luyện thói quen dậy sớm & sống tích cực..."
              placeholderTextColor="#9CA3AF"
              style={styles.textInput}
              value={goalName}
            />

            <Text style={styles.inputLabel}>Mô tả mục tiêu</Text>
            <TextInput
              multiline
              numberOfLines={3}
              onChangeText={setDescription}
              placeholder="Chia sẻ lý do hoặc định hướng của bạn..."
              placeholderTextColor="#9CA3AF"
              style={[styles.textInput, styles.textArea]}
              value={description}
            />

            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Công khai lên Cộng Đồng</Text>
                <Text style={styles.switchSub}>
                  Cho phép mọi người cùng khám phá và áp dụng lộ trình của bạn
                </Text>
              </View>
              <Switch
                onValueChange={setIsPublic}
                thumbColor={isPublic ? Design.colors.primaryGreen : "#D1D5DB"}
                trackColor={{ false: "#E5E7EB", true: "#A7F3D0" }}
                value={isPublic}
              />
            </View>
          </View>

          {/* 15 Tasks according to 3 Moods Card */}
          <View style={styles.card}>
            <View style={styles.weekHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>15 Nhiệm Vụ Theo 3 Tâm Trạng</Text>
                <Text style={styles.sectionSub}>Mỗi tâm trạng gồm đúng 5 nhiệm vụ</Text>
              </View>
              <TouchableOpacity
                onPress={handleOpenCatalog}
                style={styles.catalogButton}
              >
                <Ionicons name="time-outline" size={16} color="#0284C7" />
                <Text style={styles.catalogButtonText}>Chọn từ quá khứ</Text>
              </TouchableOpacity>
            </View>

            {/* Total progress overview pills */}
            <View style={styles.totalProgressRow}>
              <View style={[styles.progressItemPill, badCount === 5 && styles.progressItemPillComplete]}>
                <Text style={styles.progressItemPillText}>🌧️ Tệ: {badCount}/5</Text>
              </View>
              <View style={[styles.progressItemPill, neutralCount === 5 && styles.progressItemPillComplete]}>
                <Text style={styles.progressItemPillText}>⛅ Bình thường: {neutralCount}/5</Text>
              </View>
              <View style={[styles.progressItemPill, goodCount === 5 && styles.progressItemPillComplete]}>
                <Text style={styles.progressItemPillText}>☀️ Tốt: {goodCount}/5</Text>
              </View>
            </View>

            {/* Mood Tabs */}
            <View style={styles.moodTabsRow}>
              {MOOD_LIST.map((m) => {
                const count = (moodTasksData[m.key] || []).length;
                const isSelected = selectedMoodKey === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    onPress={() => setSelectedMoodKey(m.key)}
                    style={[
                      styles.moodTabBtn,
                      isSelected && {
                        borderColor: m.color,
                        backgroundColor: m.badgeBg,
                        borderWidth: 2,
                      },
                    ]}
                  >
                    <Text style={styles.moodTabEmoji}>{m.emoji}</Text>
                    <Text
                      style={[
                        styles.moodTabLabel,
                        isSelected && { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold },
                      ]}
                    >
                      {m.label}
                    </Text>
                    <View
                      style={[
                        styles.moodBadge,
                        count === 5 ? { backgroundColor: "#10B981" } : isSelected ? { backgroundColor: m.color } : null,
                      ]}
                    >
                      <Text style={styles.moodBadgeText}>
                        {count}/5
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Mood Description Banner */}
            <View style={[styles.moodDescBanner, { borderLeftColor: activeMoodMeta.color }]}>
              <Text style={styles.moodDescTitle}>
                {activeMoodMeta.emoji} {activeMoodMeta.label}
              </Text>
              <Text style={styles.moodDescSub}>{activeMoodMeta.sub}</Text>
            </View>

            {/* Task list for active mood */}
            <View style={styles.taskListContainer}>
              {(moodTasksData[selectedMoodKey] || []).length === 0 ? (
                <View style={styles.emptyWeekBox}>
                  <Ionicons
                    name="list-outline"
                    size={32}
                    color="#D1D5DB"
                  />
                  <Text style={styles.emptyWeekText}>
                    Chưa có nhiệm vụ cho {activeMoodMeta.label}.
                  </Text>
                  <Text style={styles.emptyWeekSub}>
                    Thêm 5 nhiệm vụ bên dưới hoặc bấm &quot;Chọn từ quá khứ&quot; để chọn lại các thói quen hiệu quả!
                  </Text>
                </View>
              ) : (
                moodTasksData[selectedMoodKey].map((task, idx) => (
                  <View key={idx} style={styles.taskItemCard}>
                    <View style={styles.taskItemIndex}>
                      <Text style={styles.taskIndexText}>{idx + 1}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.taskItemTitle}>{task.title}</Text>
                      {task.content ? (
                        <Text style={styles.taskItemContent}>
                          {task.content}
                        </Text>
                      ) : null}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveTask(selectedMoodKey, idx)}
                      style={styles.deleteTaskBtn}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>
                ))
              )}

              {/* Add Task Input or Completed State */}
              {(moodTasksData[selectedMoodKey] || []).length >= 5 ? (
                <View style={styles.completedMoodBanner}>
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  <Text style={styles.completedMoodText}>
                    Đã hoàn tất 5/5 nhiệm vụ cho {activeMoodMeta.label}!
                  </Text>
                </View>
              ) : (
                <View style={styles.addTaskRow}>
                  <TextInput
                    onChangeText={setNewTaskInput}
                    onSubmitEditing={handleAddNewTask}
                    placeholder={`Thêm nhiệm vụ ${ (moodTasksData[selectedMoodKey] || []).length + 1 }/5...`}
                    placeholderTextColor="#9CA3AF"
                    style={styles.addTaskInput}
                    value={newTaskInput}
                  />
                  <TouchableOpacity
                    onPress={handleAddNewTask}
                    style={styles.addTaskBtn}
                  >
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          {/* Submit Action */}
          <TouchableOpacity
            disabled={isSubmittingCustom}
            onPress={handleSubmitCustomGoal}
            style={[
              styles.submitButton,
              isSubmittingCustom && { opacity: 0.7 },
            ]}
          >
            {isSubmittingCustom ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="rocket-outline" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  Khởi Tạo Lộ Trình ({totalTasksCount}/15)
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        /* Community Tab */
        <View style={{ flex: 1 }}>
          {isCommunityLoading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator
                color={Design.colors.primaryGreen}
                size="large"
              />
              <Text style={styles.loadingText}>Đang tải lộ trình cộng đồng...</Text>
            </View>
          ) : publicGoals.length === 0 ? (
            <View style={styles.centerBox}>
              <Ionicons name="earth-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>Chưa có lộ trình cộng đồng nào</Text>
              <Text style={styles.emptySub}>
                Hãy là người đầu tiên thiết kế và chia sẻ lộ trình của bạn!
              </Text>
            </View>
          ) : (
            <FlatList
              contentContainerStyle={styles.communityList}
              data={publicGoals}
              keyExtractor={(item) => String(item.goalId)}
              renderItem={({ item }) => {
                const badLen = item.badTasks?.length ?? (item.weeks ? (item.weeks[0]?.tasks?.length || 0) : 5);
                const neutralLen = item.neutralTasks?.length ?? (item.weeks ? (item.weeks[1]?.tasks?.length || 0) : 5);
                const goodLen = item.goodTasks?.length ?? (item.weeks ? (item.weeks[2]?.tasks?.length || 0) : 5);
                const totalTasks = badLen + neutralLen + goodLen;

                return (
                  <View style={styles.communityCard}>
                    <View style={styles.communityCardHeader}>
                      <View style={styles.authorAvatar}>
                        <Text style={styles.authorAvatarText}>
                          {(item.authorName || "P")[0].toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.authorName}>{item.authorName}</Text>
                        <Text style={styles.communityDate}>
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                            : "Cộng đồng"}
                        </Text>
                      </View>
                      <View style={styles.communityTaskCountBadge}>
                        <Ionicons
                          name="checkbox-outline"
                          size={14}
                          color="#059669"
                        />
                        <Text style={styles.communityTaskCountText}>
                          {totalTasks} nhiệm vụ
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.communityGoalTitle}>{item.goalName}</Text>
                    {item.description ? (
                      <Text style={styles.communityGoalDesc}>
                        {item.description}
                      </Text>
                    ) : null}

                    {/* Mood summary pills */}
                    <View style={styles.moodPillsRow}>
                      <View style={[styles.moodPill, { backgroundColor: "#FEE2E2", borderColor: "#EF4444" }]}>
                        <Text style={[styles.moodPillText, { color: "#B91C1C" }]}>
                          🌧️ Tệ: {badLen}
                        </Text>
                      </View>
                      <View style={[styles.moodPill, { backgroundColor: "#FEF3C7", borderColor: "#F59E0B" }]}>
                        <Text style={[styles.moodPillText, { color: "#B45309" }]}>
                          ⛅ Bình thường: {neutralLen}
                        </Text>
                      </View>
                      <View style={[styles.moodPill, { backgroundColor: "#D1FAE5", borderColor: "#10B981" }]}>
                        <Text style={[styles.moodPillText, { color: "#047857" }]}>
                          ☀️ Tốt: {goodLen}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      disabled={cloningGoalId === item.goalId}
                      onPress={() => handleInitiateClone(item)}
                      style={[
                        styles.cloneButton,
                        cloningGoalId === item.goalId && { opacity: 0.6 },
                      ]}
                    >
                      {cloningGoalId === item.goalId ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Ionicons
                            name="copy-outline"
                            size={16}
                            color="#FFFFFF"
                          />
                          <Text style={styles.cloneButtonText}>
                            Áp Dụng Lộ Trình Này
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                );
              }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      )}

      {/* Catalog Modal */}
      <Modal
        animationType="slide"
        onRequestClose={() => setIsCatalogModalVisible(false)}
        transparent
        visible={isCatalogModalVisible}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.catalogModalBox}>
            <View style={styles.catalogModalHeader}>
              <View>
                <Text style={styles.catalogModalTitle}>
                  Nhiệm Vụ Đã Làm Trong Quá Khứ
                </Text>
                <Text style={styles.catalogModalSub}>
                  Chọn để thêm vào {activeMoodMeta.label} (Còn {Math.max(0, 5 - (moodTasksData[selectedMoodKey]?.length || 0))} chỗ)
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsCatalogModalVisible(false)}
                style={styles.closeModalBtn}
              >
                <Ionicons name="close" size={22} color={Design.colors.black} />
              </TouchableOpacity>
            </View>

            {isCatalogLoading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator
                  color={Design.colors.primaryGreen}
                  size="large"
                />
                <Text style={styles.loadingText}>Đang tải nhiệm vụ quá khứ...</Text>
              </View>
            ) : pastCatalogs.length === 0 ? (
              <View style={styles.centerBox}>
                <Ionicons name="archive-outline" size={44} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>
                  Chưa có nhiệm vụ quá khứ nào
                </Text>
                <Text style={styles.emptySub}>
                  Bạn chưa có nhiệm vụ nào từ các mục tiêu đã làm trước đây.
                </Text>
              </View>
            ) : (
              <ScrollView
                contentContainerStyle={{ paddingBottom: 20 }}
                showsVerticalScrollIndicator={false}
              >
                {pastCatalogs.map((goal) => (
                  <View key={goal.goalId} style={styles.catalogGoalGroup}>
                    <Text style={styles.catalogGoalName}>
                      🎯 {goal.goalName}
                    </Text>
                    {goal.tasks.map((task) => {
                      const isSelected = selectedCatalogTaskIds.has(task.taskId);
                      return (
                        <TouchableOpacity
                          key={task.taskId}
                          onPress={() => handleToggleCatalogTask(task.taskId)}
                          style={[
                            styles.catalogTaskRow,
                            isSelected && styles.catalogTaskRowSelected,
                          ]}
                        >
                          <Ionicons
                            name={isSelected ? "checkbox" : "square-outline"}
                            size={20}
                            color={isSelected ? Design.colors.primaryGreen : "#9CA3AF"}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.catalogTaskTitle}>
                              {task.title}
                            </Text>
                            {task.content ? (
                              <Text style={styles.catalogTaskContent}>
                                {task.content}
                              </Text>
                            ) : null}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.catalogModalFooter}>
              <TouchableOpacity
                onPress={() => setIsCatalogModalVisible(false)}
                style={styles.cancelModalBtn}
              >
                <Text style={styles.cancelModalBtnText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={selectedCatalogTaskIds.size === 0}
                onPress={handleAddSelectedCatalogTasks}
                style={[
                  styles.confirmCatalogBtn,
                  selectedCatalogTaskIds.size === 0 && { opacity: 0.5 },
                ]}
              >
                <Text style={styles.confirmCatalogBtnText}>
                  Thêm ({selectedCatalogTaskIds.size}) vào {activeMoodMeta.label}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Community Clone Choice Modal (REPLACE_NOW vs SET_AS_NEXT) */}
      <Modal
        animationType="slide"
        onRequestClose={() => setIsCloneChoiceModalVisible(false)}
        transparent
        visible={isCloneChoiceModalVisible}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cloneChoiceModalBox}>
            <View style={styles.cloneChoiceHeader}>
              <View style={styles.cloneIconCircle}>
                <Ionicons name="git-branch-outline" size={26} color="#059669" />
              </View>
              <Text style={styles.cloneChoiceTitle}>Áp Dụng Lộ Trình Cộng Đồng</Text>
              <Text style={styles.cloneChoiceSubtitle}>
                Bạn hiện đang có mục tiêu:{"\n"}
                <Text style={{ fontFamily: FontFamily.beVietnamSemiBold, color: Design.colors.black }}>
                  &ldquo;{currentGoal?.goalName || "Mục tiêu hiện tại"}&rdquo;
                </Text>
              </Text>
            </View>

            {/* Option 1: Kết thúc lộ trình cũ & Áp dụng ngay */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (selectedPublicGoalForClone) {
                  void executeClone(selectedPublicGoalForClone.goalId, "REPLACE_NOW");
                }
              }}
              style={styles.cloneOptionCard}
            >
              <View style={[styles.cloneOptionIconBox, { backgroundColor: "#FEE2E2" }]}>
                <Ionicons name="flash-outline" size={22} color="#EF4444" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cloneOptionTitle}>Kết thúc lộ trình hiện tại & Bắt đầu ngay</Text>
                <Text style={styles.cloneOptionDesc}>
                  Hoàn tất mục tiêu hiện tại đang dang dở và chuyển sang lộ trình cộng đồng này từ hôm nay.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Option 2: Tiếp tục lộ trình cũ & Đặt làm mục tiêu tiếp theo */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => {
                if (selectedPublicGoalForClone) {
                  void executeClone(selectedPublicGoalForClone.goalId, "SET_AS_NEXT");
                }
              }}
              style={styles.cloneOptionCard}
            >
              <View style={[styles.cloneOptionIconBox, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="arrow-forward-circle-outline" size={22} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cloneOptionTitle}>Tiếp tục & Đặt làm mục tiêu tiếp theo</Text>
                <Text style={styles.cloneOptionDesc}>
                  Tiếp tục rèn luyện mục tiêu hiện tại. Lộ trình này sẽ tự động áp dụng khi bạn hoàn thành.
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              onPress={() => setIsCloneChoiceModalVisible(false)}
              style={styles.cancelCloneBtn}
            >
              <Text style={styles.cancelCloneBtnText}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Clean Modal for feedback */}
      {modalNotification && (
        <NotificationModal
          message={modalNotification.message}
          onConfirm={() => {
            const cb = modalNotification.onConfirm;
            setModalNotification(null);
            if (cb) cb();
          }}
          title={modalNotification.title}
          visible={modalNotification.visible}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleWrap: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
  },
  headerSub: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
    marginTop: 1,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tabItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 13,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabItemActive: {
    borderBottomColor: Design.colors.primaryGreen,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamMedium,
    color: Design.colors.mutedText,
  },
  tabTextActive: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
  },
  sectionSub: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#374151",
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.black,
  },
  textArea: {
    height: 70,
    textAlignVertical: "top",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  switchLabel: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamMedium,
    color: Design.colors.black,
  },
  switchSub: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
    marginTop: 2,
    maxWidth: "85%",
  },
  weekHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  catalogButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  catalogButtonText: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#0284C7",
  },
  totalProgressRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  progressItemPill: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    paddingVertical: 6,
    alignItems: "center",
  },
  progressItemPillComplete: {
    backgroundColor: "#DCFCE7",
  },
  progressItemPillText: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#374151",
  },
  moodTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  moodTabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  moodTabEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  moodTabLabel: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#6B7280",
    marginBottom: 4,
  },
  moodBadge: {
    backgroundColor: "#9CA3AF",
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  moodBadgeText: {
    fontSize: 10,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: "#FFFFFF",
  },
  moodDescBanner: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  moodDescTitle: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
  },
  moodDescSub: {
    fontSize: 11.5,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
    marginTop: 2,
  },
  taskListContainer: {
    marginTop: 4,
  },
  emptyWeekBox: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    marginBottom: 12,
  },
  emptyWeekText: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#6B7280",
    marginTop: 8,
  },
  emptyWeekSub: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamRegular,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 4,
  },
  taskItemCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  taskItemIndex: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  taskIndexText: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: "#4B5563",
  },
  taskItemTitle: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamMedium,
    color: Design.colors.black,
  },
  taskItemContent: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
    marginTop: 2,
  },
  deleteTaskBtn: {
    padding: 6,
  },
  completedMoodBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 4,
  },
  completedMoodText: {
    fontSize: 12.5,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: "#065F46",
  },
  addTaskRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  addTaskInput: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.black,
  },
  addTaskBtn: {
    backgroundColor: Design.colors.primaryGreen,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButton: {
    backgroundColor: Design.colors.primaryGreen,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: Design.colors.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  communityList: {
    padding: 16,
    paddingBottom: 40,
  },
  communityCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  communityCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  authorAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E0F2FE",
    justifyContent: "center",
    alignItems: "center",
  },
  authorAvatarText: {
    fontSize: 15,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: "#0284C7",
  },
  authorName: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
  },
  communityDate: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
  },
  communityTaskCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  communityTaskCountText: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#059669",
  },
  communityGoalTitle: {
    fontSize: 16,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
    marginBottom: 4,
  },
  communityGoalDesc: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamRegular,
    color: "#4B5563",
    lineHeight: 18,
    marginBottom: 12,
  },
  moodPillsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  moodPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  moodPillText: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  cloneButton: {
    backgroundColor: Design.colors.primaryGreen,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    borderRadius: 12,
  },
  cloneButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  catalogModalBox: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    padding: 20,
  },
  catalogModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  catalogModalTitle: {
    fontSize: 16,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
  },
  catalogModalSub: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamRegular,
    color: "#0284C7",
    marginTop: 2,
  },
  closeModalBtn: {
    padding: 4,
  },
  catalogGoalGroup: {
    marginBottom: 16,
  },
  catalogGoalName: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: "#374151",
    marginBottom: 8,
  },
  catalogTaskRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  catalogTaskRowSelected: {
    backgroundColor: "#ECFDF5",
    borderColor: Design.colors.primaryGreen,
  },
  catalogTaskTitle: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamMedium,
    color: Design.colors.black,
  },
  catalogTaskContent: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
    marginTop: 2,
  },
  catalogModalFooter: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 14,
  },
  cancelModalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelModalBtnText: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#4B5563",
  },
  confirmCatalogBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Design.colors.primaryGreen,
    alignItems: "center",
  },
  confirmCatalogBtnText: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: "#FFFFFF",
  },
  cloneChoiceModalBox: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    borderTopWidth: 2,
    borderColor: "#000000",
  },
  cloneChoiceHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  cloneIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#10B981",
  },
  cloneChoiceTitle: {
    fontSize: 18,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
    textAlign: "center",
  },
  cloneChoiceSubtitle: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamRegular,
    color: "#4B5563",
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
  cloneOptionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#000000",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  cloneOptionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cloneOptionTitle: {
    fontSize: 13.5,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
    marginBottom: 2,
  },
  cloneOptionDesc: {
    fontSize: 11.5,
    fontFamily: FontFamily.beVietnamRegular,
    color: "#6B7280",
    lineHeight: 16,
  },
  cancelCloneBtn: {
    marginTop: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelCloneBtnText: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#6B7280",
  },
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 12,
    fontFamily: FontFamily.beVietnamRegular,
    color: Design.colors.mutedText,
    textAlign: "center",
    marginTop: 4,
  },
  paywallContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  paywallCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: Design.colors.white,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#000000",
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 22,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  paywallIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#F59E0B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  paywallVipBadge: {
    backgroundColor: "#FFC857",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#000000",
    marginBottom: 10,
  },
  paywallVipText: {
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: 10,
    color: "#000000",
    letterSpacing: 0.5,
  },
  paywallTitle: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 20,
    color: "#000000",
    textAlign: "center",
    marginBottom: 8,
  },
  paywallDesc: {
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 20,
  },
  paywallUpgradeBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#3A8157",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#000000",
    paddingVertical: 14,
    shadowColor: "#000000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  paywallUpgradeBtnText: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  paywallBackBtn: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: "center",
  },
  paywallBackBtnText: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 13,
    color: "#6B7280",
  },
});
