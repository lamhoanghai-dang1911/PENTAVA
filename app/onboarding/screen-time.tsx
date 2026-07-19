import { OnboardingTopBar } from '@/components/ui/onboarding-top-bar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SelectionCard } from '@/components/ui/selection-card';
import { Design, FontFamily } from '@/constants/design';
import { useOnboarding } from '@/context/onboarding-context';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const SCREEN_TIME_OPTIONS = [
    'Trên 8 tiếng',
    '5-8 tiếng',
    '3-5 tiếng',
    'Dưới 3 tiếng',
] as const;

export default function ScreenTimeScreen() {
    const { data, setScreenTime } = useOnboarding();
    const canContinue = Boolean(data.screenTime);

    return (
        <ScreenContainer>
            <View style={styles.container}>
                <OnboardingTopBar
                    currentStep={8}
                    showBack
                    showForward
                    onBack={() => router.back()}
                    onForward={() => {
                        if (canContinue) {
                            router.push('/onboarding/habit');
                        }
                    }}
                />

                <Text style={styles.title}>
                    Screen time trung bình{'\n'}mỗi ngày của bạn khoảng bao lâu?
                </Text>

                <View style={styles.optionGroup}>
                    {SCREEN_TIME_OPTIONS.map((option) => (
                        <SelectionCard
                            key={option}
                            label={option}
                            selected={data.screenTime === option}
                            onPress={() => setScreenTime(option)}
                        />
                    ))}
                </View>

                <View style={styles.footer}>
                    <PrimaryButton
                        disabled={!canContinue}
                        label="Tiếp tục"
                        onPress={() => router.push('/onboarding/habit')}
                    />
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
    title: {
        marginTop: 36,
        marginBottom: 32,
        textAlign: 'center',
        fontFamily: FontFamily.beVietnamSemiBold,
        fontSize: Design.fontSize.title,
        color: Design.colors.black,
        lineHeight: 26,
    },
    optionGroup: {
        gap: 13,
        paddingHorizontal: 10,
    },
    footer: {
        marginTop: 'auto',
        paddingBottom: 36,
    },
});