import { SectionTabs } from '@/components/home/section-tabs';
import { Design, FontFamily } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Màu thẻ nhiệm vụ theo Figma — nên chuyển vào Design.colors khi ổn định
const TASK_COLORS = {
    purple: '#8B72DE',
    yellow: '#F2B544',
    red: '#EE6A6A',
    blue: '#4A90D9',
    green: '#3B8157',
} as const;

// TODO: nhiệm vụ nên sinh từ lộ trình cá nhân hóa / server
const TASKS = [
    {
        id: '01',
        color: TASK_COLORS.purple,
        description: 'Hôm nay tránh ăn thực phẩm siêu chế biến (đồ ăn nhanh, nước ngọt, bánh kẹo).',
    },
    {
        id: '02',
        color: TASK_COLORS.yellow,
        description: 'Ăn đủ 3 bữa, nhiều rau và quả trong ngày hôm nay.',
    },
    {
        id: '03',
        color: TASK_COLORS.red,
        description: 'Vận động vừa – nặng ít nhất 30 phút hôm nay.',
    },
    {
        id: '04',
        color: TASK_COLORS.blue,
        description: 'Tắt màn hình (điện thoại, máy tính) trước giờ ngủ 30 phút.',
    },
    {
        id: '05',
        color: TASK_COLORS.green,
        description: 'Đi ngủ đúng giờ cố định – cùng một khung giờ mỗi đêm.',
    },
] as const;

const TASK_DETAIL_ROUTES = {
    '01': '/task1/page1',
    '02': '/task2/page1',
    '03': '/task3/page1',
    '04': '/task4/page1',
    '05': '/task5/page1',
} as const;

function buildDateStrip() {
    const today = new Date();
    // 8 ngày: 3 ngày trước → 4 ngày sau, hôm nay được tô đậm
    return Array.from({ length: 8 }).map((_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() - 3 + index);
        return { day: date.getDate(), isToday: index === 3 };
    });
}

export default function DailyTasksScreen() {
    const dates = buildDateStrip();

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

                <Text style={styles.title}>Nhiệm vụ{'\n'}hàng ngày 👏</Text>

                <View style={styles.dateStrip}>
                    {dates.map((item, index) => (
                        <View key={index} style={[styles.dateCell, item.isToday && styles.dateCellToday]}>
                            <Text style={[styles.dateText, item.isToday && styles.dateTextToday]}>
                                {item.day}
                            </Text>
                            <View style={[styles.dateDot, item.isToday && styles.dateDotToday]} />
                        </View>
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

                {TASKS.map((task) => (
                    <View key={task.id} style={[styles.taskCard, { backgroundColor: task.color }]}>
                        <View style={styles.taskHeader}>
                            <Text style={styles.taskTitle}>NHIỆM VỤ {task.id}</Text>
                            <Ionicons color={Design.colors.white} name="checkmark-circle-outline" size={22} />
                        </View>
                        <Text style={styles.taskDescription}>{task.description}</Text>
                        <Pressable
                            accessibilityRole="button"
                            onPress={() => router.push(TASK_DETAIL_ROUTES[task.id])}
                            style={styles.taskDetailButton}>
                            <Text style={styles.taskDetailText}>Xem chi tiết</Text>
                        </Pressable>
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
