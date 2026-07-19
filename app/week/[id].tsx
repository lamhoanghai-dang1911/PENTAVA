import { Design, FontFamily } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const WEEK_IDS = [1, 2, 3, 4] as const;

export default function WeekDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const weekNumber = Number(id) || 1;
    const [isPickerOpen, setIsPickerOpen] = useState(false);

    const handleSelectWeek = (week: number) => {
        setIsPickerOpen(false);
        if (week !== weekNumber) {
            router.setParams({ id: String(week) });
        }
    };

    const handleSave = () => {
        // TODO: lưu video thật cần expo-media-library + file video từ server
        Alert.alert('Lưu vào máy', 'Tính năng lưu video sẽ được cập nhật sau.');
    };

    const handleShare = () => {
        router.push('/diary');
    };

    return (
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Quay lại"
                        hitSlop={8}
                        onPress={() => router.back()}
                        style={styles.backButton}>
                        <Ionicons color={Design.colors.primaryGreen} name="chevron-back" size={24} />
                    </Pressable>

                    <Pressable
                        accessibilityRole="button"
                        onPress={() => setIsPickerOpen((prev) => !prev)}
                        style={styles.titleButton}>
                        <Text style={styles.title}>Week {weekNumber}</Text>
                        <Ionicons
                            color={Design.colors.black}
                            name={isPickerOpen ? 'chevron-up' : 'chevron-down'}
                            size={16}
                        />
                    </Pressable>

                    {/* Giữ cân đối 2 bên cho tiêu đề nằm giữa */}
                    <View style={styles.backButton} />
                </View>

                {isPickerOpen ? (
                    <View style={styles.picker}>
                        {WEEK_IDS.map((week) => (
                            <Pressable
                                accessibilityRole="button"
                                key={week}
                                onPress={() => handleSelectWeek(week)}
                                style={[styles.pickerItem, week === weekNumber && styles.pickerItemActive]}>
                                <Text
                                    style={[
                                        styles.pickerItemText,
                                        week === weekNumber && styles.pickerItemTextActive,
                                    ]}>
                                    Week {week}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                ) : null}

                <View style={styles.videoCard}>
                    <Image
                        contentFit="cover"
                        source={require('@/assets/images/onboarding/cogai.png')}
                        style={styles.videoThumbnail}
                    />
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Phát video"
                        onPress={() => Alert.alert('Video', 'Trình phát video sẽ được cập nhật sau.')}
                        style={styles.playButton}>
                        <Ionicons color={Design.colors.white} name="play" size={26} />
                    </Pressable>
                </View>

                <View style={styles.footer}>
                    <Pressable
                        accessibilityRole="button"
                        onPress={handleSave}
                        style={({ pressed }) => [styles.saveButton, pressed && styles.buttonPressed]}>
                        <Text style={styles.saveLabel}>Lưu vào máy</Text>
                    </Pressable>
                    <Pressable
                        accessibilityRole="button"
                        onPress={handleShare} // Gọi hàm đã sửa ở trên
                        style={({ pressed }) => [styles.shareButton, pressed && styles.buttonPressed]}>
                        <Text style={styles.shareLabel}>Chia sẻ</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Design.colors.white,
    },
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    backButton: {
        width: 32,
    },
    titleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    title: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.title,
        color: Design.colors.black,
    },
    picker: {
        position: 'absolute',
        top: 52,
        alignSelf: 'center',
        zIndex: 10,
        backgroundColor: Design.colors.white,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E9E9E9',
        paddingVertical: 4,
        width: 140,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
    },
    pickerItem: {
        paddingVertical: 9,
        paddingHorizontal: 16,
    },
    pickerItemActive: {
        backgroundColor: '#EAF4EE',
    },
    pickerItemText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.black,
        textAlign: 'center',
    },
    pickerItemTextActive: {
        color: Design.colors.primaryGreen,
    },
    videoCard: {
        flex: 1,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    videoThumbnail: {
        ...StyleSheet.absoluteFillObject,
    },
    playButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        gap: 12,
        paddingBottom: 16,
    },
    saveButton: {
        height: 50,
        borderRadius: 25,
        backgroundColor: Design.colors.primaryGreen,
        alignItems: 'center',
        justifyContent: 'center',
    },
    saveLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 3,
        color: Design.colors.white,
    },
    shareButton: {
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: Design.colors.optionBorder,
        backgroundColor: Design.colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 3,
        color: Design.colors.primaryGreen,
    },
    buttonPressed: {
        opacity: 0.8,
    },
});