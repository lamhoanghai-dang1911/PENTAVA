import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Task3Page5() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/onboarding/meo_task3_5.png')} 
        style={styles.topImage} 
        resizeMode="cover"
      />
      <View style={[styles.bottomCard, { height: height * 0.45, alignItems: 'center' }]}>
        <Text style={styles.celebrateTitle}>Quá giỏi luôn!</Text>
        <Text style={styles.celebrateSub}>Một bước nhỏ hôm nay, một cơ thể{"\n"}khỏe hơn mỗi ngày.</Text>
        
        <View style={styles.statsRow}>
          <View style={styles.statBox}><Text style={styles.statIcon}>📋</Text><Text style={styles.statVal}>4/5</Text><Text style={styles.statLbl}>Task hôm nay</Text></View>
          <View style={styles.statBox}><Text style={styles.statIcon}>🏅</Text><Text style={styles.statVal}>+6</Text><Text style={styles.statLbl}>Nhận thưởng</Text></View>
          <View style={styles.statBox}><Text style={styles.statIcon}>🔥</Text><Text style={styles.statVal}>03</Text><Text style={styles.statLbl}>Streak</Text></View>
        </View>

        <TouchableOpacity style={[styles.primaryButton, { width: '100%' }]} onPress={() => router.push('/task3/page6')}>
          <Text style={styles.primaryButtonText}>Chụp ảnh check-in</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => alert('Đã lưu tiến trình')}>
          <Text style={styles.secondaryButtonText}>Để sau</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topImage: { width: width, height: height * 0.56 },
  bottomCard: { position: 'absolute', bottom: 0, width: width, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 28 },
  celebrateTitle: { fontSize: 24, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
  celebrateSub: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 16, lineHeight: 18 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 20 },
  statBox: { alignItems: 'center', backgroundColor: '#F8FAFC', paddingVertical: 10, borderRadius: 16, width: width * 0.27, borderWidth: 1, borderColor: '#F1F5F9' },
  statIcon: { fontSize: 20, marginBottom: 2 },
  statVal: { fontSize: 15, fontWeight: '700', color: '#1E293B' },
  statLbl: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  primaryButton: { backgroundColor: '#15803D', paddingVertical: 15, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  secondaryButton: { paddingVertical: 12, alignItems: 'center', width: '100%' },
  secondaryButtonText: { color: '#64748B', fontSize: 14, fontWeight: '500' },
});
