import { Design, FontFamily } from '@/src/constants/design';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type AssessmentTopBarProps = {
  currentStep: number;
  totalSteps?: number;
  showBack?: boolean;
  onBack?: () => void;
  onClose?: () => void;
};

export function AssessmentTopBar({
  currentStep,
  totalSteps = 6,
  showBack = false,
  onBack,
  onClose,
}: AssessmentTopBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navRow}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
            onPress={onBack}
            style={({ pressed }) => [styles.navButton, pressed && { opacity: 0.7 }]}>
            <Ionicons color={Design.colors.black} name="chevron-back" size={20} />
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}

        <Text style={styles.stepText}>
          {currentStep <= totalSteps ? `Bước ${currentStep} / ${totalSteps}` : 'Tổng kết'}
        </Text>

        {onClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Đóng"
            onPress={onClose}
            style={({ pressed }) => [styles.navButton, pressed && { opacity: 0.7 }]}>
            <Ionicons color={Design.colors.black} name="close" size={20} />
          </Pressable>
        ) : (
          <View style={styles.navSpacer} />
        )}
      </View>

      {currentStep <= totalSteps ? (
        <View style={styles.progressRow}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressSegment,
                index < currentStep && styles.progressSegmentActive,
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingBottom: 8,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    width: 42,
    height: 42,
    borderRadius: Design.borderRadius.navButton,
    borderWidth: 1,
    borderColor: Design.colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Design.colors.white,
  },
  navSpacer: {
    width: 42,
    height: 42,
  },
  stepText: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 13,
    color: '#64748B',
    letterSpacing: 0.3,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
  },
  progressSegment: {
    flex: 1,
    height: 8,
    borderRadius: Design.borderRadius.progress,
    backgroundColor: Design.colors.progressInactive,
  },
  progressSegmentActive: {
    backgroundColor: Design.colors.primaryGreen,
  },
});
