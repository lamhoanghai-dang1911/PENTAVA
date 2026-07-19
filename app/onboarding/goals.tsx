import { OnboardingTopBar } from '@/components/ui/onboarding-top-bar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SelectionCard } from '@/components/ui/selection-card';
import { Design, FontFamily } from '@/constants/design';
import { useOnboarding } from '@/context/onboarding-context';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const GOAL_OPTIONS = [
  'Bớt stress',
  'Ngủ Tốt Hơn',
  'Có năng lượng hơn',
  'Kỷ luật hơn',
  'Cải thiện sức khỏe',
  'Tập trung học tốt hơn',
] as const;

export default function GoalsScreen() {
  const { data, toggleGoal } = useOnboarding();
  const canContinue = data.goals.length > 0;

  return (
    <ScreenContainer scrollable contentStyle={styles.scrollContent}>
      <OnboardingTopBar
        currentStep={3}
        showBack
        showForward
        onBack={() => router.back()}
        onForward={() => {
          if (canContinue) {
            router.push('/onboarding/routine');
          }
        }}
      />

      <Text style={styles.title}>
        Bạn muốn cải thiện điều gì{'\n'}nhất lúc này?
      </Text>

      <View style={styles.optionGroup}>
        {GOAL_OPTIONS.map((option) => (
          <SelectionCard
            key={option}
            label={option}
            selected={data.goals.includes(option)}
            onPress={() => toggleGoal(option)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          disabled={!canContinue}
          label="Tiếp tục"
          onPress={() => router.push('/onboarding/routine')}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 8,
    paddingHorizontal: Design.spacing.screenHorizontal,
    paddingBottom: 36,
  },
  title: {
    marginTop: 36,
    marginBottom: 24,
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
    marginTop: 40,
  },
});
