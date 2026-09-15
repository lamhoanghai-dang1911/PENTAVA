import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function CameraPermissionFallback({ onRequestPermission }: { onRequestPermission: () => void }) {
  return (
    <View style={styles.centerFallback}>
      <Text style={styles.permissionText}>Cần cấp quyền truy cập Camera để tiếp tục</Text>
      <TouchableOpacity style={styles.reqBtn} onPress={onRequestPermission}>
        <Text style={styles.reqBtnText}>Cấp quyền</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centerFallback: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permissionText: { textAlign: 'center', marginBottom: 16 },
  reqBtn: { backgroundColor: '#2E7D32', padding: 16, borderRadius: 12 },
  reqBtnText: { color: '#fff' },
});
