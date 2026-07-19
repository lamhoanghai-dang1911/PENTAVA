import { Design } from '@/constants/design';
import { StyleSheet, View } from 'react-native';

type ProgressBarProps = {
  currentStep: number;
};

export function ProgressBar({ currentStep }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      {Design.progress.segmentWidths.map((width, index) => (
        <View
          key={`segment-${index}`}
          style={[
            styles.segment,
            { width },
            index < currentStep ? styles.segmentActive : styles.segmentInactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  segment: {
    height: 10,
    borderRadius: Design.borderRadius.progress,
  },
  segmentActive: {
    backgroundColor: Design.colors.black,
  },
  segmentInactive: {
    backgroundColor: Design.colors.progressInactive,
  },
});
