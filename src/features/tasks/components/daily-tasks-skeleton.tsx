import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton, SkeletonCircle, SkeletonText } from '@/src/components/ui/skeleton';

export function DailyTasksSkeleton() {
  return (
    <View style={styles.container}>
      {/* 5 Task Cards */}
      {[1, 2, 3, 4, 5].map((index) => (
        <View key={index} style={styles.taskCard}>
          {/* Left Icon */}
          <SkeletonCircle color="#E2E8F0" size={46} />

          {/* Middle Content */}
          <View style={styles.taskInfo}>
            <SkeletonText color="#CBD5E1" height={16} width="65%" />
            <SkeletonText color="#E2E8F0" height={12} style={{ marginTop: 8 }} width="90%" />
          </View>

          {/* Right Action Button */}
          <Skeleton borderRadius={18} color="#D1FAE5" height={36} width={76} />
        </View>
      ))}

      {/* End Goal Card Placeholder */}
      <View style={styles.goalCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <SkeletonCircle color="#E2E8F0" size={38} />
          <View style={{ flex: 1, gap: 6 }}>
            <SkeletonText color="#CBD5E1" height={14} width="50%" />
            <SkeletonText color="#E2E8F0" height={11} width="80%" />
          </View>
        </View>
        <Skeleton borderRadius={6} color="#E2E8F0" height={8} style={{ marginTop: 14 }} width="100%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 4,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  taskInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 18,
    marginTop: 8,
    marginBottom: 16,
  },
});
