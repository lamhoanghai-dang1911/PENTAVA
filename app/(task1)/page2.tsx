import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const FOOD_ITEMS = ['Thức ăn nhanh', 'Nước ngọt có ga', 'Kẹo ngọt', 'Khoai tây chiên', 'Thịt chế biến sẵn', 'Bánh ngọt'];

export default function Page2() {
  const router = useRouter();
  const [selectedFoods, setSelectedFoods] = useState<string[]>([]);

  const toggleFood = (food: string) => {
    if (selectedFoods.includes(food)) {
      setSelectedFoods(selectedFoods.filter(item => item !== food));
    } else {
      setSelectedFoods([...selectedFoods, food]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backArrow}>❮</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
        <Text style={styles.page2Title}>Tránh thực phẩm{"\n"}siêu chế biến</Text>
        <Text style={styles.page2Sub}>{selectedFoods.length}/6 loại đã tránh</Text>
        
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${(selectedFoods.length / 6) * 100}%` }]} />
        </View>

        {FOOD_ITEMS.map((food, index) => (
          <TouchableOpacity key={index} style={styles.foodItem} onPress={() => toggleFood(food)} activeOpacity={0.7}>
            <Text style={styles.foodText}>{food}</Text>
            <View style={[styles.checkbox, selectedFoods.includes(food) && styles.checkboxChecked]}>
              {selectedFoods.includes(food) && <Text style={styles.checkboxCheckmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.bottomFixedBtn}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.push('/page3')}>
          <Text style={styles.primaryButtonText}>Tiếp tục</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  backArrow: { fontSize: 22, color: '#2E7D32' },
  page2Title: { fontSize: 26, fontWeight: '700', color: '#111827', lineHeight: 34, marginTop: 10 },
  page2Sub: { fontSize: 14, color: '#6B7280', marginTop: 8 },
  progressBarBg: { height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, marginTop: 12, marginBottom: 28 },
  progressBarFill: { height: '100%', backgroundColor: '#34A853', borderRadius: 3 },
  foodItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, marginBottom: 12, backgroundColor: '#FAFAFA' },
  foodText: { fontSize: 16, fontWeight: '500', color: '#374151' },
  checkbox: { width: 22, height: 22, borderWidth: 2, borderColor: '#D1D5DB', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  checkboxChecked: { backgroundColor: '#34A853', borderColor: '#34A853' },
  checkboxCheckmark: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  bottomFixedBtn: { position: 'absolute', bottom: 30, left: 24, right: 24, backgroundColor: '#fff' },
  primaryButton: { backgroundColor: '#2E7D32', paddingVertical: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});