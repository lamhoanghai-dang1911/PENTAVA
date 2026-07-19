import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Page1() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/onboarding/meo_task2_1.png')}
        style={styles.topImage}
        resizeMode="cover"
      />
      <View style={styles.bottomCard}>
        <Text style={styles.title}>Hướng dẫn nhiệm vụ</Text>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepTitle}>Ăn đủ rau quả</Text>
            <Text style={styles.stepDesc}>Cố gắng hoàn thành 5 khẩu phần rau củ quả trong hôm nay.</Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepTitle}>Cập nhật khẩu phần</Text>
            <Text style={styles.stepDesc}>Ghi lại số khẩu phần rau củ quả bạn đã ăn trong ngày.</Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepTitle}>Check-in bữa rau</Text>
            <Text style={styles.stepDesc}>Chụp một bữa ăn có rau củ quả để lưu lại tiến độ.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/task2/page2')}>
          <Text style={styles.primaryButtonText}>Bắt đầu hành trình</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FA' },
  topImage: { width: width, height: height * 0.55 },
  bottomCard: {
    position: 'absolute', bottom: 0, width: width, height: height * 0.52,
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 32,
    shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 5,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 24 },
  stepRow: { flexDirection: 'row', marginBottom: 20, alignItems: 'flex-start' },
  stepBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#E6F4EA', justifyContent: 'center', alignItems: 'center', marginRight: 16, marginTop: 2 },
  stepBadgeText: { color: '#34A853', fontWeight: '700', fontSize: 14 },
  stepTextContainer: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  stepDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  primaryButton: { backgroundColor: '#2E7D32', paddingVertical: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
