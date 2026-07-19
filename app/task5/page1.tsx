import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const ITEM_HEIGHT = 50; // Chiều cao mỗi dòng số

// 1. Tạo mảng gốc cơ bản
const BASE_HOURS = Array.from({ length: 24 }, (_, i) => i);
const BASE_MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

// 2. Nhân bản mảng lên 100 lần để tạo danh sách siêu dài phục vụ cuộn vô tận
const HOURS_DATA = Array(100).fill(BASE_HOURS).flat();
const MINUTES_DATA = Array(100).fill(BASE_MINUTES).flat();

export default function Page1() {
    const [hour, setHour] = useState(23);
    const [minute, setMinute] = useState(0);
    const [modalVisible, setModalVisible] = useState(false);
    const router = useRouter(); 

    // Khai báo Ref để điều khiển FlatList từ xa
    const hourListRef = useRef<FlatList>(null);
    const minuteListRef = useRef<FlatList>(null);

    const formatTime = (num: number) => (num < 10 ? `0${num}` : num.toString());

    // Xử lý cuộn vô tận cho cột GIỜ
    const handleHourScroll = (event: any) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        const index = Math.round(yOffset / ITEM_HEIGHT);
        const centerIndex = index + 1; // Hàng ở giữa hiển thị thực tế

        const selectedHour = HOURS_DATA[centerIndex];
        setHour(selectedHour);

        // Kỹ thuật Reset ngầm: Nếu cuộn quá gần đầu hoặc cuối dải dữ liệu, tự động đẩy về giữa dải
        const currentRepetition = Math.floor(centerIndex / 24);
        if (currentRepetition < 20 || currentRepetition > 80) {
            const resetCenterIndex = 50 * 24 + selectedHour;
            hourListRef.current?.scrollToIndex({ index: resetCenterIndex - 1, animated: false });
        }
    };

    // Xử lý cuộn vô tận cho cột PHÚT
    const handleMinuteScroll = (event: any) => {
        const yOffset = event.nativeEvent.contentOffset.y;
        const index = Math.round(yOffset / ITEM_HEIGHT);
        const centerIndex = index + 1;

        const selectedMinute = MINUTES_DATA[centerIndex];
        setMinute(selectedMinute);

        // Kỹ thuật Reset ngầm cho phút
        const currentRepetition = Math.floor(centerIndex / 12);
        if (currentRepetition < 20 || currentRepetition > 80) {
            const minuteIndexInBase = BASE_MINUTES.indexOf(selectedMinute);
            const resetCenterIndex = 50 * 12 + minuteIndexInBase;
            minuteListRef.current?.scrollToIndex({ index: resetCenterIndex - 1, animated: false });
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={require('../../assets/images/onboarding/meo_task5_1.png')}
                    style={styles.topImage}
                    resizeMode="cover"
                />
                <TouchableOpacity style={styles.backButton}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.cardContainer}>
                <View style={styles.timeCard}>
                    <Text style={styles.cardTitle}>Tối qua bạn ngủ lúc mấy giờ?</Text>

                    {/* KHU VỰC TRƯỢT CHỌN THỜI GIAN VÔ TẬN */}
                    <View style={styles.pickerContainer}>
                        <View style={styles.activeIndicatorLine} pointerEvents="none" />

                        {/* Cột GIỜ */}
                        <View style={styles.column}>
                            <FlatList
                                ref={hourListRef}
                                data={HOURS_DATA}
                                keyExtractor={(_, index) => `hour-${index}`}
                                showsVerticalScrollIndicator={false}
                                snapToInterval={ITEM_HEIGHT}
                                decelerationRate="fast"
                                // Mặc định nhảy vào giữa danh sách (vị trí hiển thị số 23)
                                initialScrollIndex={50 * 24 + 22}
                                getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                                onMomentumScrollEnd={handleHourScroll}
                                renderItem={({ item }) => (
                                    <View style={styles.itemWrapper}>
                                        <Text style={[styles.itemText, item === hour ? styles.activeText : styles.inactiveText]}>
                                            {formatTime(item)}
                                        </Text>
                                    </View>
                                )}
                            />
                        </View>

                        <Text style={styles.separator}>:</Text>

                        {/* Cột PHÚT */}
                        <View style={styles.column}>
                            <FlatList
                                ref={minuteListRef}
                                data={MINUTES_DATA}
                                keyExtractor={(_, index) => `minute-${index}`}
                                showsVerticalScrollIndicator={false}
                                snapToInterval={ITEM_HEIGHT}
                                decelerationRate="fast"
                                // Mặc định nhảy vào giữa danh sách (vị trí hiển thị số 00)
                                initialScrollIndex={50 * 12 - 1}
                                getItemLayout={(_, index) => ({ length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index })}
                                onMomentumScrollEnd={handleMinuteScroll}
                                renderItem={({ item }) => (
                                    <View style={styles.itemWrapper}>
                                        <Text style={[styles.itemText, item === minute ? styles.activeText : styles.inactiveText]}>
                                            {formatTime(item)}
                                        </Text>
                                    </View>
                                )}
                            />
                        </View>
                    </View>

                    <View style={styles.noteBox}>
                        <Text style={styles.noteIcon}>🌙</Text>
                        <Text style={styles.noteText}>Giữ thói quen ngủ đúng giờ để cơ thể được nghỉ ngơi tốt nhất</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={() => setModalVisible(true)}>
                    <Text style={styles.submitButtonText}>Bắt đầu ngay</Text>
                </TouchableOpacity>
            </View>

            {/* POPUP MODAL */}
            <Modal transparent={true} visible={modalVisible} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>MỤC TIÊU CỦA BẠN</Text>
                        <Text style={styles.modalTime}>{`${formatTime(hour)}:${formatTime(minute)}`}</Text>
                        <View style={styles.modalBadge}>
                            <Text style={styles.modalBadgeText}>🌙 Giấc ngủ ngon</Text>
                        </View>
                        <TouchableOpacity style={styles.closeButton} onPress={() => { setModalVisible(false); router.push('/task5/page2'); }}>
                            <Text style={styles.closeButtonText}>Đóng</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F7F9FA' },
    imageContainer: { width: width, height: height * 0.45 },
    topImage: { width: '100%', height: '100%' },
    backButton: { position: 'absolute', top: 50, left: 20, width: 40, height: 40, justifyContent: 'center' },
    backText: { fontSize: 36, color: '#FFFFFF', fontWeight: '300' },

    cardContainer: { flex: 1, paddingHorizontal: 20, marginTop: -30, alignItems: 'center' },
    timeCard: {
        width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24,
        alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 20 },

    pickerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: ITEM_HEIGHT * 3, position: 'relative', marginBottom: 20 },
    column: { width: 70, height: '100%' },
    itemWrapper: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center' },
    itemText: { fontSize: 24, fontWeight: '600' },

    inactiveText: { color: '#9CA3AF', opacity: 0.3 },
    activeText: { fontSize: 36, fontWeight: '700', color: '#F2C438' },
    separator: { fontSize: 32, fontWeight: '700', color: '#F2C438', paddingHorizontal: 15, bottom: 2 },

    activeIndicatorLine: {
        position: 'absolute',
        top: ITEM_HEIGHT,
        height: ITEM_HEIGHT,
        width: '80%',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
    },

    noteBox: { flexDirection: 'row', backgroundColor: '#E8F0FE', padding: 12, borderRadius: 16, alignItems: 'center', width: '100%' },
    noteIcon: { fontSize: 16, marginRight: 8 },
    noteText: { flex: 1, fontSize: 12, color: '#374151', lineHeight: 16 },

    submitButton: { backgroundColor: '#F2C438', width: '100%', paddingVertical: 16, borderRadius: 24, alignItems: 'center', marginTop: 20 },
    submitButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: width * 0.85, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32, alignItems: 'center' },
    modalTitle: { fontSize: 14, fontWeight: '700', color: '#1F2937', letterSpacing: 1, marginBottom: 12 },
    modalTime: { fontSize: 48, fontWeight: '700', color: '#2E7D32', marginBottom: 16 },
    modalBadge: { backgroundColor: '#E6F4EA', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 24 },
    modalBadgeText: { color: '#2E7D32', fontSize: 14, fontWeight: '600' },
    closeButton: { backgroundColor: '#E5E7EB', paddingVertical: 10, paddingHorizontal: 32, borderRadius: 20 },
    closeButtonText: { color: '#4B5563', fontWeight: '600' }
});