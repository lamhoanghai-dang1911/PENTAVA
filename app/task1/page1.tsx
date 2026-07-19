import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Page1() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/onboarding/meo_task1_1.jpg')} 
        style={styles.topImage} 
        resizeMode="cover"
      />
      <View style={styles.bottomCard}>
        <Text style={styles.title}>Hướng dẫn nhiệm vụ</Text>
        
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>1</Text></View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepTitle}>Xem món cần tránh</Text>
            <Text style={styles.stepDesc}>Kiểm tra danh sách thực phẩm bạn nên tránh trong hôm nay.</Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>2</Text></View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepTitle}>Đánh dấu đã tránh</Text>
            <Text style={styles.stepDesc}>Tick vào những món bạn đã tránh được để theo dõi tiến độ mỗi ngày.</Text>
          </View>
        </View>

        <View style={styles.stepRow}>
          <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>3</Text></View>
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepTitle}>Check-in bữa ăn</Text>
            <Text style={styles.stepDesc}>Chụp ảnh bữa ăn để ghi nhận thói quen ăn uống lành mạnh.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/task1/page2')}>
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
