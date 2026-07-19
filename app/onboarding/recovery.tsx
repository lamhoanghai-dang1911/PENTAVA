import { ScreenContainer } from '@/components/ui/screen-container';
import { Design, FontFamily } from '@/constants/design';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

// TODO: về sau tiêu đề và lời nhắn nên được cá nhân hóa dựa trên
// câu trả lời phỏng vấn (useOnboarding().data) hoặc trả về từ server.
const PLAN_TITLE = 'Tuần hồi phục';
const PLAN_MESSAGE =
    '"Gửi bạn, mình nhận thấy dạo gần đây bạn đã rất cố gắng, nhưng cơ thể và tâm trí có vẻ đang hơi quá tải. Hôm nay có thể không cần làm quá nhiều, chỉ cần nghỉ ngơi và hồi phục một chút cũng đã rất tốt rồi. Hãy dành nhiều thời gian hơn cho chính mình. Mình sẽ luôn ở đây đồng hành cùng bạn, không cần vội đâu."';

export default function RecoveryScreen() {
    return (
        <ScreenContainer>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Image
                        contentFit="contain"
                        source={require('@/assets/images/onboarding/cat-sparkle.png')}
                        style={styles.mascot}
                    />
                    <Text style={styles.title}>{PLAN_TITLE}</Text>
                    <Text style={styles.message}>{PLAN_MESSAGE}</Text>
                </View>

                <View style={styles.footer}>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.push('/onboarding/character')}
                        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}>
                        <Text style={styles.ctaLabel}>Bắt đầu hành trình</Text>
                    </Pressable>
                </View>
            </View>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 8,
        paddingHorizontal: Design.spacing.screenHorizontal,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mascot: {
        width: 190,
        height: 190,
        marginBottom: 24,
    },
    title: {
        fontFamily: FontFamily.poppinsSemiBold,
        fontSize: Design.fontSize.h2,
        color: Design.colors.primaryGreen,
        textAlign: 'center',
        marginBottom: 20,
    },
    message: {
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.body - 3,
        color: Design.colors.mutedText,
        textAlign: 'center',
        lineHeight: 21,
        paddingHorizontal: 6,
    },
    footer: {
        paddingBottom: 36,
    },
    ctaButton: {
        height: 52,
        borderRadius: Design.borderRadius.button,
        borderWidth: 1,
        borderColor: Design.colors.optionBorder,
        backgroundColor: Design.colors.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ctaButtonPressed: {
        opacity: 0.7,
    },
    ctaLabel: {
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body - 2,
        color: Design.colors.primaryGreen,
    },
});