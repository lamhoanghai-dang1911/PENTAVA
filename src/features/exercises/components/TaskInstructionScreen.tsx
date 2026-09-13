import { useRouter } from 'expo-router';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { ExerciseTask } from '@/src/features/exercises/types';

const { width, height } = Dimensions.get('window');

type TaskInstructionScreenProps = {
  task: ExerciseTask;
  nextRoute: string;
  nextRouteParams?: Record<string, string>;
};

export function TaskInstructionScreen({ task, nextRoute, nextRouteParams }: TaskInstructionScreenProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image source={task.heroImage} style={styles.topImage} resizeMode="cover" />
      <View style={styles.bottomCard}>
        <Text style={styles.title}>{task.title}</Text>

        {task.steps.map((step, index) => (
          <View key={`${task.id}-${step.title}`} style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: `${task.accentColor}22` }]}>
              <Text style={[styles.stepBadgeText, { color: task.accentColor }]}>{index + 1}</Text>
            </View>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDesc}>{step.description}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: task.buttonColor }]}
          onPress={() => router.push({ pathname: nextRoute as never, params: nextRouteParams })}
        >
          <Text style={styles.primaryButtonText}>Bắt đầu hành trình</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FA' },
  topImage: { width, height: height * 0.55 },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    width,
    height: height * 0.52,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 24 },
  stepRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
  stepBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16, marginTop: 2 },
  stepBadgeText: { fontWeight: '700', fontSize: 14 },
  stepTextContainer: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  stepDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  primaryButton: { paddingVertical: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
