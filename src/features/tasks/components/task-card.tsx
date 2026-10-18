import { Design, FontFamily } from "@/src/constants/design";
import { TASK_COLORS_BY_INDEX } from "@/src/features/tasks/constants";
import type { TaskCardProps } from "@/src/features/tasks/types/task-card";
import { checkinService } from "@/src/services/checkinService";
import { toAndroidSafeUri } from "@/src/services/fileUri";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";

export function TaskCard({
    task,
    index,
    isTodaySelected,
    weekNumber,
    completingTaskId,
    onOpenTask,
    onCompleteTask,
    onStartCheckIn,
    onDismissCheckIn,
    onSwap,
}: TaskCardProps) {
    const isCompleting = completingTaskId === task.id;
    const [isCheckInModalVisible, setIsCheckInModalVisible] = useState(false);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);
    const [isLoadingCheckInImage, setIsLoadingCheckInImage] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState<boolean>(() => {
        return task.progressId ? checkinService.isUploading(task.progressId) : false;
    });
    const [checkInImageUrl, setCheckInImageUrl] = useState<string | null>(() => {
        return task.progressId ? checkinService.getCachedImage(task.progressId) : null;
    });

    useEffect(() => {
        let isMounted = true;

        if (!task.isCompleted || !task.progressId) {
            return () => {
                isMounted = false;
            };
        }

        const progressId = task.progressId;

        // Đăng ký theo dõi trạng thái upload ngầm
        const unsubscribe = checkinService.subscribeUploadStatus(
            progressId,
            (status) => {
                if (!isMounted) return;
                setIsUploadingImage(status.isUploading);
                if (status.imageUrl) {
                    setCheckInImageUrl(status.imageUrl);
                }
                if (status.error) {
                    Alert.alert("Tải ảnh check-in thất bại", status.error);
                }
            }
        );

        // Fetch ảnh từ server nếu chưa có ảnh
        checkinService
            .getImage(progressId)
            .then((response) => {
                if (isMounted && response.imageUrl) {
                    setCheckInImageUrl(response.imageUrl);
                }
            })
            .catch(() => {
                if (isMounted && !checkinService.isUploading(progressId)) {
                    setCheckInImageUrl(null);
                }
            });

        return () => {
            isMounted = false;
            unsubscribe();
        };
    }, [task.isCompleted, task.progressId]);

    const handleViewCheckInImage = async () => {
        if (!task.progressId || isLoadingCheckInImage || isUploadingImage) {
            return;
        }

        if (checkInImageUrl) {
            setIsImageModalVisible(true);
            return;
        }

        try {
            setIsLoadingCheckInImage(true);
            // getImage sẽ đọc cache trước, chỉ khi không có cache mới gọi API
            const response = await checkinService.getImage(task.progressId);
            if (!response.imageUrl) {
                Alert.alert("Chưa có ảnh check-in", "Task này chưa có ảnh check-in.");
                return;
            }

            setCheckInImageUrl(response.imageUrl);
            setIsImageModalVisible(true);
        } catch {
            Alert.alert("Không thể tải ảnh", "Vui lòng thử lại sau.");
        } finally {
            setIsLoadingCheckInImage(false);
        }
    };

    const handleComplete = async () => {
        // Không cho bấm nếu task đã hoàn thành
        // hoặc API đang xử lý task này.
        if (task.isCompleted || isCompleting) {
            return;
        }

        if (!task.progressId) {
            Alert.alert(
                "Không thể hoàn thành nhiệm vụ",
                "Nhiệm vụ chưa có thông tin tiến độ.",
            );
            return;
        }

        try {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch {
            // ignore
        }

        // Gọi API completeTask()
        const completed = await onCompleteTask(task);
        if (!completed) {
            return;
        }

        // API thành công thì mới mở lựa chọn check-in.
        setIsCheckInModalVisible(true);
    };

    const handleStartCheckIn = () => {
        setIsCheckInModalVisible(false);
        onStartCheckIn(task);
    };

    return (
        <Animated.View
            entering={FadeInDown.delay(index * 60).springify().damping(15)}
            style={[
                styles.card,
                {
                    backgroundColor: TASK_COLORS_BY_INDEX[index],
                },
                !isTodaySelected && styles.pastCard,
            ]}
        >
            <Pressable
                accessibilityRole={isTodaySelected ? "button" : undefined}
                disabled={!isTodaySelected}
                style={styles.details}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {`Nhiệm vụ ${String(index + 1).padStart(2, "0")} `}
                    </Text>

                    <Animated.View
                        key={task.isCompleted ? "completed" : "pending"}
                        entering={task.isCompleted ? ZoomIn.springify().damping(12) : undefined}>
                        <Ionicons
                            color={Design.colors.white}
                            name={
                                task.isCompleted
                                    ? "checkmark-circle"
                                    : "checkmark-circle-outline"
                            }
                            size={22}
                        />
                    </Animated.View>
                </View>

                <Text style={styles.description}>
                    {task.content}
                </Text>

                <Text style={styles.status}>
                    {task.isCompleted
                        ? "Đã hoàn thành"
                        : "Chưa hoàn thành"}
                </Text>
            </Pressable>

            {isTodaySelected ? (
                <View style={styles.actions}>
                    <Pressable
                        accessibilityRole="button"
                        disabled={
                            task.isCompleted || isCompleting
                        }
                        onPress={handleComplete}
                        style={({ pressed }) => [
                            styles.action,
                            task.isCompleted &&
                            styles.actionCompleted,
                            pressed && !task.isCompleted && !isCompleting && { transform: [{ scale: 0.95 }] },
                        ]}
                    >
                        {isCompleting ? (
                            <ActivityIndicator
                                color={Design.colors.primaryGreen}
                            />
                        ) : (
                            <Ionicons
                                color={Design.colors.primaryGreen}
                                name="checkmark"
                                size={18}
                            />
                        )}

                        <Text style={styles.actionText}>
                            {task.isCompleted
                                ? "Đã xong"
                                : " Hoàn thành"}
                        </Text>
                    </Pressable>

                    {!task.isCompleted ? (
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => onSwap(task)}
                            style={({ pressed }) => [
                                styles.action,
                                pressed && { transform: [{ scale: 0.95 }] },
                            ]}
                        >
                            <Ionicons
                                color={Design.colors.primaryGreen}
                                name="swap-horizontal"
                                size={18}
                            />

                            <Text style={styles.actionText}>
                                Đổi task
                            </Text>
                        </Pressable>
                    ) : !checkInImageUrl && !isUploadingImage ? (
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => onStartCheckIn(task)}
                            style={({ pressed }) => [
                                styles.action,
                                pressed && { transform: [{ scale: 0.95 }] },
                            ]}
                        >
                            <Ionicons
                                color={Design.colors.primaryGreen}
                                name="camera-outline"
                                size={18}
                            />

                            <Text style={styles.actionText}>
                                Check in
                            </Text>
                        </Pressable>
                    ) : (
                        <Pressable
                            accessibilityRole="button"
                            disabled={isLoadingCheckInImage || isUploadingImage}
                            onPress={handleViewCheckInImage}
                            style={({ pressed }) => [
                                styles.action,
                                (isUploadingImage || isLoadingCheckInImage) && styles.actionDisabled,
                                pressed && !isUploadingImage && !isLoadingCheckInImage && { transform: [{ scale: 0.95 }] },
                            ]}
                        >
                            {isUploadingImage || isLoadingCheckInImage ? (
                                <ActivityIndicator size="small" color={Design.colors.primaryGreen} />
                            ) : (
                                <Ionicons
                                    color={Design.colors.primaryGreen}
                                    name="image-outline"
                                    size={18}
                                />
                            )}

                            <Text style={styles.actionText}>
                                Xem ảnh
                            </Text>
                        </Pressable>
                    )}
                </View>
            ) : null}

            <Modal
                animationType="fade"
                onRequestClose={() => setIsCheckInModalVisible(false)}
                transparent
                visible={isCheckInModalVisible}
            >
                <View style={styles.modalOverlay}>
                    <View
                        style={styles.checkInModal}>
                        <View style={styles.checkInIcon}>
                            <Ionicons
                                color={Design.colors.white}
                                name="camera-outline"
                                size={28}
                            />
                        </View>

                        <Text style={styles.modalTitle}>
                            Hoàn thành nhiệm vụ
                        </Text>
                        <Text style={styles.modalDescription}>
                            Bạn có muốn chụp ảnh check-in cho ngày hôm nay không?
                        </Text>

                        <Pressable
                            accessibilityRole="button"
                            onPress={handleStartCheckIn}
                            style={styles.modalPrimaryAction}
                        >
                            <Ionicons
                                color={Design.colors.white}
                                name="camera"
                                size={18}
                            />
                            <Text style={styles.modalPrimaryActionText}>
                                Có, chụp ảnh
                            </Text>
                        </Pressable>

                        <Pressable
                            accessibilityRole="button"
                            onPress={() => {
                                setIsCheckInModalVisible(false);
                                onDismissCheckIn();
                            }}
                            style={styles.modalSecondaryAction}
                        >
                            <Text style={styles.modalSecondaryActionText}>
                                Để sau
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal
                animationType="fade"
                onRequestClose={() => setIsImageModalVisible(false)}
                transparent
                visible={isImageModalVisible}
            >
                <View style={styles.imageModalOverlay}>
                    <View style={styles.imageModal}>
                        <View style={styles.imageModalHeader}>
                            <Text style={styles.imageModalTitle}>Ảnh check-in</Text>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel="Đóng ảnh check-in"
                                onPress={() => setIsImageModalVisible(false)}
                            >
                                <Ionicons
                                    color={Design.colors.black}
                                    name="close"
                                    size={26}
                                />
                            </Pressable>
                        </View>

                        {checkInImageUrl ? (
                            <Image
                                resizeMode="contain"
                                source={{ uri: toAndroidSafeUri(checkInImageUrl) }}
                                style={styles.checkInImage}
                            />
                        ) : null}
                    </View>
                </View>
            </Modal>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 14,
    },

    pastCard: {
        opacity: 0.88,
    },

    details: {
        alignSelf: "stretch",
        padding: 0,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 6,
    },

    title: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body - 2,
        color: Design.colors.white,
    },

    description: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
        color: Design.colors.white,
        opacity: 0.95,
        lineHeight: 17,
        marginBottom: 10,
    },

    status: {
        alignSelf: "flex-start",
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.22)",
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },

    actions: {
        flexDirection: "row",
        gap: 8,
        marginTop: 12,
    },

    action: {
        flex: 1,
        minHeight: 38,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        borderRadius: 19,
        backgroundColor: Design.colors.white,
        paddingHorizontal: 8,
    },

    actionCompleted: {
        opacity: 0.7,
    },

    actionDisabled: {
        opacity: 0.65,
    },

    actionText: {
        color: Design.colors.primaryGreen,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 1,
    },

    viewImageAction: {
        minHeight: 38,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 5,
        borderRadius: 19,
        backgroundColor: Design.colors.white,
        marginTop: 8,
    },

    modalOverlay: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        paddingHorizontal: 24,
    },

    checkInModal: {
        width: "100%",
        maxWidth: 380,
        alignItems: "center",
        borderRadius: 24,
        backgroundColor: Design.colors.white,
        padding: 24,
    },

    checkInIcon: {
        width: 60,
        height: 60,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 30,
        backgroundColor: Design.colors.primaryGreen,
        marginBottom: 14,
    },

    modalTitle: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.title,
        textAlign: "center",
    },

    modalDescription: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.body - 1,
        lineHeight: 21,
        marginTop: 8,
        marginBottom: 20,
        textAlign: "center",
    },

    modalPrimaryAction: {
        width: "100%",
        minHeight: 46,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: 23,
        backgroundColor: Design.colors.primaryGreen,
    },

    modalPrimaryActionText: {
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body - 1,
    },

    modalSecondaryAction: {
        width: "100%",
        minHeight: 46,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 23,
        borderWidth: 1,
        borderColor: Design.colors.primaryGreen,
        marginTop: 10,
    },

    modalSecondaryActionText: {
        color: Design.colors.primaryGreen,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body - 1,
    },

    imageModalOverlay: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.72)",
        paddingHorizontal: 16,
    },

    imageModal: {
        width: "100%",
        maxWidth: 430,
        borderRadius: 18,
        backgroundColor: Design.colors.white,
        padding: 12,
    },

    imageModalHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },

    imageModalTitle: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
    },

    checkInImage: {
        width: "100%",
        height: 480,
        borderRadius: 12,
        backgroundColor: '#E2E8F0',
    },
});
