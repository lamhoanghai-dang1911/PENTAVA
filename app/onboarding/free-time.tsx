import { OnboardingTopBar } from '@/components/ui/onboarding-top-bar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SelectionCard } from '@/components/ui/selection-card';
import { Design, FontFamily } from '@/constants/design';
import { useOnboarding } from '@/context/onboarding-context';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const FREE_TIME_OPTIONS = ['Sáng', 'Chiều', 'Tối'] as const;

export default function FreeTimeScreen() {
    const { data, toggleFreeTime } = useOnboarding();
    const canContinue = data.freeTimes.length > 0;

    const handleFinish = () => {
        if (!canContinue) return;
        router.replace('/onboarding/route-loading');
    };

    return (
        <ScreenContainer>
            <View style={styles.container}>
                <OnboardingTopBar currentStep={10} showBack onBack={() => router.back()} />

                <Text style={styles.title}>
                    Bạn thường có thời gian{'\n'}rảnh nhất vào lúc nào?
                </Text>

                <View style={styles.optionGroup}>
                    {FREE_TIME_OPTIONS.map((option) => (
                        <SelectionCard
                            key={option}
                            label={option}
                            selected={data.freeTimes.includes(option)}
                            onPress={() => toggleFreeTime(option)}
                        />
                    ))}
                </View>

                <View style={styles.footer}>
                    <PrimaryButton disabled={!canContinue} label="Hoàn Thành" onPress={handleFinish} />
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