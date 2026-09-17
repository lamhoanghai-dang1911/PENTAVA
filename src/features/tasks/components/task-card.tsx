import { Design, FontFamily } from '@/src/constants/design';
import { TASK_COLORS_BY_INDEX } from '@/src/features/tasks/constants';
import type { TaskCardProps } from '@/src/features/tasks/types/task-card';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
//sửa card đẹp lại.
export function TaskCard({
    task,
    index,
    isTodaySelected,
    weekNumber,
    completingTaskId,
    onOpenTask,
    onStartCheckIn,
    onSwap,
}: TaskCardProps) {
    return (
        <View style={[styles.card, { backgroundColor: TASK_COLORS_BY_INDEX[index] }, !isTodaySelected && styles.pastCard]}>
            <Pressable
                accessibilityRole={isTodaySelected ? 'button' : undefined}
                disabled={!isTodaySelected}
                onPress={() => onOpenTask(task.id, weekNumber, index)}
                style={styles.details}>
                <View style={styles.header}>
                    <Text style={styles.title}>{`Nhiệm vụ ${String(index + 1).padStart(2, '0')}`}</Text>
                    <Ionicons color={Design.colors.white} name={task.isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'} size={22} />
                </View>
                <Text style={styles.description}>{task.content}</Text>
                <Text style={styles.status}>{task.isCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</Text>
            </Pressable>

            {isTodaySelected ? (
                <View style={styles.actions}>
                    <Pressable
                        accessibilityRole="button"
                        disabled={task.isCompleted || completingTaskId === task.id}
                        onPress={() => onStartCheckIn(task)}
                        style={[styles.action, task.isCompleted && styles.actionCompleted]}>
                        {completingTaskId === task.id ? <ActivityIndicator color={Design.colors.primaryGreen} /> : <Ionicons color={Design.colors.primaryGreen} name="checkmark" size={18} />}
                        <Text style={styles.actionText}>{task.isCompleted ? 'Đã xong' : 'Hoàn thành'}</Text>
                    </Pressable>
                    {!task.isCompleted ? (
                        <Pressable accessibilityRole="button" onPress={() => onSwap(task)} style={styles.action}>
                            <Ionicons color={Design.colors.primaryGreen} name="swap-horizontal" size={18} />
                            <Text style={styles.actionText}>Đổi task</Text>
                        </Pressable>
                    ) : null}
                </View>
            ) : null}
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
    pastCard: { opacity: 0.88 },
    details: { alignSelf: 'stretch', padding: 0 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
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
        alignSelf: 'flex-start',
        borderRadius: 10,
        backgroundColor: 'rgba(255,255,255,0.22)',
        color: Design.colors.white,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    actions: { flexDirection: 'row', gap: 8, marginTop: 12 },
    action: {
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
    actionCompleted: { opacity: 0.7 },
    actionText: {
        color: Design.colors.primaryGreen,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 1,
    },
});
