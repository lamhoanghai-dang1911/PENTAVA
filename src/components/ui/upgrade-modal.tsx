import { Design, FontFamily } from '@/src/constants/design';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

export type UpgradeModalProps = {
  visible: boolean;
  title?: string;
  featureName: string;
  description?: string;
  requiredPlanName?: string;
  onClose: () => void;
};

export function UpgradeModal({
  visible,
  title = 'Tính Năng Dành Cho Hội Viên',
  featureName,
  description,
  requiredPlanName = 'Gold & Premium',
  onClose,
}: UpgradeModalProps) {
  const router = useRouter();

  if (!visible) return null;

  const handleUpgrade = () => {
    onClose();
    router.push('/membership');
  };

  return (
    <Modal
      animationType="none"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <Animated.View
        entering={FadeIn.duration(180)}
        exiting={FadeOut.duration(150)}
        style={styles.overlay}
      >
        <Animated.View
          accessibilityRole="alert"
          entering={ZoomIn.springify().damping(16).stiffness(280)}
          style={styles.card}
        >
          {/* VIP Badge Header Icon */}
          <View style={styles.iconCircle}>
            <Ionicons color="#D97706" name="sparkles" size={32} />
          </View>

          <View style={styles.vipTag}>
            <Text style={styles.vipTagText}>VIP FEATURE</Text>
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.featureName}>{featureName}</Text>

          <Text style={styles.message}>
            {description ||
              `Tính năng này chỉ dành riêng cho các thành viên đã nâng cấp gói ${requiredPlanName}. Hãy nâng cấp gói ngay để mở khóa toàn bộ quyền lợi đặc quyền!`}
          </Text>

          <View style={styles.buttonGroup}>
            <Pressable
              accessibilityRole="button"
              onPress={handleUpgrade}
              style={({ pressed }) => [
                styles.upgradeButton,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <Ionicons color="#FFFFFF" name="diamond-outline" size={18} />
              <Text style={styles.upgradeButtonText}>Nâng Cấp Gói Ngay</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [
                styles.cancelButton,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Text style={styles.cancelButtonText}>Để Sau</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FEF3C7',
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  vipTag: {
    backgroundColor: '#FFC857',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#000000',
    marginBottom: 10,
  },
  vipTagText: {
    fontFamily: FontFamily.poppinsSemiBold,
    fontSize: 11,
    color: '#000000',
    letterSpacing: 0.5,
  },
  title: {
    color: '#000000',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 6,
  },
  featureName: {
    color: '#3A8157',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    color: '#6B7280',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonGroup: {
    width: '100%',
    gap: 10,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3A8157',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 16,
    paddingVertical: 13,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontFamily: FontFamily.beVietnamSemiBold,
    fontSize: 14,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  cancelButtonText: {
    color: '#6B7280',
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: 13,
  },
});
