import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const { height } = Dimensions.get('window');

const TOTAL_SECONDS = 30 * 60;

export default function Task3Page3() {
    const router = useRouter();

    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(true);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setSeconds((prev) => {
                    if (prev >= TOTAL_SECONDS) {
                        clearInterval(timerRef.current!);
                        return TOTAL_SECONDS;
                    }
                    return prev + 1;
                });
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning]);

    const formatTime = () => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('../../assets/images/onboarding/meo_task3_3.png')}
                style={styles.background}
                resizeMode="cover"
            />

            <View style={styles.timerWrapper}>
                <View style={styles.progressContainer}>
                    <AnimatedCircularProgress
                        size={190}
                        width={8}
                        fill={(seconds / TOTAL_SECONDS) * 100}
                        tintColor="#EAB308"
                        backgroundColor="#FDE68A"
                        rotation={0}
                        lineCap="round"
                    >
                        {() => (
                            <View style={styles.timerContent}>
                                <Text style={styles.timerText}>{formatTime()}</Text>

                                <TouchableOpacity
                                    style={styles.skipTickButton}
                                    onPress={() => {
                                        if (timerRef.current) clearInterval(timerRef.current);
                                        router.push('/task3/page4');
                                    }}
                                >
                                    <Text style={styles.skipTickIcon}>✓</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </AnimatedCircularProgress>
                </View>
            </View>

            <View style={styles.timerBottomCard}>
                <View style={styles.orangeIconBadge}>
                    <Text style={{ fontSize: 20 }}>🚶</Text>
                </View>

                <TouchableOpacity
                    style={styles.yellowButton}
                    onPress={() => setIsRunning(!isRunning)}
                >
                    <Text style={styles.yellowButtonText}>
                        {isRunning ? 'Tạm dừng' : 'Tiếp tục'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.outlineButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.outlineButtonText}>Rời khỏi</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },

    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        left: 0,
        top: 0,
    },

    timerWrapper: {
        position: 'absolute',
        top: height * 0.22,
        left: 0,
        right: 0,
        alignItems: 'center',
    },

    progressContainer: {
        width: 190,
        height: 190,
        justifyContent: 'center',
        alignItems: 'center',
    },

    timerContent: {
        width: 174,
        height: 174,
        borderRadius: 87,
        backgroundColor: 'rgba(255,255,255,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    timerText: {
        fontSize: 34,
        fontWeight: '700',
        color: '#15803D',
    },

    skipTickButton: {
        position: 'absolute',
        bottom: 22,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#15803D',
        justifyContent: 'center',
        alignItems: 'center',
    },

    skipTickIcon: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 16,
    },

    timerBottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: height * 0.26,
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 16,
        alignItems: 'center',
    },

    orangeIconBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FEF3C7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },

    yellowButton: {
        backgroundColor: '#F59E0B',
        width: '100%',
        paddingVertical: 14,
        borderRadius: 24,
        alignItems: 'center',
        marginBottom: 10,
    },

    yellowButtonText: {
        color: '#FFF',
        fontWeight: '600',
        fontSize: 15,
    },

    outlineButton: {
        width: '100%',
        paddingVertical: 12,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#CBD5E1',
        alignItems: 'center',
    },

    outlineButtonText: {
        color: '#64748B',
        fontWeight: '500',
    },
});
