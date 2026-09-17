import { Design, FontFamily } from '@/src/constants/design';
import { DailyTaskModals } from '@/src/features/tasks/components/daily-task-modals';
import { DailyTasksHeader } from '@/src/features/tasks/components/daily-tasks-header';
import { TaskCard } from '@/src/features/tasks/components/task-card';
import { useDailyTasks } from '@/src/features/tasks/hooks/use-daily-tasks';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DailyTasksScreen() {
    const dailyTasks = useDailyTasks({
        onOpenMoodSelection: (goalId) => router.push({ pathname: '/mood', params: { goalId: String(goalId) } } as any),
        onOpenTask: (taskId, weekNumber, taskIndex) => router.push({
            pathname: `/task${taskIndex + 1}/page1` as '/task1/page1',
            params: { taskId: String(taskId), week: String(weekNumber) },
        }),
    });

    const startTaskCheckIn = (task: { id: number }, index: number) => {
        const captureRoutes = ['/task1/page4', '/task2/page4', '/task3/page6', '/task4/page4', '/task5/page3'] as const;
        router.push({
            pathname: captureRoutes[index],
            params: { taskId: String(task.id), week: String(dailyTasks.weekNumber) },
        } as any);
    };

    return (
        <SafeAreaView edges={['top']} style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <DailyTasksHeader
                    dates={dailyTasks.dates}
                    onChangeWeek={dailyTasks.changeWeek}
                    onSelectDay={dailyTasks.setSelectedDayIndex}
                    selectedDayIndex={dailyTasks.selectedDayIndex}
                    todayKey={dailyTasks.todayKey}
                    weekNumber={dailyTasks.weekNumber}
                />

                <Pressable
                    accessibilityRole="button"
                    onPress={() => Alert.alert('Nhật ký', 'Tính năng nhật ký sẽ được cập nhật sau.')}
                    style={styles.diaryCard}>
                    <Text style={styles.diaryTitle}>NHẬT KÝ HÔM NAY</Text>
                    <View style={styles.diaryButton}>
                        <Text style={styles.diaryButtonText}>Xem</Text>
                    </View>
                </Pressable>

                {dailyTasks.isLoading ? <ActivityIndicator color={Design.colors.primaryGreen} size="large" style={styles.loading} /> : null}

                {dailyTasks.isFutureSelected ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>Chưa thể xem nhiệm vụ của ngày này.</Text>
                    </View>
                ) : null}

                {!dailyTasks.isLoading && dailyTasks.isDailyStatusLoaded && dailyTasks.isTodaySelected && !dailyTasks.dailyStatus?.hasConfirmedToday ? (
                    <View style={styles.executeCard}>
                        <Ionicons color={Design.colors.primaryGreen} name="sparkles-outline" size={30} />
                        <Text style={styles.executeTitle}>Nhiệm vụ hôm nay chưa được chọn</Text>
                        <Text style={styles.executeDescription}>Hãy thực thi để chọn 5 nhiệm vụ cho hôm nay.</Text>
                        <Pressable disabled={dailyTasks.isDailyStatusLoading} onPress={dailyTasks.handleExecuteToday} style={styles.executeAction}>
                            {dailyTasks.isDailyStatusLoading ? <ActivityIndicator color={Design.colors.white} /> : <Text style={styles.executeActionText}>Thực thi</Text>}
                        </Pressable>
                    </View>
                ) : null}

                {!dailyTasks.isLoading && !dailyTasks.isFutureSelected && (!dailyTasks.isTodaySelected || dailyTasks.dailyStatus?.hasConfirmedToday) ? dailyTasks.selectedTasks.map((task, index) => (
                    <TaskCard
                        key={`${task.id}-${index}`}
                        completingTaskId={dailyTasks.completingTaskId}
                        index={index}
                        isTodaySelected={dailyTasks.isTodaySelected}
                        onStartCheckIn={(task) => startTaskCheckIn(task, index)}
                        onOpenTask={dailyTasks.openTask}
                        onSwap={dailyTasks.openSwap}
                        task={task}
                        weekNumber={dailyTasks.weekNumber}
                    />
                )) : null}
            </ScrollView>

            <DailyTaskModals
                completedStreak={dailyTasks.completedStreak}
                dailyStatusVisible={dailyTasks.isDailyStatusVisible}
                isConfirmingDailyTasks={dailyTasks.isConfirmingDailyTasks}
                streakVisible={dailyTasks.isStreakVisible}
                isSwapLoading={dailyTasks.isSwapLoading}
                isSwapping={dailyTasks.isSwapping}
                onCancelStreak={() => dailyTasks.setIsStreakVisible(false)}
                onCloseDailyStatus={() => dailyTasks.setIsDailyStatusVisible(false)}
                onCloseSwap={() => dailyTasks.setSwapTask(null)}
                onConfirmSwap={dailyTasks.handleSwapTask}
                onKeepYesterdayTasks={dailyTasks.handleKeepYesterdayTasks}
                onOpenMoodSelection={dailyTasks.openMoodSelection}
                swapCandidates={dailyTasks.swapCandidates}
                swapTask={dailyTasks.swapTask}
                yesterdayTasks={dailyTasks.dailyStatus?.yesterdayTasks ?? []}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: Design.colors.white },
    scrollContent: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 32 },
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
    diaryTitle: { fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption + 2, color: Design.colors.white },
    diaryButton: { backgroundColor: Design.colors.white, borderRadius: 20, paddingHorizontal: 32, paddingVertical: 8 },
    diaryButtonText: { fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.body, color: Design.colors.primaryGreen },
    loading: { marginVertical: 24 },
    emptyState: { alignItems: 'center', paddingVertical: 28 },
    emptyStateText: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.body },
    executeCard: { alignItems: 'center', borderRadius: 16, backgroundColor: '#F1F8F3', paddingHorizontal: 20, paddingVertical: 24, marginBottom: 16 },
    executeTitle: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.body, marginTop: 10, textAlign: 'center' },
    executeDescription: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 1, marginTop: 4, textAlign: 'center' },
    executeAction: { alignItems: 'center', justifyContent: 'center', minWidth: 120, minHeight: 44, borderRadius: 22, backgroundColor: Design.colors.primaryGreen, marginTop: 16, paddingHorizontal: 20 },
    executeActionText: { color: Design.colors.white, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.body },
});
