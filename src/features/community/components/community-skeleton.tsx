import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton, SkeletonCircle, SkeletonText } from '@/src/components/ui/skeleton';

export function CommunitySkeleton() {
  return (
    <View style={styles.container}>
      {/* 3 Post Cards */}
      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.postCard}>
          {/* Header */}
          <View style={styles.header}>
            <SkeletonCircle color="#E2E8F0" size={44} />
            <View style={styles.headerText}>
              <SkeletonText color="#CBD5E1" height={15} width="45%" />
              <SkeletonText color="#E2E8F0" height={11} style={{ marginTop: 6 }} width="25%" />
            </View>
            <Skeleton borderRadius={12} color="#F1F5F9" height={24} width={50} />
          </View>

          {/* Post Content */}
          <View style={styles.content}>
            <SkeletonText color="#94A3B8" height={13} width="95%" />
            <SkeletonText color="#94A3B8" height={13} style={{ marginTop: 6 }} width="80%" />
            <SkeletonText color="#94A3B8" height={13} style={{ marginTop: 6 }} width="50%" />
          </View>

          {/* Post Image Placeholder (for first and third card) */}
          {item !== 2 ? (
            <Skeleton
              borderRadius={16}
              color="#F1F5F9"
              height={180}
              style={{ marginTop: 12 }}
              width="100%"
            />
          ) : null}

          {/* Action Row */}
          <View style={styles.actions}>
            <Skeleton borderRadius={16} color="#E2E8F0" height={32} width={80} />
            <Skeleton borderRadius={16} color="#E2E8F0" height={32} width={70} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerText: {
    flex: 1,
  },
  content: {
    marginTop: 14,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
});
