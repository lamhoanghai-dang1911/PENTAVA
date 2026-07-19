import { Design } from '@/constants/design';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ProgressBar } from './progress-bar';

type OnboardingTopBarProps = {
  currentStep: number;
  showBack?: boolean;
  showForward?: boolean;
  showClose?: boolean;
  onBack?: () => void;
  onForward?: () => void;
  onClose?: () => void;
};

export function OnboardingTopBar({
  currentStep,
  showBack = false,
  showForward = false,
  showClose = false,
  onBack,
  onForward,
  onClose,
}: OnboardingTopBarProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.navRow}>
        {showClose ? (
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
            <Image
              source={require('@/assets/images/onboarding/close-icon.png')}
              style={styles.closeIcon}
            />
          </Pressable>
        ) : showBack ? (
          <Pressable
            accessibilityRole="button"
            onPress={onBack}
            style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
            <Image
              source={require('@/assets/images/onboarding/back-arrow.png')}
              style={styles.backIcon}
            />
          </Pressable>
        ) : (
          <View style={styles.navPlaceholder} />
        )}

        {showForward ? (
          <Pressable
            accessibilityRole="button"
            onPress={onForward}
            style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
            <Image
              source={require('@/assets/images/onboarding/back-arrow.png')}
              style={styles.forwardIcon}
            />
          </Pressable>
        ) : (
          <View style={styles.navPlaceholder} />
        )}
      </View>

      <ProgressBar currentStep={currentStep} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 25,
    paddingHorizontal: Design.spacing.screenHorizontal,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navPlaceholder: {
    width: 42,
    height: 42,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: Design.borderRadius.closeButton,
    borderWidth: 1,
    borderColor: Design.colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 17,
    height: 17,
  },
  navButton: {
    width: 42,
    height: 42,
    borderRadius: Design.borderRadius.navButton,
    borderWidth: 1,
    borderColor: Design.colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 16,
    height: 32,
    transform: [{ rotate: '180deg' }],
  },
  forwardIcon: {
    width: 16,
    height: 32,
    transform: [{ scaleY: -1 }],
  },
  pressed: {
    opacity: 0.75,
  },
});
