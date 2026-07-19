import { LabeledTextInput } from '@/components/ui/labeled-text-input';
import { OnboardingTopBar } from '@/components/ui/onboarding-top-bar';
import { PrimaryButton } from '@/components/ui/primary-button';
import { ScreenContainer } from '@/components/ui/screen-container';
import { Design, FontFamily } from '@/constants/design';
import { useOnboarding } from '@/context/onboarding-context';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function NameScreen() {
  const { data, setName } = useOnboarding();
  const canContinue = data.name.trim().length > 0;

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <OnboardingTopBar
          currentStep={1}
          showClose
          onClose={() => router.replace('/login')}
        />

        <Text style={styles.title}>Tên bạn là gì?</Text>

        <LabeledTextInput
          autoFocus
          label="Họ và tên"
          onChangeText={setName}
          value={data.name}
        />

        <View style={styles.footer}>
          <PrimaryButton
            disabled={!canContinue}
            label="Tiếp tục"
            onPress={() => router.push('/onboarding/gender-age')}
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
    marginTop: 42,
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: Design.fontSize.title,
    color: Design.colors.black,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 36,
  },
});
