import { Design, FontFamily } from '@/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Màu vàng nút "Bắt đầu" theo Figma — nên chuyển vào Design.colors (vd: accentYellow)
const ACCENT_YELLOW = '#F2B544';

const CHARACTER_NAME = 'Luna';
const CHARACTER_BIO =
    'Luna là một cô mèo lười biếng một cách đáng yêu, sống theo nhịp độ riêng, không bao giờ hoảng hốt hay vội vã. Cô ấy tỏa ra sự bình yên đến mức khiến người khác cũng phải chậm lại.';

export default function CharacterScreen() {
    const handleShare = () => {
        Share.share({
            message: `Mình vừa bắt đầu hành trình cùng ${CHARACTER_NAME} trên Pentava! 🐱`,
        });
    };

    const handleStart = () => {
        // TODO: đây là màn cuối cùng của onboarding — lưu dữ liệu phỏng vấn
        // (useOnboarding().data) lên server/AsyncStorage trước khi rời flow,
        // vì sau router.replace thì OnboardingProvider unmount và data sẽ mất.
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <View style={styles.headerSpacer} />
                    <Text style={styles.characterName}>{CHARACTER_NAME}</Text>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Chia sẻ"
                        hitSlop={8}
                        onPress={handleShare}
                        style={styles.shareButton}>
                        <Ionicons color={Design.colors.white} name="share-outline" size={22} />
                    </Pressable>
                </View>

                <View style={styles.content}>
                    <Image
                        contentFit="contain"
                        source={require('@/assets/images/onboarding/cat-luna.png')}
                        style={styles.mascot}
                    />
                </View>

                <Text style={styles.bio}>{CHARACTER_BIO}</Text>

                <View style={styles.footer}>
                    <Pressable
                        accessibilityRole="button"
                        onPress={handleStart}
                        style={({ pressed }) => [styles.startButton, pressed && styles.startButtonPressed]}>
                        <Text style={styles.startLabel}>Bắt đầu</Text>
                    </Pressable>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: Design.colors.primaryGreen,
    },
    container: {
        flex: 1,
        paddingHorizontal: Design.spacing.screenHorizontal,
        paddingTop: 12,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerSpacer: {
        width: 22,
    },
    characterName: {
        fontFamily: FontFamily.poppinsSemiBold,
        fontSize: Design.fontSize.title,
        color: Design.colors.white,
    },
    shareButton: {
        width: 22,
        alignItems: 'flex-end',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mascot: {
        width: 240,
        height: 300,
    },
    bio: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption + 1,
        color: Design.colors.white,
        textAlign: 'center',
        lineHeight: 17,
        opacity: 0.95,
        paddingHorizontal: 12,
        marginBottom: 20,
    },
    footer: {
        alignItems: 'center',
        paddingBottom: 36,
    },
    startButton: {
        minWidth: 132,
        height: 44,
        borderRadius: Design.borderRadius.input,
        backgroundColor: ACCENT_YELLOW,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 28,
    },
    startButtonPressed: {
        opacity: 0.8,
    },
    startLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body - 2,
        color: Design.colors.white,
    },
});