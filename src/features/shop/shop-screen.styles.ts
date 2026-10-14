import { Design, FontFamily } from '@/src/constants/design';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAF7',
    flex: 1,
  },
  safeAreaNight: {
    backgroundColor: '#0B132B',
  },
  container: {
    flex: 1,
  },
  grid: {
    paddingBottom: 120, // Đảm bảo nội dung không bị che bởi Bottom Menu Bar
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  walletErrorRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  errorText: {
    color: '#B33A3A',
    fontFamily: FontFamily.beVietnamRegular,
    fontSize: Design.fontSize.caption,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorTextNight: {
    color: '#F87171',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    width: '100%',
  },
  emptyText: {
    color: Design.colors.mutedText,
    fontFamily: FontFamily.beVietnamRegular,
    paddingVertical: 36,
    textAlign: 'center',
    width: '100%',
  },
  emptyTextNight: {
    color: '#94A3B8',
  },
  retryButton: {
    backgroundColor: Design.colors.primaryGreen,
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  retryButtonText: {
    color: Design.colors.white,
    fontFamily: FontFamily.beVietnamMedium,
    fontSize: Design.fontSize.caption,
  },
});
