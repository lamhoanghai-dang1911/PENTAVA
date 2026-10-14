import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton, SkeletonCircle, SkeletonText } from '@/src/components/ui/skeleton';

export function SettingsSkeleton() {
  return (
    <View style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <SkeletonCircle color="#E2E8F0" size={72} />
        <View style={styles.profileInfo}>
          <SkeletonText color="#CBD5E1" height={18} width="60%" />
          <SkeletonText color="#E2E8F0" height={12} style={{ marginTop: 8 }} width="85%" />
        </View>
      </View>

      {/* Menu Rows */}
      <View style={styles.menuContainer}>
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <View key={item} style={styles.menuRow}>
            <SkeletonCircle color="#E2E8F0" size={38} />
            <View style={{ flex: 1 }}>
              <SkeletonText color="#CBD5E1" height={15} width={item % 2 === 0 ? '55%' : '70%'} />
            </View>
            <Skeleton borderRadius={6} color="#F1F5F9" height={18} width={18} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    gap: 16,
  },
  profileInfo: {
    flex: 1,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
});
