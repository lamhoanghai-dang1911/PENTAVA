import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton, SkeletonText } from '@/src/components/ui/skeleton';

export function TopupPackagesSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} style={styles.card}>
          <View style={styles.info}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <SkeletonText color="#CBD5E1" height={16} width={110} />
              {item === 2 ? (
                <Skeleton borderRadius={10} color="#FEF3C7" height={20} width={64} />
              ) : null}
            </View>
            <SkeletonText color="#94A3B8" height={13} style={{ marginTop: 8 }} width={90} />
            <SkeletonText color="#E2E8F0" height={11} style={{ marginTop: 4 }} width={120} />
          </View>
          <View style={styles.priceCol}>
            <SkeletonText color="#CBD5E1" height={16} width={80} />
            <Skeleton borderRadius={16} color="#D1FAE5" height={36} style={{ marginTop: 8 }} width={84} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingTop: 8,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 12,
  },
  info: {
    flex: 1,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
});
