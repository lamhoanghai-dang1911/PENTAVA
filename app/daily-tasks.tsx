import { SectionTabs } from '@/src/components/home/section-tabs';
import { Design, FontFamily } from '@/src/constants/design';
import { buildDateStrip } from '@/src/features/tasks/task-utils';
import { onboardingService } from '@/src/services/onboardingService';
import { taskService } from '@/src/services/taskService';
import type { CurrentStreak } from '@/src/types/api/onboarding';
import type { DailyTaskStatus, Task, TaskHistoryEntry } from '@/src/types/api/task';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Màu thẻ nhiệm vụ theo Figma — nên chuyển vào Design.colors khi ổn định
const TASK_COLORS = {
    purple: '#8B72DE',
    yellow: '#F2B544',
    red: '#EE6A6A',
    blue: '#4A90D9',
    green: '#3B8157',
} as const;

const TASK_COLORS_BY_INDEX = [TASK_COLORS.purple, TASK_COLORS.yellow, TASK_COLORS.red, TASK_COLORS.blue, TASK_COLORS.green];
const TASK_WEEKS = [1, 2, 3, 4] as const;
const TASK_ROUTES = [
    '/task1/page1',
    '/task2/page1',
    '/task3/page1',
    '/task4/page1',
    '/task5/page1',
] as const;
export default function DailyTasksScreen() {
    const [weekNumber, setWeekNumber] = useState(1);
    const [selectedDayIndex, setSelectedDayIndex] = useState((new Date().getDay() + 6) % 7);
    const [taskHistory, setTaskHistory] = useState<TaskHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentGoalId, setCurrentGoalId] = useState<number | null>(null);
    const [dailyStatus, setDailyStatus] = useState<DailyTaskStatus | null>(null);
    const [isDailyStatusLoaded, setIsDailyStatusLoaded] = useState(false);
    const [isDailyStatusLoading, setIsDailyStatusLoading] = useState(false);
    const [isDailyStatusVisible, setIsDailyStatusVisible] = useState(false);
    const [isConfirmingDailyTasks, setIsConfirmingDailyTasks] = useState(false);
    const [completingTaskId, setCompletingTaskId] = useState<number | null>(null);
    const [swapTask, setSwapTask] = useState<Task | null>(null);
    const [swapCandidates, setSwapCandidates] = useState<Task[]>([]);
    const [isSwapLoading, setIsSwapLoading] = useState(false);
    const [isSwapping, setIsSwapping] = useState(false);
    const [completedStreak, setCompletedStreak] = useState<CurrentStreak | null>(null);
    const [isStreakVisible, setIsStreakVisible] = useState(false);
    const dates = useMemo(() => buildDateStrip(weekNumber), [weekNumber]);
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const selectedDate = dates[selectedDayIndex]?.dateKey;
    const isTodaySelected = selectedDate === todayKey;
    const isFutureSelected = Boolean(selectedDate && selectedDate > todayKey);

    useEffect(() => {
        let isActive = true;

        const loadTaskHistory = async () => {
            setIsLoading(true);
            try {
                const response = await taskService.getTaskHistory(dates[0].dateKey, dates[dates.length - 1].dateKey);
                if (isActive) setTaskHistory(response.taskHistory ?? []);
            } catch (error) {
                if (isActive) {
                    Alert.alert('Không thể tải lịch sử nhiệm vụ', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
                }
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        void loadTaskHistory();
        return () => {
            isActive = false;
        };
    }, [dates]);

    useEffect(() => {
        let isActive = true;

        const loadDailyStatus = async () => {
            try {
                const goalResponse = await onboardingService.getCurrentGoal();
                const goalId = goalResponse.currentGoal?.goalId ?? null;
                if (!goalId || !isActive) return;

                const statusResponse = await taskService.getDailyTaskStatus(goalId);
                if (isActive) {
                    setCurrentGoalId(goalId);
                    setDailyStatus(statusResponse.dailyTaskStatus);
                    setIsDailyStatusLoaded(true);
                }
            } catch (error) {
                if (isActive) {
                    Alert.alert('Không thể tải trạng thái nhiệm vụ', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
                }
            }
        };

        void loadDailyStatus();
        return () => {
            isActive = false;
        };
    }, []);

    const selectedTasks = isTodaySelected
        ? dailyStatus?.todayTasks ?? []
        : isFutureSelected
            ? []
            : taskHistory.find((entry) => entry.taskDate === selectedDate)?.tasks ?? [];

    const openMoodSelection = () => {
        if (!currentGoalId) {
            Alert.alert('Không thể thực thi', 'Không tìm thấy mục tiêu hiện tại của bạn.');
            return;
        }

        setIsDailyStatusVisible(false);
        router.push({ pathname: '/mood', params: { goalId: String(currentGoalId) } } as any);
    };

    const handleExecuteToday = async () => {
        if (!currentGoalId) {
            Alert.alert('Không thể thực thi', 'Không tìm thấy mục tiêu hiện tại của bạn.');
            return;
        }

        setIsDailyStatusLoading(true);
        try {
            const response = await taskService.getDailyTaskStatus(currentGoalId);
            const status = response.dailyTaskStatus;
            if (!status) throw new Error(response.message || 'Không nhận được trạng thái nhiệm vụ trong ngày.');

            setDailyStatus(status);
            if (status.hasConfirmedToday) return;
            if (status.hasYesterdayTasks) {
                setIsDailyStatusVisible(true);
            } else {
                openMoodSelection();
            }
        } catch (error) {
            Alert.alert('Không thể tải nhiệm vụ', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
        } finally {
            setIsDailyStatusLoading(false);
        }
    };

    const handleKeepYesterdayTasks = async () => {
        if (!currentGoalId || !dailyStatus?.yesterdayTasks.length) return;

        setIsConfirmingDailyTasks(true);
        try {
            await taskService.confirmDailyTasks({
                goalId: currentGoalId,
                selectedTaskIds: dailyStatus.yesterdayTasks.map((task) => task.id),
            });
            const response = await taskService.getDailyTaskStatus(currentGoalId);
            setDailyStatus(response.dailyTaskStatus);
            setIsDailyStatusVisible(false);
        } catch (error) {
            Alert.alert('Không thể giữ nhiệm vụ', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
        } finally {
            setIsConfirmingDailyTasks(false);
        }
    };

    const handleCompleteTask = async (task: Task) => {
        if (task.isCompleted) return;

        setCompletingTaskId(task.id);
        try {
            await taskService.completeTask(task.id);
            const updatedTasks = (dailyStatus?.todayTasks ?? []).map((item) =>
                item.id === task.id ? { ...item, isCompleted: true } : item,
            );
            setDailyStatus((current) => current ? { ...current, todayTasks: updatedTasks } : current);

            if (updatedTasks.length === 5 && updatedTasks.every((item) => item.isCompleted)) {
                const streakResponse = await onboardingService.getCurrentStreak();
                setCompletedStreak(streakResponse.streak);
                setIsStreakVisible(true);
            }
        } catch (error) {
            Alert.alert('Không thể hoàn thành nhiệm vụ', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
        } finally {
            setCompletingTaskId(null);
        }
    };

    const openSwap = async (task: Task) => {
        if (!currentGoalId) return;

        setSwapTask(task);
        setIsSwapLoading(true);
        try {
            const responses = await Promise.all(
                TASK_WEEKS.map((week) => taskService.getTasksByWeek(week)),
            );
            const allTasks = Array.from(
                new Map(responses.flatMap((response) => response.tasks).map((item) => [item.id, item])).values(),
            );
            const selectedIds = new Set(selectedTasks.map((item) => item.id));
            setSwapCandidates(allTasks.filter((item) =>
                !selectedIds.has(item.id) &&
                (!task.moodType || !item.moodType || item.moodType === task.moodType),
            ));
        } catch (error) {
            setSwapTask(null);
            Alert.alert('Không thể tải task thay thế', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
        } finally {
            setIsSwapLoading(false);
        }
    };

    const handleSwapTask = async (newTask: Task) => {
        if (!currentGoalId || !swapTask) return;

        setIsSwapping(true);
        try {
            const response = await taskService.swapDailyTask({
                goalId: currentGoalId,
                oldTaskId: swapTask.id,
                newTaskId: newTask.id,
            });
            const updatedTasks = response.tasks;
            if (updatedTasks?.length) {
                setDailyStatus((current) => current ? { ...current, todayTasks: updatedTasks } : current);
            } else {
                const statusResponse = await taskService.getDailyTaskStatus(currentGoalId);
                setDailyStatus(statusResponse.dailyTaskStatus);
            }
            setSwapTask(null);
        } catch (error) {
            Alert.alert('Không thể đổi nhiệm vụ', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
        } finally {
            setIsSwapping(false);
        }
    };

    const changeWeek = (nextWeek: number) => {
        if (nextWeek < 1) return;
        setWeekNumber(nextWeek);
        setSelectedDayIndex(0);
    };

    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <View style={styles.header}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Quay lại"
                        hitSlop={8}
                        onPress={() => router.replace('/(tabs)')}
                        style={styles.backButton}>
                        <Ionicons color={Design.colors.black} name="chevron-back" size={24} />
                    </Pressable>

                    <SectionTabs active="tasks" />
                </View>

                <View style={styles.titleRow}>
                    <Text style={styles.title}>Nhiệm vụ{'\n'}hàng ngày</Text>
                    <View style={styles.weekControl}>
                        <Pressable accessibilityRole="button" accessibilityLabel="Tuần trước" onPress={() => changeWeek(weekNumber - 1)}>
                            <Ionicons color={Design.colors.black} name="chevron-back" size={18} />
                        </Pressable>
                        <Text style={styles.weekLabel}>Tuần {weekNumber}</Text>
                        <Pressable accessibilityRole="button" accessibilityLabel="Tuần sau" onPress={() => changeWeek(weekNumber + 1)}>
                            <Ionicons color={Design.colors.black} name="chevron-forward" size={18} />
                        </Pressable>
                    </View>
                </View>

                <View style={styles.dateStrip}>
                    {dates.map((item, index) => (
                        <Pressable
                            key={item.dateKey}
                            disabled={item.dateKey > todayKey}
                            onPress={() => setSelectedDayIndex(index)}
                            style={[styles.dateCell, index === selectedDayIndex && styles.dateCellToday, item.dateKey > todayKey && styles.dateCellDisabled]}>
                            <Text style={[styles.weekdayText, index === selectedDayIndex && styles.dateTextToday]}>{item.weekday}</Text>
                            <Text style={[styles.dateText, index === selectedDayIndex && styles.dateTextToday]}>{item.day}</Text>
                            <View style={[styles.dateDot, index === selectedDayIndex && styles.dateDotToday]} />
                        </Pressable>
                    ))}
                </View>

                {/* Sửa lại khối Nhật ký theo yêu cầu */}
                <Pressable
                    accessibilityRole="button"
                    onPress={() => Alert.alert('Nhật ký', 'Tính năng nhật ký sẽ được cập nhật sau.')}
                    style={styles.diaryCard}>
                    <Text style={styles.diaryTitle}>NHẬT KÝ HÔM NAY</Text>
                    <View style={styles.diaryButtonLarge}>
                        <Text style={styles.diaryButtonTextLarge}>Xem</Text>
                    </View>
                </Pressable>

                {isLoading ? <ActivityIndicator color={Design.colors.primaryGreen} size="large" style={styles.loading} /> : null}

                {isFutureSelected ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Chưa thể xem nhiệm vụ của ngày này.</Text>
                    </View>
                ) : null}

                {!isLoading && isDailyStatusLoaded && isTodaySelected && !dailyStatus?.hasConfirmedToday ? (
                    <View style={styles.executeCard}>
                        <Ionicons color={Design.colors.primaryGreen} name="sparkles-outline" size={30} />
                        <Text style={styles.executeTitle}>Nhiệm vụ hôm nay chưa được chọn</Text>
                        <Text style={styles.executeDescription}>Hãy thực thi để chọn 5 nhiệm vụ cho hôm nay.</Text>
                        <Pressable disabled={isDailyStatusLoading} onPress={handleExecuteToday} style={styles.executeAction}>
                            {isDailyStatusLoading ? <ActivityIndicator color={Design.colors.white} /> : <Text style={styles.executeActionText}>Thực thi</Text>}
                        </Pressable>
                    </View>
                ) : null}

                {!isLoading && !isFutureSelected && (!isTodaySelected || dailyStatus?.hasConfirmedToday) && selectedTasks.map((task, index) => {
                    const taskCard = (
                        <View style={[styles.taskCard, { backgroundColor: TASK_COLORS_BY_INDEX[index] }, !isTodaySelected && styles.pastTaskCard]}>
                            <View style={styles.taskHeader}>
                                <Text style={styles.taskTitle}>
                                    {`Nhiệm vụ ${String(index + 1).padStart(2, '0')}`}
                                </Text>
                                <Ionicons color={Design.colors.white} name={task.isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'} size={22} />
                            </View>
                            <Text style={styles.taskDescription}>{task.content}</Text>
                            <Text style={styles.taskStatus}>{task.isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</Text>
                            {isTodaySelected ? (
                                <View style={styles.taskActions}>
                                    <Pressable
                                        accessibilityRole="button"
                                        disabled={task.isCompleted || completingTaskId === task.id}
                                        onPress={() => handleCompleteTask(task)}
                                        style={[styles.taskAction, task.isCompleted && styles.taskActionCompleted]}>
                                        {completingTaskId === task.id ? <ActivityIndicator color={Design.colors.primaryGreen} /> : <Ionicons color={Design.colors.primaryGreen} name="checkmark" size={18} />}
                                        <Text style={styles.taskActionText}>{task.isCompleted ? 'Đã xong' : 'Hoàn thành'}</Text>
                                    </Pressable>
                                    {!task.isCompleted ? (
                                        <Pressable accessibilityRole="button" onPress={() => openSwap(task)} style={styles.taskAction}>
                                            <Ionicons color={Design.colors.primaryGreen} name="swap-horizontal" size={18} />
                                            <Text style={styles.taskActionText}>Đổi task</Text>
                                        </Pressable>
                                    ) : null}
                                </View>
                            ) : null}
                        </View>
                    );

                    if (!isTodaySelected) {
                        return <View key={`${task.id}-${index}`}>{taskCard}</View>;
                    }

                    return (
                        <Pressable
                            key={`${task.id}-${index}`}
                            accessibilityRole="button"
                            onPress={() => router.push({
                                pathname: TASK_ROUTES[index],
                                params: { taskId: String(task.id), week: String(weekNumber) },
                            })}>
                            {taskCard}
                        </Pressable>
                    );
                })}
            </ScrollView>

            <Modal animationType="slide" onRequestClose={() => setIsDailyStatusVisible(false)} transparent visible={isDailyStatusVisible}>
                <View style={styles.modalOverlay}>
                    <View style={styles.dailyStatusModal}>
                        <Text style={styles.modalTitle}>Nhiệm vụ hôm qua</Text>
                        <Text style={styles.modalSubtitle}>Bạn có muốn tiếp tục 5 nhiệm vụ đã hoàn thành hôm qua không?</Text>
                        <ScrollView style={styles.yesterdayTaskList} showsVerticalScrollIndicator={false}>
                            {dailyStatus?.yesterdayTasks.map((task, index) => (
                                <View key={task.id} style={styles.yesterdayTaskItem}>
                                    <Ionicons color={Design.colors.primaryGreen} name="checkmark-circle" size={20} />
                                    <View style={styles.yesterdayTaskText}>
                                        <Text style={styles.yesterdayTaskTitle}>{`Nhiệm vụ ${String(index + 1).padStart(2, '0')}`}</Text>
                                        <Text style={styles.yesterdayTaskContent}>{task.content}</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={styles.modalActions}>
                            <Pressable onPress={openMoodSelection} style={styles.secondaryAction}>
                                <Text style={styles.secondaryActionText}>Thay đổi task mới</Text>
                            </Pressable>
                            <Pressable disabled={isConfirmingDailyTasks} onPress={handleKeepYesterdayTasks} style={styles.primaryAction}>
                                {isConfirmingDailyTasks ? <ActivityIndicator color={Design.colors.white} /> : <Text style={styles.primaryActionText}>Giữ lại task cũ hôm qua</Text>}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal animationType="slide" onRequestClose={() => setSwapTask(null)} transparent visible={swapTask !== null}>
                <View style={styles.modalOverlay}>
                    <View style={styles.swapModal}>
                        <Text style={styles.modalTitle}>Đổi nhiệm vụ</Text>
                        <Text style={styles.modalSubtitle}>Chọn một nhiệm vụ mới thay cho nhiệm vụ hiện tại.</Text>
                        {isSwapLoading ? <ActivityIndicator color={Design.colors.primaryGreen} size="large" style={styles.loading} /> : (
                            <ScrollView style={styles.swapList} showsVerticalScrollIndicator={false}>
                                {swapCandidates.map((candidate) => (
                                    <Pressable key={candidate.id} disabled={isSwapping} onPress={() => handleSwapTask(candidate)} style={styles.swapCandidate}>
                                        <Text style={styles.swapCandidateText}>{candidate.content}</Text>
                                        <Ionicons color={Design.colors.primaryGreen} name="arrow-forward-circle-outline" size={22} />
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}
                        <Pressable onPress={() => setSwapTask(null)} style={styles.secondaryAction}>
                            <Text style={styles.secondaryActionText}>Hủy</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal animationType="fade" onRequestClose={() => setIsStreakVisible(false)} transparent visible={isStreakVisible}>
                <View style={styles.streakModalOverlay}>
                    <View style={styles.streakModal}>
                        <View style={styles.streakCelebrationIcon}>
                            <Ionicons color="#F26A3D" name="flame" size={42} />
                        </View>
                        <Text style={styles.streakModalTitle}>Chúc mừng bạn!</Text>
                        <Text style={styles.streakModalSubtitle}>Bạn đã hoàn thành đủ 5 nhiệm vụ hôm nay.</Text>
                        <View style={styles.streakStats}>
                            <View style={styles.streakStat}>
                                <Text style={styles.streakStatValue}>{completedStreak?.currentStreak ?? 0}</Text>
                                <Text style={styles.streakStatLabel}>Chuỗi hiện tại</Text>
                            </View>
                            <View style={styles.streakStatDivider} />
                            <View style={styles.streakStat}>
                                <Text style={styles.streakStatValue}>{completedStreak?.longestStreak ?? 0}</Text>
                                <Text style={styles.streakStatLabel}>Kỷ lục</Text>
                            </View>
                        </View>
                        <Pressable onPress={() => setIsStreakVisible(false)} style={styles.primaryAction}>
                            <Text style={styles.primaryActionText}>Tiếp tục</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        marginBottom: 8,
    },
    backButton: {
        marginBottom: 10,
        alignSelf: 'flex-start', // Đảm bảo nút nằm góc trái
    },
    safeArea: {
        flex: 1,
        backgroundColor: Design.colors.white,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 32,
    },
    title: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.h2 + 2,
        color: Design.colors.black,
        lineHeight: 34,
        marginBottom: 16,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    weekControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        marginBottom: 12,
    },
    weekLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
        color: Design.colors.black,
    },
    dateStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E9E9E9',
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 16,
    },
    dateCell: {
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 4,
        borderRadius: 10,
    },
    dateCellToday: {
        backgroundColor: '#FBEFD8',
    },
    dateCellDisabled: {
        opacity: 0.35,
    },
    dateText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.mutedText,
        marginBottom: 3,
    },
    weekdayText: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption - 1,
        color: Design.colors.mutedText,
        marginBottom: 2,
        textTransform: 'capitalize',
    },
    dateTextToday: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
    },
    dateDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'transparent',
    },
    dateDotToday: {
        backgroundColor: '#F2B544',
    },
    diaryCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Design.colors.primaryGreen,
        borderRadius: 14,
        paddingHorizontal: 20,
        paddingVertical: 24,
        marginBottom: 16,
    },
    diaryButtonLarge: {
        backgroundColor: Design.colors.white,
        borderRadius: 20, // Bo tròn dạng pill
        paddingHorizontal: 32,
        paddingVertical: 8,
    },
    diaryButtonTextLarge: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
        color: Design.colors.primaryGreen,
    },
    diaryTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.white,
    },
    diaryButton: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: 12,
        paddingHorizontal: 18,
        paddingVertical: 6,
    },
    diaryButtonText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption + 1,
        color: Design.colors.white,
    },
    diaryEmoji: {
        fontSize: 30,
    },
    taskCard: {
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        marginBottom: 14,
    },
    pastTaskCard: {
        opacity: 0.88,
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
        borderRadius: 16,
        backgroundColor: '#F1F8F3',
        paddingHorizontal: 20,
        paddingVertical: 24,
        marginBottom: 16,
    },
    executeTitle: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
        marginTop: 10,
        textAlign: 'center',
    },
    executeDescription: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
        marginTop: 4,
        textAlign: 'center',
    },
    executeAction: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 120,
        minHeight: 44,
        borderRadius: 22,
        backgroundColor: Design.colors.primaryGreen,
        marginTop: 16,
        paddingHorizontal: 20,
    },
    executeActionText: {
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    dailyStatusModal: {
        maxHeight: '88%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        backgroundColor: Design.colors.white,
    },
    modalTitle: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.title,
        marginBottom: 6,
    },
    modalSubtitle: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
        marginBottom: 16,
    },
    yesterdayTaskList: {
        marginBottom: 16,
    },
    yesterdayTaskItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderBottomWidth: 1,
        borderBottomColor: '#E9E9E9',
        paddingVertical: 12,
    },
    yesterdayTaskText: {
        flex: 1,
        marginLeft: 10,
    },
    yesterdayTaskTitle: {
        color: Design.colors.primaryGreen,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body + 1,
        lineHeight: 23,
    },
    yesterdayTaskContent: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
        marginTop: 4,
    },
    modalActions: {
        gap: 10,
    },
    primaryAction: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        borderRadius: 24,
        backgroundColor: Design.colors.primaryGreen,
        paddingHorizontal: 16,
    },
    primaryActionText: {
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 1,
    },
    secondaryAction: {
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: Design.colors.primaryGreen,
        paddingHorizontal: 16,
    },
    secondaryActionText: {
        color: Design.colors.primaryGreen,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 1,
    },
    taskHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    taskTitle: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body - 2,
        color: Design.colors.white,
    },
    taskDescription: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
        color: Design.colors.white,
        opacity: 0.95,
        lineHeight: 17,
        marginBottom: 10,
    },
    taskStatus: {
        alignSelf: 'flex-start',
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.22)',
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    taskActions: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    taskAction: {
        flex: 1,
        minHeight: 38,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        borderRadius: 19,
        backgroundColor: Design.colors.white,
        paddingHorizontal: 8,
    },
    taskActionCompleted: {
        opacity: 0.7,
    },
    taskActionText: {
        color: Design.colors.primaryGreen,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 1,
    },
    swapModal: {
        maxHeight: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        backgroundColor: Design.colors.white,
    },
    swapList: {
        marginBottom: 16,
    },
    swapCandidate: {
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 12,
        backgroundColor: '#F1F8F3',
        marginBottom: 8,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    swapCandidateText: {
        flex: 1,
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.body,
        marginRight: 10,
    },
    streakModal: {
        alignItems: 'center',
        width: '88%',
        maxWidth: 380,
        borderRadius: 24,
        padding: 24,
        backgroundColor: Design.colors.white,
    },
    streakModalOverlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    streakCelebrationIcon: {
        width: 76,
        height: 76,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 38,
        backgroundColor: '#FFE1D5',
        marginBottom: 14,
    },
    streakModalTitle: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.h2,
        textAlign: 'center',
    },
    streakModalSubtitle: {
        color: Design.colors.mutedText,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.body,
        lineHeight: 22,
        marginTop: 6,
        textAlign: 'center',
    },
    streakStats: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        borderRadius: 16,
        backgroundColor: '#FFF7F3',
        marginVertical: 20,
        paddingVertical: 14,
    },
    streakStat: {
        alignItems: 'center',
        flex: 1,
    },
    streakStatValue: {
        color: '#D9552D',
        fontFamily: FontFamily.poppinsSemiBold,
        fontSize: 28,
    },
    streakStatLabel: {
        color: '#9B6A5B',
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption + 1,
        marginTop: 2,
    },
    streakStatDivider: {
        width: 1,
        height: 36,
        backgroundColor: '#F0CFC4',
    },
    taskDetailButton: {
        alignSelf: 'flex-end',
        backgroundColor: Design.colors.white,
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 5,
    },
    taskDetailText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption,
        color: Design.colors.black,
    },
});
