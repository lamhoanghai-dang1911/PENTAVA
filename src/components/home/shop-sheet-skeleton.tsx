import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton, SkeletonText } from '@/src/components/ui/skeleton';

export function ShopSheetSkeleton() {
  return (
    <View style={styles.grid}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.card}>
          <Skeleton borderRadius={16} color="#E2E8F0" height={105} width="100%" />
          <SkeletonText color="#CBD5E1" height={14} style={{ marginTop: 10 }} width="75%" />
          <View style={styles.priceRow}>
            <Skeleton borderRadius={8} color="#FEF3C7" height={16} width={40} />
          </View>
          <Skeleton borderRadius={14} color="#D1FAE5" height={32} style={{ marginTop: 10 }} width="100%" />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
});
