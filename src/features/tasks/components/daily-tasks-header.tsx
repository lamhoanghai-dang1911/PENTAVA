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
                    hitSlop={10}
                    onPress={() => router.replace('/(tabs)')}
                    style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}>
                    <Ionicons color="#1E293B" name="chevron-back" size={24} />
                </Pressable>
                <SectionTabs active="tasks" />
            </View>

            <View style={styles.titleRow}>
                <View style={styles.titleWrap}>
                    <Text style={styles.title}>Nhiệm vụ{'\n'}hàng ngày</Text>
                </View>
                <View style={styles.weekControl}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tuần trước"
                        onPress={() => onChangeWeek(weekNumber - 1)}
                        style={({ pressed }) => [styles.weekArrow, pressed && { transform: [{ scale: 0.85 }] }]}>
                        <Ionicons color="#065F46" name="chevron-back" size={16} />
                    </Pressable>
                    <Text style={styles.weekLabel}>Tuần {weekNumber}</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Tuần sau"
                        onPress={() => onChangeWeek(weekNumber + 1)}
                        style={({ pressed }) => [styles.weekArrow, pressed && { transform: [{ scale: 0.85 }] }]}>
                        <Ionicons color="#065F46" name="chevron-forward" size={16} />
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
                                pressed && !isFuture && { transform: [{ scale: 0.94 }] },
                            ]}>
                            <Text style={[styles.weekdayText, isSelected && styles.dateTextSelected]}>{item.weekday}</Text>
                            <Text style={[styles.dateText, isSelected && styles.dateTextSelected]}>{item.day}</Text>
                            {isSelected ? (
                                <Animated.View entering={ZoomIn.springify().damping(12)} style={[styles.dateDot, styles.dateDotSelected]} />
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
    header: {
        marginBottom: 6,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    titleWrap: {
        flex: 1,
    },
    title: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 26,
        color: '#0F291E',
        lineHeight: 32,
    },
    weekControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        borderColor: '#A7F3D0',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 5,
        gap: 6,
    },
    weekArrow: {
        padding: 2,
    },
    weekLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: 13,
        color: '#065F46',
    },
    dateStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: '#E2EFE6',
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 8,
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
    },
    dateCell: {
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 7,
        borderRadius: 14,
        minWidth: 38,
    },
    dateCellToday: {
        backgroundColor: '#10B981',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
    },
    dateCellDisabled: {
        opacity: 0.35,
    },
    dateText: {
        fontFamily: FontFamily.poppinsSemiBold,
        fontSize: 15,
        color: '#0F291E',
        marginBottom: 2,
    },
    weekdayText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: 10.5,
        color: '#64748B',
        marginBottom: 3,
        textTransform: 'capitalize',
    },
    dateTextSelected: {
        color: '#FFFFFF',
    },
    dateDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'transparent',
    },
    dateDotSelected: {
        backgroundColor: '#FEF08A',
    },
});
