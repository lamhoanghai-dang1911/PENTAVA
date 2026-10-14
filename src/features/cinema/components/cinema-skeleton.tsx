import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton, SkeletonCircle, SkeletonText } from '@/src/components/ui/skeleton';

export function CinemaGoalsSkeleton() {
  return (
    <View style={styles.container}>
      {/* Storage Quota Card */}
      <View style={styles.quotaCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <SkeletonCircle color="#E2E8F0" size={40} />
          <View style={{ flex: 1, gap: 6 }}>
            <SkeletonText color="#CBD5E1" height={14} width="55%" />
            <SkeletonText color="#E2E8F0" height={11} width="35%" />
          </View>
          <Skeleton borderRadius={16} color="#E2E8F0" height={32} width={70} />
        </View>
        <Skeleton borderRadius={6} color="#E2E8F0" height={8} style={{ marginTop: 14 }} width="100%" />
      </View>

      {/* 3 Goal Cards */}
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.goalCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <SkeletonCircle color="#E2E8F0" size={46} />
            <View style={{ flex: 1, gap: 6 }}>
              <SkeletonText color="#CBD5E1" height={16} width="60%" />
              <SkeletonText color="#E2E8F0" height={12} width="40%" />
            </View>
            <SkeletonCircle color="#E2E8F0" size={28} />
          </View>
          <Skeleton borderRadius={6} color="#F1F5F9" height={8} style={{ marginTop: 14 }} width="100%" />
        </View>
      ))}
    </View>
  );
}

export function CinemaPhotosSkeleton() {
  return (
    <View style={styles.photosGrid}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
        <View key={item} style={styles.photoItem}>
          <Skeleton borderRadius={16} color="#E2E8F0" height={110} width="100%" />
        </View>
      ))}
    </View>
  );
}

export function CinemaClipsSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2].map((item) => (
        <View key={item} style={styles.clipCard}>
          <Skeleton borderRadius={18} color="#E2E8F0" height={190} width="100%" />
          <View style={{ marginTop: 12, gap: 6 }}>
            <SkeletonText color="#CBD5E1" height={16} width="65%" />
            <SkeletonText color="#E2E8F0" height={12} width="40%" />
          </View>
        </View>
      ))}
    </View>
  );
}

export function CinemaWeeksSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.weekCard}>
          <SkeletonCircle color="#E2E8F0" size={42} />
          <View style={{ flex: 1, gap: 6 }}>
            <SkeletonText color="#CBD5E1" height={15} width="50%" />
            <SkeletonText color="#E2E8F0" height={11} width="35%" />
          </View>
          <Skeleton borderRadius={14} color="#E2E8F0" height={28} width={64} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  quotaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
  },
  goalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 12,
  },
  photoItem: {
    width: '31%',
  },
  clipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 16,
  },
  weekCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },
});
