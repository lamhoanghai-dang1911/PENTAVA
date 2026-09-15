import type { ReactNode } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

export type TaskCameraScaffoldProps = {
  background: ReactNode;
  footer: ReactNode;
  headerRight?: ReactNode;
  onBack: () => void;
};

export function TaskCameraScaffold({
  background,
  footer,
  headerRight,
  onBack,
}: TaskCameraScaffoldProps) {
  return (
    <View style={cameraStyles.cameraContainer}>
      {background}
      <SafeAreaView style={cameraStyles.overlay}>
        <View style={cameraStyles.headerRow}>
          <TouchableOpacity style={cameraStyles.camBack} onPress={onBack}>
            <Text style={cameraStyles.camBackText}>❮</Text>
          </TouchableOpacity>
          {headerRight ?? <View style={cameraStyles.headerSpacer} />}
        </View>
        <View style={cameraStyles.cameraOverlayContainer}>
          <View style={cameraStyles.cameraFrame} />
        </View>
        {footer}
      </SafeAreaView>
    </View>
  );
}

export const cameraStyles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 },
  headerSpacer: { width: 40, height: 40 },
  camBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  camBackText: { color: '#FFF', fontSize: 18 },
  cameraOverlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraFrame: { width: width * 0.75, height: height * 0.45, borderWidth: 4, borderColor: '#FFFFFF', borderRadius: 24 },
  flipButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  flipButtonText: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  cameraActions: { paddingBottom: 40, alignItems: 'center' },
  uploadBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  uploadText: { color: '#FFF', fontSize: 13 },
  captureOuter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  captureInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF' },
  finalActionsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingBottom: 40 },
  retakeBtn: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', paddingVertical: 16, borderRadius: 24, marginRight: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' },
  retakeText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  usePhotoBtn: { flex: 1, backgroundColor: '#34A853', paddingVertical: 16, borderRadius: 24, marginLeft: 12, alignItems: 'center' },
  usePhotoText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  emptyPreview: { backgroundColor: '#222' },
});
