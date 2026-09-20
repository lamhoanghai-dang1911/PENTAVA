import { Design, FontFamily } from "@/src/constants/design";
import { TASK_COLORS_BY_INDEX } from "@/src/features/tasks/constants";
import type { TaskCardProps } from "@/src/features/tasks/types/task-card";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

export function TaskCard({
    task,
    index,
    isTodaySelected,
    weekNumber,
    completingTaskId,
    onOpenTask,
    onCompleteTask,
    onStartCheckIn,
    onSwap,
}: TaskCardProps) {
    const isCompleting = completingTaskId === task.id;
    const [isCheckInModalVisible, setIsCheckInModalVisible] = useState(false);

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
        <View
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
                onPress={() =>
                    onOpenTask(task.id, weekNumber, index)
                }
                style={styles.details}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>
                        {`Nhiệm vụ ${String(index + 1).padStart(2, "0")} `}
                    </Text>

                    <Ionicons
                        color={Design.colors.white}
                        name={
                            task.isCompleted
                                ? "checkmark-circle"
                                : "checkmark-circle-outline"
                        }
                        size={22}
                    />
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
                        style={[
                            styles.action,
                            task.isCompleted &&
                            styles.actionCompleted,
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
                                : "Hoàn thành"}
                        </Text>
                    </Pressable>

                    {!task.isCompleted ? (
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => onSwap(task)}
                            style={styles.action}
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
                    ) : null}
                </View>
            ) : null}

            <Modal
                animationType="fade"
                onRequestClose={() => setIsCheckInModalVisible(false)}
                transparent
                visible={isCheckInModalVisible}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.checkInModal}>
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
                            onPress={() => setIsCheckInModalVisible(false)}
                            style={styles.modalSecondaryAction}
                        >
                            <Text style={styles.modalSecondaryActionText}>
                                Để sau
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
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

    actionText: {
        color: Design.colors.primaryGreen,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 1,
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
});
