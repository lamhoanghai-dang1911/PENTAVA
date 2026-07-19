import { OnboardingTopBar } from '@/components/ui/onboarding-top-bar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SelectionCard } from '@/components/ui/selection-card';
import { Design, FontFamily } from '@/constants/design';
import { useOnboarding } from '@/context/onboarding-context';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const EXERCISE_OPTIONS = [
    'Gần như không',
    '1-2 lần/tuần',
    '3-4 lần/tuần',
    'Gần như mỗi ngày',
] as const;

export default function ExerciseScreen() {
    const { data, setExerciseFrequency } = useOnboarding();
    const canContinue = Boolean(data.exerciseFrequency);

    return (
        <ScreenContainer>
            <View style={styles.container}>
                <OnboardingTopBar
                    currentStep={6}
                    showBack
                    showForward
                    onBack={() => router.back()}
                    onForward={() => {
                        if (canContinue) {
                            router.push('/onboarding/stress');
                        }
                    }}
                />

                <Text style={styles.title}>
                    Bạn vận động bao nhiêu{'\n'}lần mỗi tuần?
                </Text>

                <View style={styles.optionGroup}>
                    {EXERCISE_OPTIONS.map((option) => (
                        <SelectionCard
                            key={option}
                            label={option}
                            selected={data.exerciseFrequency === option}
                            onPress={() => setExerciseFrequency(option)}
                        />
                    ))}
                </View>

                <View style={styles.footer}>
                    <PrimaryButton
                        disabled={!canContinue}
                        label="Tiếp tục"
                        onPress={() => router.push('/onboarding/stress')}
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