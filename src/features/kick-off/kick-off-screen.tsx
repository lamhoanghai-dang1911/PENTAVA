import { Design, FontFamily } from '@/src/constants/design';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Animated,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const APP_LOGO = require('../../../assets/images/pentava_icon.png');

export function KickOffScreen() {
  const router = useRouter();
  const [scaleAnim] = useState(() => new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      bounciness: 4,
      speed: 18,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      bounciness: 4,
      speed: 18,
    }).start();
  };

  const handleStart = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.container}>
      <StatusBar backgroundColor={Design.colors.white} barStyle="dark-content" />

      {/* Decorative background aura */}
      <View style={styles.decorativeBackground}>
        <View style={styles.glowCircle} />
      </View>

      <View style={styles.content}>
        {/* Center Logo & Branding */}
        <View style={styles.centerSection}>
          <View style={styles.logoCard}>
            <Image
              cachePolicy="memory-disk"
              contentFit="contain"
              source={APP_LOGO}
              style={styles.logoImage}
              transition={150}
            />
          </View>

          <Text style={styles.brandTitle}>PENTAVA</Text>
          {/* <Text style={styles.brandSubtitle}>
            Khởi đầu thói quen{'\n'}Nâng tầm cuộc sống
          </Text> */}

          {/* Core Pillars / Moodboard badges */}
          {/* <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.badgeHealth]}>
              <Text style={styles.badgeText}>🌿 Sức khỏe</Text>
            </View>
            <View style={[styles.badge, styles.badgeEnergy]}>
              <Text style={styles.badgeText}>⚡ Năng lượng</Text>
            </View>
            <View style={[styles.badge, styles.badgeCalm]}>
              <Text style={styles.badgeText}>🌊 Tĩnh tại</Text>
            </View>
          </View> */}
        </View>

        {/* Bottom CTA Button */}
        <View style={styles.bottomSection}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '100%' }}>
            <Pressable
              accessibilityLabel="Bắt đầu"
              accessibilityRole="button"
              onPress={handleStart}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.startButton}>
              <Text style={styles.startButtonText}>BẮT ĐẦU</Text>
            </Pressable>
          </Animated.View>

          {/* <Text style={styles.footerNote}>Phiên bản 1.0.0 • Đồng hành cùng bạn mỗi ngày</Text> */}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Design.colors.white,
  },
  decorativeBackground: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#F0F9F3',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingTop: 24,
    paddingBottom: 40,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCard: {
    width: 136,
    height: 136,
    borderRadius: 34,
    backgroundColor: Design.colors.white,
    shadowColor: '#3B8157',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 136,
    height: 136,
    borderRadius: 34,
  },
  brandTitle: {
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: 34,
    letterSpacing: 3,
    color: Design.colors.black,
    marginBottom: 8,
  },
  brandSubtitle: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 16,
    lineHeight: 24,
    color: Design.colors.mutedText,
    textAlign: 'center',
    marginBottom: 24,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeHealth: {
    backgroundColor: '#EAF8EF',
    borderColor: '#C3E6D0',
  },
  badgeEnergy: {
    backgroundColor: '#FFF8E6',
    borderColor: '#FFE29A',
  },
  badgeCalm: {
    backgroundColor: '#EEF6FF',
    borderColor: '#C2DCFF',
  },
  badgeText: {
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 12,
    color: Design.colors.black,
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
    paddingBottom: 8,
  },
  startButton: {
    width: '100%',
    height: 56,
    borderRadius: Design.borderRadius.button,
    backgroundColor: Design.colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Design.colors.primaryGreen,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  startButtonText: {
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 18,
    letterSpacing: 2,
    color: Design.colors.white,
  },
  footerNote: {
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
