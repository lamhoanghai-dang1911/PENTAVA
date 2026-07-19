import { OnboardingTopBar } from '@/components/ui/onboarding-top-bar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SelectionCard } from '@/components/ui/selection-card';
import { Design, FontFamily } from '@/constants/design';
import { useOnboarding } from '@/context/onboarding-context';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

// Lưu ý: option cuối trong Figma ghi "Dưới 3 tiếng" — nhiều khả năng là lỗi đánh máy
// của design (câu hỏi về thói quen thì hợp lý phải là "Trên 3 tuần").
// Đang để "Trên 3 tuần", nếu muốn giữ đúng Figma thì đổi lại chuỗi bên dưới.
const HABIT_OPTIONS = [
    'Dưới 3 ngày',
    'Khoảng 1 tuần',
    '2-3 tuần',
    'Trên 3 tuần',
] as const;

export default function HabitScreen() {
    const { data, setHabitDuration } = useOnboarding();
    const canContinue = Boolean(data.habitDuration);

    return (
        <ScreenContainer>
            <View style={styles.container}>
                <OnboardingTopBar
                    currentStep={9}
                    showBack
                    showForward
                    onBack={() => router.back()}
                    onForward={() => {
                        if (canContinue) {
                            router.push('/onboarding/free-time');
                        }
                    }}
                />

                <Text style={styles.title}>
                    Bạn thường duy trì một{'\n'}thói quen mới được bao lâu?
                </Text>

                <View style={styles.optionGroup}>
                    {HABIT_OPTIONS.map((option) => (
                        <SelectionCard
                            key={option}
                            label={option}
                            selected={data.habitDuration === option}
                            onPress={() => setHabitDuration(option)}
                        />
                    ))}
                </View>

                <View style={styles.footer}>
                    <PrimaryButton
                        disabled={!canContinue}
                        label="Tiếp tục"
                        onPress={() => router.push('/onboarding/free-time')}
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