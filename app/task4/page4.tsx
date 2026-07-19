import { useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function Task4Page4() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/images/onboarding/meo_task4_4.png')}
        style={styles.topImage}
        resizeMode="cover"
      />
      <View style={[styles.bottomCard, { height: height * 0.44, alignItems: 'center' }]}>
        <Text style={styles.celebrateTitle}>Tuyệt vời</Text>
        <Text style={styles.celebrateSub}>Bạn đã hoàn thành bước chuẩn bị cho một{"\n"}giấc ngủ ngon. Chúc bạn ngủ thật sâu nhé!</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statIcon}>📋</Text><Text style={styles.statVal}>4/5</Text><Text style={styles.statLbl}>Task hôm nay</Text></View>
          <View style={styles.statBox}><Text style={styles.statIcon}>🏅</Text><Text style={styles.statVal}>+6</Text><Text style={styles.statLbl}>Nhận thưởng</Text></View>
          <View style={styles.statBox}><Text style={styles.statIcon}>🔥</Text><Text style={styles.statVal}>03</Text><Text style={styles.statLbl}>Streak</Text></View>
        </View>

        <TouchableOpacity style={[styles.primaryButton, { width: '100%' }]} onPress={() => {
          alert('Hoàn thành trọn vẹn Task 4!'); 
          router.replace('/daily-tasks');
        }}>
          <Text style={styles.primaryButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => alert('Đã lưu tiến độ')}>
          <Text style={styles.secondaryButtonText}>Để sau</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1528' },
  topImage: { width: width, height: height * 0.58 },
  bottomCard: { position: 'absolute', bottom: 0, width: width, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 26 },
  celebrateTitle: { fontSize: 24, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
  celebrateSub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 16, lineHeight: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  statBox: { alignItems: 'center', backgroundColor: '#F8FAFC', paddingVertical: 10, borderRadius: 16, width: width * 0.27, borderWidth: 1, borderColor: '#F1F5F9' },
  statIcon: { fontSize: 20, marginBottom: 2 },
  statVal: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  statLbl: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  primaryButton: { backgroundColor: '#2D7F56', paddingVertical: 15, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryButton: { paddingVertical: 12, alignItems: 'center', width: '100%' },
  secondaryButtonText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
});