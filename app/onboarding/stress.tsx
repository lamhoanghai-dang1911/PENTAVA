import { OnboardingTopBar } from '@/components/ui/onboarding-top-bar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SelectionCard } from '@/components/ui/selection-card';
import { Design, FontFamily } from '@/constants/design';
import { useOnboarding } from '@/context/onboarding-context';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const STRESS_OPTIONS = [
    'Gần như mỗi ngày',
    'Vài lần/tuần',
    'Thỉnh thoảng',
    'Hiếm khi',
] as const;

export default function StressScreen() {
    const { data, setStressFrequency } = useOnboarding();
    const canContinue = Boolean(data.stressFrequency);

    return (
        <ScreenContainer>
            <View style={styles.container}>
                <OnboardingTopBar
                    currentStep={7}
                    showBack
                    showForward
                    onBack={() => router.back()}
                    onForward={() => {
                        if (canContinue) {
                            router.push('/onboarding/screen-time');
                        }
                    }}
                />

                <Text style={styles.title}>
                    Bạn cảm thấy stress hoặc quá tải{'\n'}bao lâu một lần?
                </Text>

                <View style={styles.optionGroup}>
                    {STRESS_OPTIONS.map((option) => (
                        <SelectionCard
                            key={option}
                            label={option}
                            selected={data.stressFrequency === option}
                            onPress={() => setStressFrequency(option)}
                        />
                    ))}
                </View>

                <View style={styles.footer}>
                    <PrimaryButton
                        disabled={!canContinue}
                        label="Tiếp tục"
                        onPress={() => router.push('/onboarding/screen-time')}
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