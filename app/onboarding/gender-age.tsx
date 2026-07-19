import { OnboardingTopBar } from '@/components/ui/onboarding-top-bar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { SelectionCard } from '@/components/ui/selection-card';
import { Design, FontFamily } from '@/constants/design';
import { useOnboarding } from '@/context/onboarding-context';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

const GENDER_OPTIONS = ['Nam', 'Nữ', 'Khác'] as const;
const AGE_OPTIONS = ['Dưới 18 tuổi', '18-24', '25-34'] as const;

export default function GenderAgeScreen() {
  const { data, setGender, setAge } = useOnboarding();
  const canContinue = Boolean(data.gender && data.age);

  return (
    <ScreenContainer scrollable contentStyle={styles.scrollContent}>
      <OnboardingTopBar currentStep={2} showBack onBack={() => router.back()} />

      <Text style={styles.sectionTitle}>Giới tính của bạn là gì?</Text>
      <View style={styles.optionGroup}>
        {GENDER_OPTIONS.map((option) => (
          <SelectionCard
            key={option}
            label={option}
            selected={data.gender === option}
            onPress={() => setGender(option)}
          />
        ))}
      </View>

      <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Bạn bao nhiêu tuổi?</Text>
      <View style={styles.optionGroup}>
        {AGE_OPTIONS.map((option) => (
          <SelectionCard
            key={option}
            label={option}
            selected={data.age === option}
            onPress={() => setAge(option)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          disabled={!canContinue}
          label="Tiếp tục"
          onPress={() => router.push('/onboarding/goals')}
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
  sectionTitle: {
    marginTop: 36,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.title,
    color: Design.colors.black,
  },
  sectionTitleSpaced: {
    marginTop: 48,
  },
  optionGroup: {
    gap: 13,
    paddingHorizontal: 8,
  },
  footer: {
    marginTop: 48,
  },
});
