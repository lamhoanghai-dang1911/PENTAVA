import { Design, FontFamily } from '@/src/constants/design';
import { DailyTaskModals } from '@/src/features/tasks/components/daily-task-modals';
import { DailyTasksHeader } from '@/src/features/tasks/components/daily-tasks-header';
import { TaskCard } from '@/src/features/tasks/components/task-card';
import { useDailyTasks } from '@/src/features/tasks/hooks/use-daily-tasks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import {
    ActivityIndicator,
    Alert,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DailyTasksScreen() {
    const dailyTasks = useDailyTasks({
        onOpenMoodSelection: (goalId) =>
            router.push({
                pathname: '/mood',
                params: {
                    goalId: String(goalId),
                },
            } as any),

        onOpenTask: (taskId, weekNumber, taskIndex) =>
            router.push({
                pathname: "/task1/page1",
                params: {
                    taskId: String(taskId),
                    week: String(weekNumber),
                },
            }),
    });

    /**
     * Mở màn hình chụp ảnh check-in.
     *
     * Route hiện tại của project:
     * Task 1 -> /task1/page4
     * Task 2 -> /task2/page4
     * Task 3 -> /task3/page6
     * Task 4 -> /task4/page4
     * Task 5 -> /task5/page3
     */
    const startTaskCheckIn = (
        task: { id: number; progressId?: number },
        index: number,
    ) => {
        const captureRoutes = [
            '/task1/page4',
            '/task2/page4',
            '/task3/page6',
            '/task4/page4',
            '/task5/page3',
        ] as const;

        const route = captureRoutes[index];

        if (!route) {
            Alert.alert(
                'Không tìm thấy màn hình check-in',
                'Màn hình check-in cho nhiệm vụ này chưa được cấu hình.',
            );
            return;
        }

        if (!task.progressId) {
            Alert.alert(
                'Không thể check-in',
                'Nhiệm vụ chưa có thông tin tiến độ để check-in.',
            );
            return;
        }

        router.push({
            pathname: route,
            params: {
                taskId: String(task.id),
                progressId: String(task.progressId),
                week: String(dailyTasks.weekNumber),
            },
        } as any);
    };

    /**
     * Sau khi task complete thành công và user chọn "Để sau",
     * quay lại màn Daily Task.
     */
    const handleBackToDailyTasks = () => {
        router.replace('/daily-tasks');
    };

    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                contentInsetAdjustmentBehavior="never"
                showsVerticalScrollIndicator={false}>

                <DailyTasksHeader
                    dates={dailyTasks.dates}
                    onChangeWeek={dailyTasks.changeWeek}
                    onSelectDay={dailyTasks.setSelectedDayIndex}
                    selectedDayIndex={dailyTasks.selectedDayIndex}
                    todayKey={dailyTasks.todayKey}
                    weekNumber={dailyTasks.weekNumber}
                />

                {/* <Pressable
                    accessibilityRole="button"
                    onPress={() =>
                        Alert.alert(
                            'Nhật ký',
                            'Tính năng nhật ký sẽ được cập nhật sau.',
                        )
                    }
                    style={({ pressed }) => [styles.diaryCard, pressed && { transform: [{ scale: 0.98 }] }]}>
                    <Text style={styles.diaryTitle}>
                        NHẬT KÝ HÔM NAY
                    </Text>

                    <View style={styles.diaryButton}>
                        <Text style={styles.diaryButtonText}>
                            Xem
                        </Text>
                    </View>
                </Pressable> */}

                {dailyTasks.isLoading ? (
                    <ActivityIndicator
                        color={Design.colors.primaryGreen}
                        size="large"
                        style={styles.loading}
                    />
                ) : null}

                {dailyTasks.isFutureSelected ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
                            Chưa thể xem nhiệm vụ của ngày này.
                        </Text>
                    </View>
                ) : null}

                {!dailyTasks.isLoading &&
                    dailyTasks.isDailyStatusLoaded &&
                    dailyTasks.isTodaySelected &&
                    !dailyTasks.dailyStatus?.hasConfirmedToday ? (
                    <View style={styles.executeCard}>
                        <View style={styles.executeBadge}>
                            <Ionicons color="#059669" name="sparkles" size={14} />
                            <Text style={styles.executeBadgeText}>Mục tiêu ngày</Text>
                        </View>

                        <Text style={styles.executeTitle}>
                            Khởi động 5 nhiệm vụ hôm nay 🌱
                        </Text>

                        <Text style={styles.executeDescription}>
                            Thực hiện các nhiệm vụ lành mạnh mỗi ngày để tích lũy Ruby và duy trì ngọn lửa Streak rực cháy!
                        </Text>

                        <Pressable
                            disabled={dailyTasks.isDailyStatusLoading}
                            onPress={dailyTasks.handleExecuteToday}
                            style={({ pressed }) => [
                                styles.executeAction,
                                pressed && !dailyTasks.isDailyStatusLoading && { transform: [{ scale: 0.95 }] },
                            ]}>
                            {dailyTasks.isDailyStatusLoading ? (
                                <ActivityIndicator color={Design.colors.white} />
                            ) : (
                                <View style={styles.executeActionContent}>
                                    <Text style={styles.executeActionText}>Thực thi ngay</Text>
                                    <Ionicons color="#FFFFFF" name="arrow-forward" size={16} />
                                </View>
                            )}
                        </Pressable>
                    </View>
                ) : null}

                {!dailyTasks.isLoading &&
                    !dailyTasks.isFutureSelected &&
                    (!dailyTasks.isTodaySelected ||
                        dailyTasks.dailyStatus?.hasConfirmedToday)
                    ? dailyTasks.selectedTasks.map((task, index) => (
                        <TaskCard
                            key={`${task.id} - ${index}`}
                            completingTaskId={dailyTasks.completingTaskId}
                            index={index}
                            isTodaySelected={dailyTasks.isTodaySelected}
                            onCompleteTask={dailyTasks.handleCompleteTask}
                            onDismissCheckIn={dailyTasks.showStreak}
                            onOpenTask={dailyTasks.openTask}
                            onStartCheckIn={(task) => startTaskCheckIn(task, index)}
                            onSwap={dailyTasks.openSwap}
                            task={task}
                            weekNumber={dailyTasks.weekNumber}
                        />

                    ))
                    : null}
            </ScrollView>

            <DailyTaskModals
                completedStreak={dailyTasks.completedStreak}
                dailyStatusVisible={
                    dailyTasks.isDailyStatusVisible
                }
                isConfirmingDailyTasks={
                    dailyTasks.isConfirmingDailyTasks
                }
                streakVisible={
                    dailyTasks.isStreakVisible
                }
                isSwapLoading={
                    dailyTasks.isSwapLoading
                }
                isSwapping={
                    dailyTasks.isSwapping
                }
                swapSuccessVisible={
                    dailyTasks.swapSuccessVisible
                }
                onCancelStreak={() =>
                    dailyTasks.setIsStreakVisible(false)
                }
                onCloseDailyStatus={() =>
                    dailyTasks.setIsDailyStatusVisible(false)
                }
                onCloseSwap={() =>
                    dailyTasks.setSwapTask(null)
                }
                onCloseSwapSuccess={() =>
                    dailyTasks.setSwapSuccessVisible(false)
                }
                onConfirmSwap={
                    dailyTasks.handleSwapTask
                }
                onKeepYesterdayTasks={
                    dailyTasks.handleKeepYesterdayTasks
                }
                onOpenMoodSelection={
                    dailyTasks.openMoodSelection
                }
                swapCandidates={
                    dailyTasks.swapCandidates
                }
                swapTask={
                    dailyTasks.swapTask
                }
                yesterdayTasks={
                    dailyTasks.dailyStatus?.yesterdayTasks ?? []
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8FAF7',
    },

    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 36,
    },

    diaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Design.colors.primaryGreen,
        borderRadius: 18,
        paddingHorizontal: 20,
        paddingVertical: 20,
        marginBottom: 16,
    },

    diaryTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.white,
    },

    diaryButton: {
        backgroundColor: Design.colors.white,
        borderRadius: 20,
        paddingHorizontal: 28,
        paddingVertical: 8,
    },

    diaryButtonText: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
        color: Design.colors.primaryGreen,
    },

    loading: {
        marginVertical: 24,
    },

    emptyState: {
        alignItems: 'center',
        paddingVertical: 28,
    },

    emptyStateText: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.body,
    },

    executeCard: {
        alignItems: 'center',
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#D1FAE5',
        paddingHorizontal: 20,
        paddingVertical: 26,
        marginBottom: 16,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },

    executeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: '#ECFDF5',
        borderWidth: 1,
        borderColor: '#A7F3D0',
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginBottom: 8,
    },

    executeBadgeText: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 12,
        color: '#065F46',
    },

    executeTitle: {
        color: '#0F291E',
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 18,
        marginTop: 4,
        textAlign: 'center',
    },

    executeDescription: {
        color: '#64748B',
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: 12.5,
        lineHeight: 18,
        marginTop: 6,
        textAlign: 'center',
        paddingHorizontal: 10,
    },

    executeAction: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 160,
        minHeight: 44,
        borderRadius: 22,
        backgroundColor: '#10B981',
        marginTop: 18,
        paddingHorizontal: 24,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },

    executeActionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },

    executeActionText: {
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 14,
    },
});
