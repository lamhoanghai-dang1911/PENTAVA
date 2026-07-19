import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Task4Page3() {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(1799); // 29 phút 59 giây

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (timeInSeconds: number) => {
    const mins = Math.floor(timeInSeconds / 60);
    const secs = timeInSeconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/onboarding/meo_task4_1.png')} 
        style={StyleSheet.absoluteFillObject} 
        resizeMode="cover"
      />
      
      {/* Khung Text Chữ Lớn Figma Ở Giữa */}
      <View style={styles.countdownCenterWrapper}>
        <Text style={styles.countdownHeaderLabel}>SẼ BẮT ĐẦU SAU</Text>
        <Text style={styles.countdownTimerText}>{formatTime(secondsLeft)}</Text>
      </View>

      <View style={styles.bottomCard}>
        <View style={styles.moonBadge}><Text style={{ fontSize: 22 }}>🌙</Text></View>
        <Text style={styles.bottomStatusText}>Hẹn gặp bạn vào một ngày mới{"\n"}tràn đầy năng lượng.</Text>
        
        <TouchableOpacity style={styles.yellowButton} onPress={() => router.push('/task4/page4')}>
          <Text style={styles.yellowButtonText}>Bắt đầu ngay</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.outlineButton} onPress={() => router.back()}>
          <Text style={styles.outlineButtonText}>Rời khỏi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B1528' },
  countdownCenterWrapper: { position: 'absolute', top: height * 0.32, left: 0, right: 0, alignItems: 'center' },
  countdownHeaderLabel: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', letterSpacing: 1, marginBottom: 4 },
  countdownTimerText: { fontSize: 52, fontWeight: '800', color: '#EAB308' },
  bottomCard: {
    position: 'absolute', bottom: 0, width: width, height: height * 0.32,
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    paddingHorizontal: 24, paddingTop: 16, alignItems: 'center'
  },
  moonBadge: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  bottomStatusText: { fontSize: 13, color: '#64748B', textAlign: 'center', marginBottom: 18, lineHeight: 18 },
  yellowButton: { backgroundColor: '#F59E0B', width: '100%', paddingVertical: 14, borderRadius: 24, alignItems: 'center', marginBottom: 10 },
  yellowButtonText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  outlineButton: { width: '100%', paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' },
  outlineButtonText: { color: '#64748B', fontWeight: '500' },
});
