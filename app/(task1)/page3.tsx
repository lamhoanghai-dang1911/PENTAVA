import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Page3() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/onboarding/meo_task1_2.jpg')} 
        style={styles.topImage} 
        resizeMode="cover"
      />
      <View style={[styles.bottomCard, styles.celebrateCard]}>
        <Text style={styles.celebrateTitle}>Tuyệt vời</Text>
        <Text style={styles.celebrateSub}>Bạn đã tránh được thực phẩm siêu chế biến hôm nay</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statIcon}>📋</Text><Text style={styles.statVal}>4/5</Text><Text style={styles.statLbl}>Tuân thủ</Text></View>
          <View style={styles.statBox}><Text style={styles.statIcon}>🏅</Text><Text style={styles.statVal}>+6</Text><Text style={styles.statLbl}>Huy chương</Text></View>
          <View style={styles.statBox}><Text style={styles.statIcon}>🔥</Text><Text style={styles.statVal}>03</Text><Text style={styles.statLbl}>Streaks</Text></View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/page4')}>
          <Text style={styles.primaryButtonText}>Chụp ảnh check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => alert('Đã lưu tiến độ!')}>
          <Text style={styles.secondaryButtonText}>Để sau</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FA' },
  topImage: { width: width, height: height * 0.55 },
  bottomCard: { position: 'absolute', bottom: 0, width: width, height: height * 0.52, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 32 },
  celebrateCard: { height: height * 0.45, alignItems: 'center' },
  celebrateTitle: { fontSize: 24, fontWeight: '700', color: '#111827', textAlign: 'center' },
  celebrateSub: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 24 },
  statBox: { alignItems: 'center', backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, width: width * 0.26, borderWidth: 1, borderColor: '#F1F5F9' },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statVal: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  statLbl: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  primaryButton: { backgroundColor: '#2E7D32', paddingVertical: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'center', width: '100%' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryButton: { paddingVertical: 14, alignItems: 'center', marginTop: 8, width: '100%' },
  secondaryButtonText: { color: '#6B7280', fontSize: 15, fontWeight: '500' },
});