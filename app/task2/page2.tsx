import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function Page2() {
    const router = useRouter();
    const [count, setCount] = useState(0); // State đếm số khẩu phần

    // Cấu hình tính toán vòng tròn tiến độ SVG
    const size = 200;
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius; // Chu vi
    const strokeDashoffset = circumference - (count / 5) * circumference; // Đoạn viền vàng cần hiển thị

    const handleIncrement = () => {
        if (count < 5) {
            setCount(prev => prev + 1);
        }
    };

    const handleFinish = () => {
        router.push('/task2/page3'); // FIX 2: Sửa từ page1 thành page3 theo đúng yêu cầu
    };

    return (
        <View style={styles.container}>
            {/* Nút Back quay lại page1 */}
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>

            {/* Hình ảnh con mèo */}
            <Image
                source={require('../../assets/images/onboarding/meo_task2_2.png')}
                style={styles.catImage}
                resizeMode="contain"
            />

            {/* Badge phân loại */}
            <View style={styles.badge}>
                <Text style={styles.badgeText}>Sức khỏe</Text>
            </View>

            <Text style={styles.title}>Rau củ</Text>
            <Text style={styles.subtitle}>Duy trì cơ thể đủ chất để khỏe mạnh hơn</Text>

            {/* FIX 3: Thay thế View cũ bằng Svg chạy tiến độ tăng dần */}
            <View style={styles.circleContainer}>
                <Svg width={size} height={size}>
                    {/* Vòng nền xám ẩn dưới */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#E5E7EB"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Vòng tiến độ màu vàng chạy động dựa theo strokeDashoffset */}
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#F2C438"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        origin={`${size / 2}, ${size / 2}`}
                        rotation="-90" // Xoay để thanh chạy bắt đầu từ đỉnh trên cùng
                    />
                </Svg>

                {/* Text lồng vào giữa vòng tròn */}
                <View style={styles.textContainer}>
                    <Text style={styles.progressText}>{count}/5</Text>
                    <Text style={styles.progressSubtext}>khẩu phần</Text>
                </View>
            </View>

            {/* Khối điều khiển nút bấm */}
            <View style={styles.bottomContainer}>
                {count < 5 ? (
                    // Nút Dấu Cộng khi chưa đủ 5
                    <TouchableOpacity style={styles.addButton} onPress={handleIncrement} activeOpacity={0.8}>
                        <Text style={styles.addButtonText}>+</Text>
                    </TouchableOpacity>
                ) : (
                    // Nút Hoàn Thành khi đã đủ 5
                    <TouchableOpacity style={styles.finishButton} onPress={handleFinish} activeOpacity={0.8}>
                        <Text style={styles.finishButtonText}>Hoàn thành</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF', alignItems: 'center', paddingTop: 60 },
    backButton: { position: 'absolute', top: 50, left: 24, padding: 8 },
    backText: { fontSize: 36, color: '#2E7D32', fontWeight: '300' },
    catImage: { width: 150, height: 150, marginBottom: 16 },
    badge: { backgroundColor: '#2E7D32', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
    badgeText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
    title: { fontSize: 28, fontWeight: '700', color: '#2E7D32', marginBottom: 8 },
    subtitle: { fontSize: 14, color: '#4B5563', textAlign: 'center', paddingHorizontal: 40, marginBottom: 40 },

    // CSS mới cho vùng SVG và Chữ đồng tâm
    circleContainer: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
    textContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center' },
    progressText: { fontSize: 36, fontWeight: '700', color: '#2E7D32' },
    progressSubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 4 },

    bottomContainer: { position: 'absolute', bottom: 50, width: width, alignItems: 'center', paddingHorizontal: 24 },
    addButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F2C438', justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
    addButtonText: { fontSize: 32, color: '#2E7D32', fontWeight: '600' },

    finishButton: { backgroundColor: '#2E7D32', width: '100%', paddingVertical: 16, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    finishButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' }
});