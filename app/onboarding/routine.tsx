import { OnboardingTopBar } from '@/components/ui/onboarding-top-bar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SelectionCard } from '@/components/ui/selection-card';
import { Design, FontFamily } from '@/constants/design';
import { useOnboarding } from '@/context/onboarding-context';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const ROUTINE_OPTIONS = ['Nhẹ nhàng, dễ duy trì', 'Cân bằng', 'Thử thách hơn'] as const;

export default function RoutineScreen() {
  const { data, setRoutine } = useOnboarding();
  const canContinue = Boolean(data.routine);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <OnboardingTopBar
          currentStep={4}
          showBack
          showForward
          onBack={() => router.back()}
          onForward={() => {
            if (canContinue) {
              router.push('/onboarding/sleep');
            }
          }}
        />

        <Text style={styles.title}>
          Bạn muốn routine{'\n'}theo hướng nào?
        </Text>

        <View style={styles.optionGroup}>
          {ROUTINE_OPTIONS.map((option) => (
            <SelectionCard
              key={option}
              label={option}
              selected={data.routine === option}
              onPress={() => setRoutine(option)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <PrimaryButton
            disabled={!canContinue}
            label="Tiếp tục"
            onPress={() => router.push('/onboarding/sleep')}
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
