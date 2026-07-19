import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function Task3Page4() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/onboarding/meo_task3_3.png')}
                style={styles.background}
                resizeMode="cover"
            />

            <View style={styles.timerWrapper}>
                <View style={[styles.timerCircle, { borderColor: '#EAB308' }]}>
                    <Text style={[styles.timerText, { color: '#1E293B' }]}>30:00</Text>
                </View>
            </View>

            <View style={styles.timerBottomCard}>
                <View style={styles.orangeIconBadge}><Text style={{ fontSize: 20 }}>🚶</Text></View>
                <TouchableOpacity style={[styles.yellowButton, { backgroundColor: '#EAB308', marginTop: 16 }]} onPress={() => router.push('/(task3)/page5')}>
                    <Text style={styles.yellowButtonText}>Hoàn thành</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC' },
    timerWrapper: { position: 'absolute', top: height * 0.22, left: 0, right: 0, alignItems: 'center' },
    timerCircle: { width: 180, height: 180, borderRadius: 90, borderWidth: 8, borderColor: '#EAB308', backgroundColor: 'rgba(255, 255, 255, 0.85)', justifyContent: 'center', alignItems: 'center' },
    timerText: { fontSize: 34, fontWeight: '700', color: '#15803D' },
    timerBottomCard: { position: 'absolute', bottom: 0, width: width, height: height * 0.26, backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: 24, alignItems: 'center', paddingTop: 16 },
    orangeIconBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    yellowButton: { backgroundColor: '#F59E0B', width: '100%', paddingVertical: 14, borderRadius: 24, alignItems: 'center', marginBottom: 10 },
    yellowButtonText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
});