import { SectionTabs } from '@/src/components/home/section-tabs';
import { Design, FontFamily } from '@/src/constants/design';
import { buildDateStrip, getTasksForDay } from '@/src/features/tasks/task-utils';
import { taskService } from '@/src/services/taskService';
import type { Task } from '@/src/types/api/task';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
const TASK_CACHE_KEY = (week: number) => `@pentava/tasks/week-${week}`;

export default function DailyTasksScreen() {
    const [weekNumber, setWeekNumber] = useState(1);
    const [selectedDayIndex, setSelectedDayIndex] = useState((new Date().getDay() + 6) % 7);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const dates = useMemo(() => buildDateStrip(weekNumber), [weekNumber]);

    useEffect(() => {
        let isActive = true;

        const loadTasks = async () => {
            setIsLoading(true);
            try {
                const cachedTasks = await AsyncStorage.getItem(TASK_CACHE_KEY(weekNumber));
                if (cachedTasks) {
                    const cachedResponse = JSON.parse(cachedTasks) as { tasks?: Task[] };
                    if (isActive) setTasks(cachedResponse.tasks ?? []);
                    return;
                }

                const response = await taskService.getTasksByWeek(weekNumber);
                await AsyncStorage.setItem(TASK_CACHE_KEY(weekNumber), JSON.stringify(response));
                if (isActive) setTasks(response.tasks);
            } catch (error) {
                if (isActive) {
                    Alert.alert('Không thể tải nhiệm vụ', error instanceof Error ? error.message : 'Đã có lỗi xảy ra.');
                }
            } finally {
                if (isActive) setIsLoading(false);
            }
        };

        void loadTasks();
        return () => {
            isActive = false;
        };
    }, [weekNumber]);

    const selectedTasks = getTasksForDay(tasks, selectedDayIndex);

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
                        <Pressable key={item.dateKey} onPress={() => setSelectedDayIndex(index)} style={[styles.dateCell, index === selectedDayIndex && styles.dateCellToday]}>
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

                {!isLoading && selectedTasks.map((task, index) => (
                    <View key={`${task.id}-${index}`} style={[styles.taskCard, { backgroundColor: TASK_COLORS_BY_INDEX[index] }]}>
                        <View style={styles.taskHeader}>
                            <Text style={styles.taskTitle}>{task.title.toUpperCase()}</Text>
                            <Ionicons color={Design.colors.white} name={task.isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'} size={22} />
                        </View>
                        <Text style={styles.taskDescription}>{task.content}</Text>
                    </View>
                ))}
            </ScrollView>
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
    loading: {
        marginVertical: 24,
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
