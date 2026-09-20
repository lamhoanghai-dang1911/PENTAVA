import { Design, FontFamily } from '@/src/constants/design';
import type { DailyTaskModalsProps } from '@/src/features/tasks/types/daily-task-modals';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export function DailyTaskModals({
    dailyStatusVisible,
    yesterdayTasks,
    isConfirmingDailyTasks,
    swapTask,
    swapCandidates,
    isSwapLoading,
    isSwapping,
    swapSuccessVisible,
    streakVisible,
    completedStreak,
    onCloseDailyStatus,
    onOpenMoodSelection,
    onKeepYesterdayTasks,
    onCloseSwap,
    onCloseSwapSuccess,
    onCancelStreak,
    onConfirmSwap,
}: DailyTaskModalsProps) {

    useEffect(() => { if (dailyStatusVisible && yesterdayTasks.length === 0) { onOpenMoodSelection(); } }, [dailyStatusVisible, yesterdayTasks.length, onOpenMoodSelection]);

    return (
        <>
            <Modal animationType="slide" onRequestClose={onCloseDailyStatus} transparent visible={dailyStatusVisible && yesterdayTasks.length > 0} > <View style={styles.overlay}> <View style={styles.dailyStatusModal}> <Text style={styles.modalTitle}> Nhiệm vụ hôm qua </Text> <Text style={styles.modalSubtitle}> Bạn có muốn tiếp tục 5 nhiệm vụ đã hoàn thành hôm qua không? </Text> <ScrollView style={styles.yesterdayList} showsVerticalScrollIndicator={false} > {yesterdayTasks.map((task, index) => (<View key={task.id} style={styles.yesterdayItem}> <Ionicons color={Design.colors.primaryGreen} name="checkmark-circle" size={20} /> <View style={styles.yesterdayText}> <Text style={styles.yesterdayTitle}> {`Nhiệm vụ ${String(index + 1).padStart(2, '0')}`} </Text> <Text style={styles.yesterdayContent}> {task.content} </Text> </View> </View>))} </ScrollView> <View style={styles.modalActions}> <Pressable disabled={isConfirmingDailyTasks} onPress={onKeepYesterdayTasks} style={styles.primaryAction} > {isConfirmingDailyTasks ? (<ActivityIndicator color={Design.colors.white} />) : (<Text style={styles.primaryActionText}> Giữ lại task cũ hôm qua </Text>)} </Pressable> <Pressable onPress={onOpenMoodSelection} style={styles.secondaryAction} > <Text style={styles.secondaryActionText}> Thay đổi task mới </Text> </Pressable> </View> </View> </View> </Modal>

            <Modal animationType="slide" onRequestClose={onCloseSwap} transparent visible={swapTask !== null}>
                <View style={styles.overlay}>
                    <View style={styles.swapModal}>
                        <Text style={styles.modalTitle}>Đổi nhiệm vụ</Text>
                        <Text style={styles.modalSubtitle}>Chọn một nhiệm vụ mới thay cho nhiệm vụ hiện tại.</Text>
                        {isSwapLoading ? <ActivityIndicator color={Design.colors.primaryGreen} size="large" style={styles.loading} /> : (
                            <ScrollView style={styles.swapList} showsVerticalScrollIndicator={false}>
                                {swapCandidates.map((candidate) => (
                                    <Pressable key={candidate.id} disabled={isSwapping} onPress={() => onConfirmSwap(candidate)} style={styles.swapCandidate}>
                                        <Text style={styles.swapCandidateText}>{candidate.content}</Text>
                                        <Ionicons color={Design.colors.primaryGreen} name="arrow-forward-circle-outline" size={22} />
                                    </Pressable>
                                ))}
                            </ScrollView>
                        )}
                        <Pressable onPress={onCloseSwap} style={styles.secondaryAction}>
                            <Text style={styles.secondaryActionText}>Hủy</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal animationType="fade" onRequestClose={onCloseSwapSuccess} transparent visible={swapSuccessVisible}>
                <View style={styles.streakOverlay}>
                    <View style={styles.successModal}>
                        <View style={styles.successIcon}>
                            <Ionicons color={Design.colors.white} name="checkmark" size={34} />
                        </View>
                        <Text style={styles.successTitle}>Đổi task thành công</Text>
                        <Pressable onPress={onCloseSwapSuccess} style={styles.primaryAction}>
                            <Text style={styles.primaryActionText}>Tiếp tục</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal animationType="fade" onRequestClose={onCancelStreak} transparent visible={streakVisible}>
                <View style={styles.streakOverlay}>
                    <View style={styles.streakModal}>
                        <View style={styles.streakIcon}>
                            <Ionicons color="#F26A3D" name="flame" size={42} />
                        </View>
                        <Text style={styles.streakTitle}>Chúc mừng bạn!</Text>
                        <Text style={styles.streakSubtitle}>Bạn đã hoàn thành đủ 5 nhiệm vụ hôm nay.</Text>
                        <View style={styles.streakStats}>
                            <View style={styles.streakStat}>
                                <Text style={styles.streakValue}>{completedStreak?.currentStreak ?? 0}</Text>
                                <Text style={styles.streakLabel}>Chuỗi hiện tại</Text>
                            </View>
                            <View style={styles.streakDivider} />
                            <View style={styles.streakStat}>
                                <Text style={styles.streakValue}>{completedStreak?.longestStreak ?? 0}</Text>
                                <Text style={styles.streakLabel}>Kỷ lục</Text>
                            </View>
                        </View>
                        <Pressable onPress={onCancelStreak} style={styles.primaryAction}>
                            <Text style={styles.primaryActionText}>Tiếp tục</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.45)' },
    dailyStatusModal: {
        maxHeight: '88%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        backgroundColor: Design.colors.white,
    },
    swapModal: {
        maxHeight: '80%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        backgroundColor: Design.colors.white,
    },
    successModal: {
        alignItems: 'center',
        width: '88%',
        maxWidth: 380,
        borderRadius: 24,
        padding: 24,
        backgroundColor: Design.colors.white,
    },
    successIcon: {
        width: 68,
        height: 68,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 34,
        backgroundColor: Design.colors.primaryGreen,
        marginBottom: 14,
    },
    successTitle: {
        color: Design.colors.black,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.title,
        marginBottom: 20,
        textAlign: 'center',
    },
    modalTitle: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.title, marginBottom: 6 },
    modalSubtitle: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 1, marginBottom: 16 },
    yesterdayList: { marginBottom: 16 },
    yesterdayItem: { flexDirection: 'row', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#E9E9E9', paddingVertical: 12 },
    yesterdayText: { flex: 1, marginLeft: 10 },
    yesterdayTitle: { color: Design.colors.primaryGreen, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.body + 1, lineHeight: 23 },
    yesterdayContent: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.caption + 1, marginTop: 4 },
    modalActions: { gap: 10 },
    primaryAction: { alignItems: 'center', justifyContent: 'center', minHeight: 48, borderRadius: 24, backgroundColor: Design.colors.primaryGreen, paddingHorizontal: 16 },
    primaryActionText: { color: Design.colors.white, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption + 1 },
    secondaryAction: { alignItems: 'center', justifyContent: 'center', minHeight: 48, borderRadius: 24, borderWidth: 1, borderColor: Design.colors.primaryGreen, paddingHorizontal: 16 },
    secondaryActionText: { color: Design.colors.primaryGreen, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.caption + 1 },
    loading: { marginVertical: 24 },
    swapList: { marginBottom: 16 },
    swapCandidate: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, backgroundColor: '#F1F8F3', marginBottom: 8, paddingHorizontal: 14, paddingVertical: 10 },
    swapCandidateText: { flex: 1, color: Design.colors.black, fontFamily: FontFamily.beVietnamMedium, fontSize: Design.fontSize.body, marginRight: 10 },
    streakOverlay: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.45)' },
    streakModal: { alignItems: 'center', width: '88%', maxWidth: 380, borderRadius: 24, padding: 24, backgroundColor: Design.colors.white },
    streakIcon: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: 38, backgroundColor: '#FFE1D5', marginBottom: 14 },
    streakTitle: { color: Design.colors.black, fontFamily: FontFamily.beVietnamSemiBold, fontSize: Design.fontSize.h2, textAlign: 'center' },
    streakSubtitle: { color: Design.colors.mutedText, fontFamily: FontFamily.beVietnamRegular, fontSize: Design.fontSize.body, lineHeight: 22, marginTop: 6, textAlign: 'center' },
    streakStats: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', borderRadius: 16, backgroundColor: '#FFF7F3', marginVertical: 20, paddingVertical: 14 },
    streakStat: { alignItems: 'center', flex: 1 },
    streakValue: { color: '#D9552D', fontFamily: FontFamily.poppinsSemiBold, fontSize: 28 },
    streakLabel: { color: '#9B6A5B', fontFamily: FontFamily.beVietnamMedium, fontSize: Design.fontSize.caption + 1, marginTop: 2 },
    streakDivider: { width: 1, height: 36, backgroundColor: '#F0CFC4' },
});
