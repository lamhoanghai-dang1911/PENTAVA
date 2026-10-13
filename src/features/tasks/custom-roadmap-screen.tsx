import { NotificationModal } from "@/src/components/ui/notification-modal";
import { Design, FontFamily } from "@/src/constants/design";
import { useEntitlement } from "@/src/features/subscription/hooks/use-entitlement";
import { onboardingService } from "@/src/services/onboardingService";
import type {
  CustomTaskItem,
  CustomWeek,
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

  // State: Tự Thiết Kế
  const [goalName, setGoalName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedWeekNum, setSelectedWeekNum] = useState<number>(1);
  const [weeksData, setWeeksData] = useState<Record<number, CustomTaskItem[]>>({
    1: [],
    2: [],
    3: [],
    4: [],
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

  useEffect(() => {
    if (activeTab === "community") {
      void loadPublicGoals();
    }
  }, [activeTab]);

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

    setWeeksData((prev) => ({
      ...prev,
      [selectedWeekNum]: [...(prev[selectedWeekNum] || []), ...tasksToAdd],
    }));

    setIsCatalogModalVisible(false);
  };

  const handleAddNewTask = () => {
    const trimmed = newTaskInput.trim();
    if (!trimmed) return;
    setWeeksData((prev) => ({
      ...prev,
      [selectedWeekNum]: [
        ...(prev[selectedWeekNum] || []),
        { title: trimmed },
      ],
    }));
    setNewTaskInput("");
  };

  const handleRemoveTask = (weekNum: number, index: number) => {
    setWeeksData((prev) => ({
      ...prev,
      [weekNum]: prev[weekNum].filter((_, i) => i !== index),
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

    const totalTasks = Object.values(weeksData).reduce(
      (sum, list) => sum + list.length,
      0
    );
    if (totalTasks === 0) {
      setModalNotification({
        visible: true,
        title: "Chưa có nhiệm vụ",
        message: "Vui lòng thêm ít nhất một nhiệm vụ cho lộ trình của bạn.",
      });
      return;
    }

    setIsSubmittingCustom(true);
    try {
      // Chỉ gửi những tuần có nhiệm vụ để không bị lỗi validation nếu các tuần còn lại chưa điền
      const weeks: CustomWeek[] = [1, 2, 3, 4]
        .map((w) => ({
          weekNumber: w,
          tasks: (weeksData[w] || []).filter((t) => t.title && t.title.trim().length > 0),
        }))
        .filter((w) => w.tasks.length > 0);

      await onboardingService.createCustomGoal({
        goalName: goalName.trim(),
        description: description.trim(),
        isPublic,
        weeks,
      });

      setModalNotification({
        visible: true,
        title: "Tạo Lộ Trình Thành Công 🎉",
        message: "Lộ trình mới đã được thiết lập làm mục tiêu hiện tại của bạn!",
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

  const handleCloneGoal = (item: PublicGoalSummary) => {
    if (!isCustomRoadmapUnlocked) {
      setModalNotification({
        visible: true,
        title: "Tính Năng Hội Viên",
        message: "Bạn cần nâng cấp gói cước để có thể nhận lộ trình cộng đồng.",
        onConfirm: () => router.push("/membership"),
      });
      return;
    }

    Alert.alert(
      "Áp Dụng Lộ Trình",
      `Bạn có chắc chắn muốn nhận lộ trình "${item.goalName}" của ${item.authorName} làm mục tiêu hiện tại của mình?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Đồng ý",
          onPress: async () => {
            setCloningGoalId(item.goalId);
            try {
              await onboardingService.clonePublicGoal(item.goalId);
              setModalNotification({
                visible: true,
                title: "Thành Công! 🚀",
                message: "Đã áp dụng lộ trình cộng đồng thành công!",
                onConfirm: () => router.replace("/daily-tasks"),
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
          },
        },
      ]
    );
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
        {/* Header */}
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

        {/* Paywall Container */}
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
              Tính năng tự do thiết kế lộ trình phát triển bản thân 4 tuần và sao chép lộ trình từ cộng đồng chỉ dành riêng cho tài khoản đã nâng cấp gói hội viên.
            </Text>

            {/* <View style={styles.paywallBenefits}>
              <View style={styles.benefitRow}>
                <Ionicons color="#3A8157" name="checkmark-circle" size={18} />
                <Text style={styles.benefitText}>Tự do tạo danh sách nhiệm vụ 4 tuần riêng biệt</Text>
              </View>
              <View style={styles.benefitRow}>
                <Ionicons color="#3A8157" name="checkmark-circle" size={18} />
                <Text style={styles.benefitText}>Khám phá & áp dụng lộ trình từ cộng đồng PENTAVA</Text>
              </View>
              <View style={styles.benefitRow}>
                <Ionicons color="#3A8157" name="checkmark-circle" size={18} />
                <Text style={styles.benefitText}>Công khai lộ trình để chia sẻ thành tựu của bạn</Text>
              </View>
            </View> */}

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
            Tự Thiết Kế
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
              placeholder="VD: Rèn luyện thói quen dậy sớm 30 ngày..."
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
                  Cho phép mọi người cùng khám phá và học hỏi lộ trình của bạn
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

          {/* Week Selector */}
          <View style={styles.card}>
            <View style={styles.weekHeaderRow}>
              <Text style={styles.sectionTitle}>Kế Hoạch 4 Tuần</Text>
              <TouchableOpacity
                onPress={handleOpenCatalog}
                style={styles.catalogButton}
              >
                <Ionicons name="time-outline" size={16} color="#0284C7" />
                <Text style={styles.catalogButtonText}>Chọn từ quá khứ</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekTabsRow}>
              {[1, 2, 3, 4].map((w) => {
                const count = (weeksData[w] || []).length;
                const isSelected = selectedWeekNum === w;
                return (
                  <TouchableOpacity
                    key={w}
                    onPress={() => setSelectedWeekNum(w)}
                    style={[
                      styles.weekTabBtn,
                      isSelected && styles.weekTabBtnSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.weekTabBtnText,
                        isSelected && styles.weekTabBtnTextSelected,
                      ]}
                    >
                      Tuần {w}
                    </Text>
                    <View
                      style={[
                        styles.weekBadge,
                        isSelected && styles.weekBadgeSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.weekBadgeText,
                          isSelected && styles.weekBadgeTextSelected,
                        ]}
                      >
                        {count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Current Week Tasks */}
            <View style={styles.taskListContainer}>
              <Text style={styles.weekTitleDetail}>
                Nhiệm vụ Tuần {selectedWeekNum} (
                {(weeksData[selectedWeekNum] || []).length} nhiệm vụ)
              </Text>

              {(weeksData[selectedWeekNum] || []).length === 0 ? (
                <View style={styles.emptyWeekBox}>
                  <Ionicons
                    name="document-text-outline"
                    size={32}
                    color="#D1D5DB"
                  />
                  <Text style={styles.emptyWeekText}>
                    Tuần {selectedWeekNum} chưa có nhiệm vụ nào.
                  </Text>
                  <Text style={styles.emptyWeekSub}>
                    Thêm nhiệm vụ bên dưới hoặc chọn từ nhiệm vụ đã làm ở các mục tiêu trước!
                  </Text>
                </View>
              ) : (
                weeksData[selectedWeekNum].map((task, idx) => (
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
                      onPress={() => handleRemoveTask(selectedWeekNum, idx)}
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

              {/* Add Task Input */}
              <View style={styles.addTaskRow}>
                <TextInput
                  onChangeText={setNewTaskInput}
                  onSubmitEditing={handleAddNewTask}
                  placeholder={`Thêm nhiệm vụ mới cho tuần ${selectedWeekNum}...`}
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
                  Khởi Tạo Lộ Trình Mới
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
                const totalTasks = (item.weeks || []).reduce(
                  (sum, w) => sum + (w.tasks?.length || 0),
                  0
                );
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

                    {/* Week summary pills */}
                    <View style={styles.weekPillsRow}>
                      {(item.weeks || []).map((w) => (
                        <View key={w.weekNumber} style={styles.weekPill}>
                          <Text style={styles.weekPillText}>
                            T{w.weekNumber}: {w.tasks?.length || 0} việc
                          </Text>
                        </View>
                      ))}
                    </View>

                    <TouchableOpacity
                      disabled={cloningGoalId === item.goalId}
                      onPress={() => handleCloneGoal(item)}
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
                  Chọn để thêm vào Tuần {selectedWeekNum}
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
                  Bạn chưa hoàn thành các mục tiêu trước đó để lưu trữ danh mục.
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
                            name={
                              isSelected ? "checkbox" : "square-outline"
                            }
                            size={20}
                            color={
                              isSelected
                                ? Design.colors.primaryGreen
                                : "#9CA3AF"
                            }
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
                          <View style={styles.catalogWeekBadge}>
                            <Text style={styles.catalogWeekBadgeText}>
                              T{task.weekNumber}
                            </Text>
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
                  Thêm ({selectedCatalogTaskIds.size}) vào Tuần {selectedWeekNum}
                </Text>
              </TouchableOpacity>
            </View>
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
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#374151",
    marginBottom: 6,
    marginTop: 8,
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
    height: 80,
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
    alignItems: "center",
    marginBottom: 14,
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
  weekTabsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  weekTabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    paddingVertical: 10,
    borderRadius: 12,
  },
  weekTabBtnSelected: {
    backgroundColor: "#ECFDF5",
    borderColor: Design.colors.primaryGreen,
    borderWidth: 1.5,
  },
  weekTabBtnText: {
    fontSize: 13,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#6B7280",
  },
  weekTabBtnTextSelected: {
    color: Design.colors.primaryGreen,
    fontFamily: FontFamily.beVietnamSemiBold,
  },
  weekBadge: {
    backgroundColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 4,
  },
  weekBadgeSelected: {
    backgroundColor: Design.colors.primaryGreen,
  },
  weekBadgeText: {
    fontSize: 10,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: "#6B7280",
  },
  weekBadgeTextSelected: {
    color: "#FFFFFF",
  },
  taskListContainer: {
    marginTop: 4,
  },
  weekTitleDetail: {
    fontSize: 14,
    fontFamily: FontFamily.beVietnamSemiBold,
    color: Design.colors.black,
    marginBottom: 10,
  },
  emptyWeekBox: {
    alignItems: "center",
    paddingVertical: 24,
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
    width: 26,
    height: 26,
    borderRadius: 13,
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
  addTaskRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
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
  weekPillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 14,
  },
  weekPill: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  weekPillText: {
    fontSize: 11,
    fontFamily: FontFamily.beVietnamRegular,
    color: "#4B5563",
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
  catalogWeekBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  catalogWeekBadgeText: {
    fontSize: 10,
    fontFamily: FontFamily.beVietnamMedium,
    color: "#4B5563",
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
  paywallBenefits: {
    width: "100%",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 14,
    gap: 10,
    marginBottom: 22,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  benefitText: {
    flex: 1,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 12.5,
    color: "#374151",
    lineHeight: 17,
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
