import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const EXERCISE_ITEMS = ['Giãn cơ nhẹ nhàng', 'Đi bộ thư giãn', 'Tập luyện nhanh 10 phút', 'Yoga & hít thở'];

export default function Task3Page2() {
  const router = useRouter();
  const [selectedExercise, setSelectedExercise] = useState<string>('Đi bộ thư giãn');

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/onboarding/meo_task3_2.png')} 
        style={styles.topImage} 
        resizeMode="cover"
      />
      <View style={[styles.bottomCard, { height: height * 0.48 }]}>
        <Text style={[styles.title, { textAlign: 'center', fontSize: 20 }]}>Hôm nay bạn muốn{"\n"}vận động kiểu gì</Text>
        
        {EXERCISE_ITEMS.map((item, idx) => (
          <TouchableOpacity 
            key={idx} 
            style={[styles.radioItem, selectedExercise === item && styles.radioItemActive]}
            onPress={() => setSelectedExercise(item)}
          >
            <Text style={styles.radioText}>{item}</Text>
            <View style={[styles.radioCircle, selectedExercise === item && styles.radioCircleActive]}>
              {selectedExercise === item && <Text style={styles.radioCheckmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/(task3)/page3')}>
          <Text style={styles.primaryButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  topImage: { width: width, height: height * 0.56 },
  bottomCard: { position: 'absolute', bottom: 0, width: width, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, paddingTop: 28 },
  title: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 20 },
  radioItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, marginBottom: 10, backgroundColor: '#F8FAFC' },
  radioItemActive: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  radioText: { fontSize: 15, color: '#334155', fontWeight: '500' },
  radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center' },
  radioCircleActive: { borderColor: '#16A34A', backgroundColor: '#16A34A' },
  radioCheckmark: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  primaryButton: { backgroundColor: '#15803D', paddingVertical: 15, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});