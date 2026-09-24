import { SectionTabs } from '@/src/components/home/section-tabs';
import { Design, FontFamily } from '@/src/constants/design';
import type { DailyTasksHeaderProps } from '@/src/features/tasks/types/daily-tasks-header';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

export function DailyTasksHeader({ dates, todayKey, selectedDayIndex, weekNumber, onSelectDay, onChangeWeek }: DailyTasksHeaderProps) {
    return (
        <>
            <View style={styles.header}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Quay lại"
                    hitSlop={8}
                    onPress={() => router.replace('/(tabs)')}
                    style={({ pressed }) => [styles.backButton, pressed && { transform: [{ scale: 0.9 }] }]}>
                    <Ionicons color={Design.colors.black} name="chevron-back" size={34} />
                </Pressable>
                <SectionTabs active="tasks" />
            </View>

            <View style={styles.titleRow}>
                <Text style={styles.title}>Nhiệm vụ{'\n'}hàng ngày</Text>
                <View style={styles.weekControl}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tuần trước"
                        onPress={() => onChangeWeek(weekNumber - 1)}
                        style={({ pressed }) => [pressed && { transform: [{ scale: 0.85 }] }]}>
                        <Ionicons color={Design.colors.black} name="chevron-back" size={18} />
                    </Pressable>
                    <Text style={styles.weekLabel}>Tuần {weekNumber}</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tuần sau"
                        onPress={() => onChangeWeek(weekNumber + 1)}
                        style={({ pressed }) => [pressed && { transform: [{ scale: 0.85 }] }]}>
                        <Ionicons color={Design.colors.black} name="chevron-forward" size={18} />
                    </Pressable>
                </View>
            </View>

            <View style={styles.dateStrip}>
                {dates.map((item, index) => {
                    const isSelected = index === selectedDayIndex;
                    const isFuture = item.dateKey > todayKey;
                    return (
                        <Pressable
                            key={item.dateKey}
                            disabled={isFuture}
                            onPress={() => onSelectDay(index)}
                            style={({ pressed }) => [
                                styles.dateCell,
                                isSelected && styles.dateCellToday,
                                isFuture && styles.dateCellDisabled,
                                pressed && !isFuture && { transform: [{ scale: 0.92 }] },
                            ]}>
                            <Text style={[styles.weekdayText, isSelected && styles.dateTextToday]}>{item.weekday}</Text>
                            <Text style={[styles.dateText, isSelected && styles.dateTextToday]}>{item.day}</Text>
                            {isSelected ? (
                                <Animated.View entering={ZoomIn.springify().damping(12)} style={[styles.dateDot, styles.dateDotToday]} />
                            ) : (
                                <View style={styles.dateDot} />
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    header: { marginBottom: 8 },
    backButton: { marginBottom: 10, alignSelf: 'flex-start' },
    titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.h2 + 2, color: Design.colors.black, lineHeight: 34, marginBottom: 16 },
    weekControl: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 12 },
    weekLabel: { fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.body, color: Design.colors.black },
    dateStrip: { flexDirection: 'row', justifyContent: 'space-between', borderWidth: 1, borderColor: '#E9E9E9', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 16 },
    dateCell: { alignItems: 'center', paddingHorizontal: 6, paddingVertical: 4, borderRadius: 10 },
    dateCellToday: { backgroundColor: '#FBEFD8' },
    dateCellDisabled: { opacity: 0.35 },
    dateText: { fontFamily: FontFamily.beVietnamMedium, fontSize: Design.fontSize.caption + 2, color: Design.colors.mutedText, marginBottom: 3 },
    weekdayText: { fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption - 1, color: Design.colors.mutedText, marginBottom: 2, textTransform: 'capitalize' },
    dateTextToday: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold },
    dateDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
    dateDotToday: { backgroundColor: '#F2B544' },
});
