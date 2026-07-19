import { Design, FontFamily } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DiaryScreen() {
    const [caption, setCaption] = useState('');
    const [hashtag, setHashtag] = useState('');

    const handlePublish = () => {
        router.replace({
            pathname: '/community',
            params: { caption: caption.trim() },
        });
    };

    return (
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Quay lại"
                        hitSlop={8}
                        onPress={() => router.back()}
                        style={styles.backButton}>
                        <Ionicons color={Design.colors.primaryGreen} name="chevron-back" size={24} />
                    </Pressable>

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
                        <View style={styles.durationBadge}>
                            <Text style={styles.durationText}>00:45</Text>
                        </View>
                    </View>

                    <View style={styles.captionCard}>
                        <TextInput
                            multiline
                            onChangeText={setCaption}
                            placeholder="Thêm mô tả cho video của bạn..."
                            placeholderTextColor={Design.colors.disabled}
                            style={styles.captionInput}
                            value={caption}
                        />
                        <TextInput
                            autoCapitalize="none"
                            onChangeText={setHashtag}
                            placeholder="#Thêm hashtag"
                            placeholderTextColor={Design.colors.mutedText}
                            style={styles.hashtagInput}
                            value={hashtag}
                        />
                    </View>

                    <Pressable
                        accessibilityRole="button"
                        onPress={handlePublish}
                        style={({ pressed }) => [styles.publishButton, pressed && styles.publishPressed]}>
                        <Text style={styles.publishLabel}>Đăng lên cộng đồng</Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Design.colors.white,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 8,
        paddingBottom: 24,
    },
    backButton: {
        marginBottom: 12,
        alignSelf: 'flex-start',
    },
    videoCard: {
        height: 420,
        borderRadius: 18,
        overflow: 'hidden',
        marginBottom: 16,
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
    durationBadge: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        backgroundColor: 'rgba(0,0,0,0.55)',
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
    },
    durationText: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption,
        color: Design.colors.white,
    },
    captionCard: {
        borderWidth: 1,
        borderColor: '#E9E9E9',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingTop: 10,
        paddingBottom: 8,
        marginBottom: 18,
    },
    captionInput: {
        minHeight: 56,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 2,
        color: Design.colors.black,
        textAlignVertical: 'top',
        paddingVertical: 0,
        marginBottom: 10,
    },
    hashtagInput: {
        fontFamily: FontFamily.beVietnamMedium,
        fontSize: Design.fontSize.caption + 1,
        color: Design.colors.black,
        paddingVertical: 0,
    },
    publishButton: {
        height: 50,
        borderRadius: 25,
        backgroundColor: Design.colors.primaryGreen,
        alignItems: 'center',
        justifyContent: 'center',
    },
    publishPressed: {
        opacity: 0.8,
    },
    publishLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.caption + 3,
        color: Design.colors.white,
    },
});