import { ScreenContainer } from '@/src/components/ui/screen-container';
import { Design, FontFamily } from '@/src/constants/design';
import { useOnboarding } from '@/src/context/onboarding-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function RecoveryScreen() {
    const { submitResponse } = useOnboarding();
    const diagnostic = submitResponse?.diagnostic;
    const firstPlan = diagnostic?.actionPlans[0];

    return (
        <ScreenContainer>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.content}>
                    <Image
                        contentFit="contain"
                        source={require('@/assets/images/onboarding/cat-sparkle.png')}
                        style={styles.mascot}
                    />
                    <Text style={styles.title}>Chuẩn đoán</Text>
                    <Text style={styles.message}>
                        {diagnostic?.summary || 'Đang tải kế hoạch hồi phục của bạn...'}
                    </Text>
                    {diagnostic?.topIssues.map((issue) => (
                        <Text key={issue} style={styles.issue}>• {issue}</Text>
                    ))}
                    {firstPlan && (
                        <View style={styles.plan}>
                            <Text style={styles.planTitle}>{firstPlan.goal}</Text>
                            <Text style={styles.planDescription}>{firstPlan.description}</Text>
                            {firstPlan.actions.map((action) => (
                                <Text key={action} style={styles.action}>• {action}</Text>
                            ))}
                        </View>
                    )}
                </View>

                <View style={styles.footer}>
                    <Pressable
                        accessibilityRole="button"
                        onPress={() => router.push('/onboarding/character')}
                        style={({ pressed }) => [styles.ctaButton, pressed && styles.ctaButtonPressed]}>
                        <Text style={styles.ctaLabel}>Bắt đầu hành trình</Text>
                    </Pressable>
                </View>
            </ScrollView>
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
    issue: {
        alignSelf: 'stretch',
        marginTop: 8,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption,
        color: Design.colors.mutedText,
    },
    plan: {
        alignSelf: 'stretch',
        marginTop: 20,
        padding: 16,
        borderRadius: Design.borderRadius.button,
        backgroundColor: '#F3F7F4',
    },
    planTitle: {
        marginBottom: 6,
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.body,
        color: Design.colors.primaryGreen,
    },
    planDescription: {
        marginBottom: 10,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption,
        color: Design.colors.mutedText,
        lineHeight: 19,
    },
    action: {
        marginTop: 5,
        fontFamily: FontFamily.beVietnamRegular,
        fontSize: Design.fontSize.caption,
        color: Design.colors.black,
        lineHeight: 19,
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