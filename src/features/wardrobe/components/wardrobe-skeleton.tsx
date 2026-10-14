import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton, SkeletonText } from '@/src/components/ui/skeleton';

export function WardrobeSkeleton() {
  return (
    <View style={styles.container}>
      {/* Avatar Preview Box */}
      <View style={styles.avatarPreview}>
        <Skeleton borderRadius={24} color="#E2E8F0" height={220} width="100%" />
      </View>

      {/* Inventory Section Title & Count */}
      <View style={styles.sectionHeader}>
        <SkeletonText color="#94A3B8" height={16} width={140} />
        <Skeleton borderRadius={12} color="#E2E8F0" height={24} width={48} />
      </View>

      {/* Grid of 6 Inventory Items */}
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <View key={item} style={styles.itemCard}>
            <Skeleton borderRadius={16} color="#F1F5F9" height={84} width="100%" />
            <SkeletonText color="#CBD5E1" height={12} style={{ marginTop: 8 }} width="70%" />
            <Skeleton borderRadius={14} color="#E2E8F0" height={28} style={{ marginTop: 8 }} width="100%" />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  avatarPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 10,
    alignItems: 'center',
  },
});
