import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type CameraPermissionFallbackProps = {
  canAskAgain?: boolean;
  onRequestPermission: () => void;
};

export function CameraPermissionFallback({
  canAskAgain = true,
  onRequestPermission,
}: CameraPermissionFallbackProps) {
  const isPermanentlyDenied = !canAskAgain;

  const handlePress = () => {
    if (isPermanentlyDenied) {
      void Linking.openSettings();
    } else {
      onRequestPermission();
    }
  };

  return (
    <View style={styles.centerFallback}>
      <Text style={styles.titleText}>Quyền truy cập Camera</Text>
      <Text style={styles.permissionText}>
        {isPermanentlyDenied
          ? 'Bạn đã từ chối cấp quyền Camera cho Pentava. Vui lòng mở Cài đặt thiết bị và bật quyền Camera để chụp ảnh checkin nhiệm vụ.'
          : 'Pentava cần quyền truy cập Camera để bạn có thể chụp ảnh checkin và hoàn thành nhiệm vụ.'}
      </Text>
      <TouchableOpacity
        accessibilityLabel={isPermanentlyDenied ? 'Mở cài đặt ứng dụng' : 'Cấp quyền máy ảnh'}
        accessibilityRole="button"
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.reqBtn}
      >
        <Text style={styles.reqBtnText}>
          {isPermanentlyDenied ? 'Mở Cài đặt thiết bị' : 'Cấp quyền Camera'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centerFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    maxWidth: 320,
  },
  reqBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  reqBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
