import type { ReactNode } from 'react';
import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');
export const cameraFrameAspectRatio = 4 / 5;
export const cameraFrameWidth = width * 1.0;
export const cameraFrameHeight = cameraFrameWidth / cameraFrameAspectRatio;

export type TaskCameraScaffoldProps = {
  background: ReactNode;
  footer: ReactNode;
  headerRight?: ReactNode;
  onBack: () => void;
  onCameraLayout?: (layout: { x: number; y: number; width: number; height: number }) => void;
  onFrameLayout?: (layout: { x: number; y: number; width: number; height: number }) => void;
};

export function TaskCameraScaffold({
  background,
  footer,
  headerRight,
  onBack,
  onCameraLayout,
  onFrameLayout,
}: TaskCameraScaffoldProps) {
  const cameraRef = React.useRef<View>(null);
  const frameRef = React.useRef<View>(null);
  const [rootOrigin, setRootOrigin] = React.useState({ x: 0, y: 0 });
  const [frameRect, setFrameRect] = React.useState({
    x: (width - cameraFrameWidth) / 2,
    y: (height - cameraFrameHeight) / 2,
    width: cameraFrameWidth,
    height: cameraFrameHeight,
  });

  const measureFrame = () => {
    frameRef.current?.measureInWindow((x, y, measuredWidth, measuredHeight) => {
      const measuredFrame = { x, y, width: measuredWidth, height: measuredHeight };
      setFrameRect(measuredFrame);
      onFrameLayout?.(measuredFrame);
    });
  };

  return (
    <View
      ref={cameraRef}
      onLayout={(event) => {
        const { width: layoutWidth, height: layoutHeight } = event.nativeEvent.layout;
        cameraRef.current?.measureInWindow((x, y) => {
          setRootOrigin({ x, y });
          onCameraLayout?.({ x, y, width: layoutWidth, height: layoutHeight });
        });
      }}
      style={cameraStyles.cameraContainer}>
        {/* bo góc khúc này */}
      <View style={[StyleSheet.absoluteFill, cameraStyles.cameraOverlayContainer]} onLayout={measureFrame}>
        {background}
      </View>
      {/* <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[cameraStyles.maskTop, { height: Math.max(0, frameRect.y - rootOrigin.y) }]} />
        <View
          style={[
            cameraStyles.maskSide,
            {
              top: frameRect.y - rootOrigin.y,
              bottom: Math.max(0, height - (frameRect.y - rootOrigin.y) - frameRect.height),
              width: Math.max(0, frameRect.x - rootOrigin.x),
            },
          ]}
        />
        <View
          style={[
            cameraStyles.maskSide,
            {
              top: frameRect.y - rootOrigin.y,
              right: 0,
              bottom: Math.max(0, height - (frameRect.y - rootOrigin.y) - frameRect.height),
              left: frameRect.x - rootOrigin.x + frameRect.width,
            },
          ]}
        />
        <View
          style={[
            cameraStyles.maskBottom,
            {
              top: frameRect.y - rootOrigin.y + frameRect.height,
              height: Math.max(0, height - (frameRect.y - rootOrigin.y) - frameRect.height),
            },
          ]}
        />
      </View> */}
      <SafeAreaView style={cameraStyles.overlay}>
        <View style={cameraStyles.headerRow}>
          <TouchableOpacity style={cameraStyles.camBack} onPress={onBack}>
            <Text style={cameraStyles.camBackText}>❮</Text>
          </TouchableOpacity>
          {headerRight ?? <View style={cameraStyles.headerSpacer} />}
        </View>
        {/* <View
          onLayout={measureFrame}
          style={cameraStyles.cameraOverlayContainer}>
          <View ref={frameRef} style={cameraStyles.cameraFrame} />
        </View> */}
        {footer}
      </SafeAreaView>
    </View>
  );
}

export const cameraStyles = StyleSheet.create({
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  backgroundLayer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { flex: 1, justifyContent: 'space-between' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 20 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerSpacer: { width: 40, height: 40 },
  camBack: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  camBackText: { color: '#FFF', fontSize: 18 },
  cameraOverlayContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cameraFrame: { width: cameraFrameWidth, height: cameraFrameHeight, borderWidth: 4, borderColor: '#FFFFFF', borderRadius: 24 },
  maskTop: { position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: '#000' },
  maskSide: { position: 'absolute', backgroundColor: '#000' },
  maskBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#000' },
  flipButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  flipButtonText: { color: '#FFF', fontSize: 22, fontWeight: '700' },
  zoomControls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 14 },
  zoomButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.65)' },
  disabledControl: { opacity: 0.4 },
  zoomButtonText: { color: '#FFF', fontSize: 22, lineHeight: 24 },
  zoomLabel: { minWidth: 48, color: '#FFF', fontSize: 14, fontWeight: '600', textAlign: 'center' },
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
