import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Switch, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width, height } = Dimensions.get('window');

export default function Task4Page2() {
    const router = useRouter();
    const [isEnabled, setIsEnabled] = useState(true);

    const [time, setTime] = useState(new Date());

    const onChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setTime(selectedDate);
        }
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/onboarding/meo_task4_2.png')}
                style={styles.topImage}
                resizeMode="cover"
            />

            {/* Khung Time Picker giả lập Figma */}
            <View style={styles.pickerContainer}>
                <View style={styles.pickerHeader}>
                    <Text style={styles.pickerTitle}>ĐẶT GIỜ NGỦ</Text>
                    <Text style={styles.pickerIcon}>🕒</Text>
                </View>
                <DateTimePicker
                    value={time}
                    mode="time"
                    display="spinner"
                    is24Hour={true}
                    onChange={onChange}
                    textColor="#EAB308"
                    style={{
                        width: '100%',
                        height: 180,
                    }}
                />
            </View>

            <View style={styles.bottomCard}>
                <View style={styles.reminderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Text style={{ fontSize: 20, marginRight: 12 }}>🔔</Text>
                        <Text style={styles.reminderText}>Nhắc tôi 30 phút{"\n"}trước khi ngủ</Text>
                    </View>
                    <Switch
                        trackColor={{ false: '#E2E8F0', true: '#EAB308' }}
                        thumbColor={isEnabled ? '#FFFFFF' : '#F4F4F5'}
                        onValueChange={() => setIsEnabled(previousState => !previousState)}
                        value={isEnabled}
                    />
                </View>

                <TouchableOpacity style={styles.yellowButton} onPress={() => router.push('/(task4)/page3')}>
                    <Text style={styles.yellowButtonText}>Tạm dừng</Text>
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
    topImage: { width: width, height: height * 0.58 },
    pickerContainer: {
        position: 'absolute', top: height * 0.15, left: 32, right: 32,
        backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20,
        shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 4
    },
    pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    pickerTitle: { fontSize: 14, fontWeight: '700', color: '#2D7F56' },
    pickerIcon: { fontSize: 16 },
    timeWrapper: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10 },
    timeColumn: { alignItems: 'center', marginHorizontal: 20 },
    timeInactive: { fontSize: 16, color: '#CBD5E1', marginVertical: 4 },
    timeActive: { fontSize: 32, fontWeight: '700', color: '#EAB308', marginVertical: 2 },
    timeDivider: { fontSize: 32, fontWeight: '700', color: '#EAB308', marginHorizontal: 15, bottom: 2 },
    bottomCard: {
        position: 'absolute', bottom: 0, width: width, height: height * 0.30,
        backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32,
        paddingHorizontal: 24, paddingTop: 20, alignItems: 'center'
    },
    reminderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 20 },
    reminderText: { fontSize: 14, fontWeight: '600', color: '#1E293B', lineHeight: 20 },
    yellowButton: { backgroundColor: '#F59E0B', width: '100%', paddingVertical: 14, borderRadius: 24, alignItems: 'center', marginBottom: 10 },
    yellowButtonText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
    outlineButton: { width: '100%', paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' },
    outlineButtonText: { color: '#64748B', fontWeight: '500' },
});