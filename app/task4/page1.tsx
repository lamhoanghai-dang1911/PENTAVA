import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Task4Page1() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/onboarding/meo_task4_1.png')} 
        style={styles.topImage} 
        resizeMode="cover"
      />
      <View style={styles.bottomCard}>
        <Text style={styles.title}>Hướng dẫn nhiệm vụ</Text>
        
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepTitle}>Đặt giờ ngủ</Text>
            <Text style={styles.stepDesc}>Chọn thời gian bạn muốn đi ngủ hôm nay.</Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepTitle}>Vệ sinh trước khi ngủ</Text>
            <Text style={styles.stepDesc}>Thực hiện vệ sinh cá nhân trước khi ngủ.</Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepTitle}>Tắt thiết bị</Text>
            <Text style={styles.stepDesc}>Tắt màn hình để cơ thể sẵn sàng nghỉ ngơi.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/task4/page2')}>
          <Text style={styles.primaryButtonText}>Bắt đầu hành trình</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1528' },
  topImage: { width: width, height: height * 0.58 },
  bottomCard: {
    position: 'absolute', bottom: 0, width: width, height: height * 0.48,
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 28,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 20 },
  stepRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-start' },
  stepBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginRight: 14, marginTop: 2 },
  stepBadgeText: { color: '#16A34A', fontWeight: '700', fontSize: 13 },
  stepTextContainer: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  stepDesc: { fontSize: 13, color: '#64748B', lineHeight: 18 },
  primaryButton: { backgroundColor: '#2D7F56', paddingVertical: 15, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
