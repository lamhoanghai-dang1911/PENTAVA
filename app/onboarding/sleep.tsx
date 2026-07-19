import { OnboardingTopBar } from '@/components/ui/onboarding-top-bar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SelectionCard } from '@/components/ui/selection-card';
import { Design, FontFamily } from '@/constants/design';
import { useOnboarding } from '@/context/onboarding-context';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const SLEEP_OPTIONS = ['Dưới 5 tiếng', '7-8 tiếng', '5-6 tiếng', 'Ngủ không đều'] as const;

export default function SleepScreen() {
  const { data, setSleepHours } = useOnboarding();
  const canContinue = Boolean(data.sleepHours);

  const handleContinue = () => {
    router.replace('/(tabs)');
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <OnboardingTopBar
          currentStep={5}
          showBack
          showForward
          onBack={() => router.back()}
          onForward={() => {
            if (canContinue) {
              handleContinue();
            }
          }}
        />

        <Text style={styles.title}>
          Bạn ngủ trung bình{'\n'}bao nhiêu tiếng mỗi đêm?
        </Text>

        <View style={styles.optionGroup}>
          {SLEEP_OPTIONS.map((option) => (
            <SelectionCard
              key={option}
              label={option}
              selected={data.sleepHours === option}
              onPress={() => setSleepHours(option)}
            />
          ))}
        </View>

        <View style={styles.footer}>
          <PrimaryButton disabled={!canContinue} label="Tiếp tục" onPress={handleContinue} />
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
